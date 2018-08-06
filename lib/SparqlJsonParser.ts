import * as DefaultDataFactory from "@rdfjs/data-model";
import * as RDF from "rdf-js";
import {SparqlJsonBindingsTransformer} from "./SparqlJsonBindingsTransformer";

/**
 * Parser for the SPARQL 1.1 Query Results JSON format.
 * @see https://www.w3.org/TR/sparql11-results-json/
 */
export class SparqlJsonParser {

  private readonly dataFactory: RDF.DataFactory;
  private readonly prefixVariableQuestionMark?: boolean;

  constructor(settings?: ISettings) {
    settings = settings || {};
    this.dataFactory = settings.dataFactory || DefaultDataFactory;
    this.prefixVariableQuestionMark = !!settings.prefixVariableQuestionMark;
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
   * @param {NodeJS.ReadableStream} sparqlResponseStream A SPARQL JSON response stream.
   * @return {NodeJS.ReadableStream} A stream of bindings.
   */
  public parseJsonResultsStream(sparqlResponseStream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    sparqlResponseStream.on('error', (error) => resultStream.emit('error', error));
    const resultStream = sparqlResponseStream
      .pipe(require('JSONStream').parse('results.bindings.*'))
      .pipe(new SparqlJsonBindingsTransformer(this));
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
   * @return {NodeJS.ReadableStream} A stream of bindings.
   */
  public parseJsonBooleanStream(sparqlResponseStream: NodeJS.ReadableStream): Promise<boolean> {
    return new Promise((resolve, reject) => {
      sparqlResponseStream.on('error', reject);
      sparqlResponseStream.pipe(require('JSONStream').parse('boolean'))
        .on('data', resolve)
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
}

/**
 * A bindings object.
 */
export interface IBindings {
  [key: string]: RDF.Term;
}
