import {DataFactory} from "rdf-data-factory";
import * as RDF from "@rdfjs/types";
import {Transform} from "readable-stream";
import {JsonEvent, JsonStreamPathTransformer, JsonEventParser, IQueryResult, JsonValue} from "json-event-parser";

/**
 * Parser for the SPARQL 1.1 Query Results JSON format.
 * @see https://www.w3.org/TR/sparql11-results-json/
 */
export class SparqlJsonParser {

  private readonly dataFactory: RDF.DataFactory;
  private readonly prefixVariableQuestionMark?: boolean;
  private readonly suppressMissingStreamResultsError: boolean;

  constructor(settings?: ISettings) {
    settings = settings || {};
    this.dataFactory = settings.dataFactory || new DataFactory();
    this.prefixVariableQuestionMark = !!settings.prefixVariableQuestionMark;
    this.suppressMissingStreamResultsError = settings.suppressMissingStreamResultsError ?? true;
  }

  /**
   * Convert a SPARQL JSON bindings response to an array of bindings objects.
   * @param sparqlResponse A SPARQL JSON response.
   * @return {IBindings[]} An array of bindings.
   */
  public parseJsonResults(sparqlResponse: any): IBindings[] {
    return sparqlResponse.results.bindings.map((rawBindings: any) => this.parseJsonBindings(rawBindings));
  }

  /**
   * Convert a SPARQL JSON bindings response stream to a stream of bindings objects.
   *
   * The bindings stream will emit a 'variables' event that will contain
   * the array of variables (as RDF.Variable[]), as defined in the response head.
   *
   * @param {NodeJS.ReadableStream} sparqlResponseStream A SPARQL JSON response stream.
   * @return {NodeJS.ReadableStream} A stream of bindings.
   */
  public parseJsonResultsStream(sparqlResponseStream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    const errorListener = (error: Error) => resultStream.emit('error', error);
    let variablesFound = false;
    let resultsFound = false;
    const parser = this;
    const resultStream = sparqlResponseStream
        .on('error', errorListener)
        .pipe(new JsonEventParser())
        .on('error', errorListener)
        .pipe(new JsonStreamPathTransformer([
          {id: 'vars', query: ['head', 'vars'], returnContent: true},
          {id: 'bindings', query: ['results', 'bindings'], returnContent: false},
          {id: 'binding', query: ['results', 'bindings', null], returnContent: true},
          {id: 'metadata', query: ['metadata'], returnContent: true},
        ]))
        .on('error', errorListener)
        .pipe(
        new Transform({
          writableObjectMode: true,
          readableObjectMode: true,
          transform(result: IQueryResult, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
            try {
              switch (result.query) {
              case 'vars':
                variablesFound = true;
                this.emit('variables', parser.parseVariableList(result.value));
                break;
              case 'bindings':
                resultsFound = true;
                break;
              case 'binding':
                this.push(parser.parseJsonBindings(result.value));
                break;
              case 'metadata':
                this.emit('metadata', result.value);
              }
              callback();
            } catch (e: any) {
              callback(e);
            }
          },
          flush(callback: (error?: Error | null, data?: any) => void): void {
            if (!resultsFound && !this.suppressMissingStreamResultsError) {
              callback(new Error("No valid SPARQL query results were found."));
              return;
            }
            if (!variablesFound) {
              this.emit('variables', []);
            }
            callback();
          }
        })
    );
    return resultStream;
  }

  /**
   * Convert a SPARQL JSON result binding to a bindings object.
   * @param rawBindings A SPARQL JSON result binding.
   * @return {IBindings} A bindings object.
   */
  public parseJsonBindings(rawBindings: any): IBindings {
    const bindings: IBindings = {};
    for (const key in rawBindings) {
      const rawValue: any = rawBindings[key];
      let value: RDF.Term = null;
      switch (rawValue.type) {
      case 'bnode':
        value = this.dataFactory.blankNode(rawValue.value);
        break;
      case 'literal':
        if (rawValue['xml:lang']) {
          value = this.dataFactory.literal(rawValue.value, rawValue['xml:lang']);
        } else if (rawValue.datatype) {
          value = this.dataFactory.literal(rawValue.value, this.dataFactory.namedNode(rawValue.datatype));
        } else {
          value = this.dataFactory.literal(rawValue.value);
        }
        break;
      case 'typed-literal':
        // Virtuoso uses this non-spec-compliant way of defining typed literals
        value = this.dataFactory.literal(rawValue.value, this.dataFactory.namedNode(rawValue.datatype));
        break;
      default:
        value = this.dataFactory.namedNode(rawValue.value);
        break;
      }
      bindings[this.prefixVariableQuestionMark ? ('?' + key) : key] = value;
    }
    return bindings;
  }

  /**
   * Convert a SPARQL JSON boolean response to a boolean.
   * This will throw an error if the given reponse was not a valid boolean response.
   * @param sparqlResponse A SPARQL JSON response.
   * @return {IBindings[]} An array of bindings.
   */
  public parseJsonBoolean(sparqlResponse: any): boolean {
    if ('boolean' in sparqlResponse) {
      return sparqlResponse.boolean;
    }
    throw new Error('No valid ASK response was found.');
  }

  /**
   * Convert a SPARQL JSON boolean response stream to a promise resolving to a boolean.
   * This will reject if the given reponse was not a valid boolean response.
   * @param {NodeJS.ReadableStream} sparqlResponseStream A SPARQL JSON response stream.
   * @return {Promise<boolean>} The response boolean.
   */
  public parseJsonBooleanStream(sparqlResponseStream: NodeJS.ReadableStream): Promise<boolean> {
    return new Promise((resolve, reject) => {
      sparqlResponseStream
          .on('error', reject)
          .pipe(new JsonEventParser())
          .on('error', reject)
          .on('data', (event: JsonEvent) => {
            if(event.type === 'value' && event.key === 'boolean' && typeof event.value === 'boolean') {
              resolve(event.value);
            }
          })
          .on('end', () => reject(new Error('No valid ASK response was found.')));
    });
  }

  private parseVariableList(variables: JsonValue): RDF.Variable[] {
    if(!Array.isArray(variables)) {
      throw new Error("The variable list should be an array");
    }
    return variables.map(v => {
      if(typeof v === "string") {
        return this.dataFactory.variable(v);
      } else {
        throw new Error("Variable names should be strings");
      }
    });
  }
}

/**
 * Constructor settings object interface for {@link SparqlJsonParser}.
 */
export interface ISettings {
  /**
   * A custom datafactory.
   */
  dataFactory?: RDF.DataFactory;
  /**
   * If variable names should be prefixed with a quotation mark.
   */
  prefixVariableQuestionMark?: boolean;
  /**
   * If the error about missing results in a result stream should be suppressed.
   */
  suppressMissingStreamResultsError?: boolean;
}

/**
 * A bindings object.
 */
export interface IBindings {
  [key: string]: RDF.Term;
}

