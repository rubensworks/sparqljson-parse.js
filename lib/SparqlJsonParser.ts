import {DataFactory} from "rdf-data-factory";
import * as RDF from "@rdfjs/types";
import {Transform} from "readable-stream";

// tslint:disable-next-line:no-var-requires
const JsonParser = require('@bergos/jsonparse');

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
    sparqlResponseStream.on('error', errorListener);

    const jsonParser = new JsonParser();
    jsonParser.onError = errorListener;
    let variablesFound = false;
    let resultsFound = false;
    jsonParser.onValue = (value: any) => {
      if(jsonParser.key === "vars" && jsonParser.stack.length === 2 && jsonParser.stack[1].key === 'head') {
        resultStream.emit('variables', value.map((v: string) => this.dataFactory.variable(v)));
        variablesFound = true;
      } else if(jsonParser.key === "results" && jsonParser.stack.length === 1) {
        resultsFound = true;
      } else if(typeof jsonParser.key === 'number' && jsonParser.stack.length === 3 && jsonParser.stack[1].key === 'results' && jsonParser.stack[2].key === 'bindings') {
        resultStream.push(this.parseJsonBindings(value))
      } else if(jsonParser.key === "metadata" && jsonParser.stack.length === 1) {
        resultStream.emit('metadata', value);
      }
    }

    const resultStream = sparqlResponseStream
      .on("end", _ => {
        if (!resultsFound && !this.suppressMissingStreamResultsError) {
          resultStream.emit("error", new Error("No valid SPARQL query results were found."))
        } else if (!variablesFound) {
          resultStream.emit('variables', []);
        }
      })
      .pipe(new Transform({
        objectMode: true,
        transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void) {
          jsonParser.write(chunk);
          callback();
        }
      }));
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
      const parser = new JsonParser();
      parser.onError = reject;
      parser.onValue = (value: any) => {
        if(parser.key === "boolean" && typeof value === 'boolean' && parser.stack.length === 1) {
          resolve(value);
        }
      }
      sparqlResponseStream
          .on('error', reject)
          .on('data', d => parser.write(d))
          .on('end', () => reject(new Error('No valid ASK response was found.')));
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

