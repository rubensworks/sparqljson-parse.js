import * as DefaultDataFactory from "rdf-data-model";
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
   * Convert a SPARQL JSON response to an array of bindings objects.
   * @param sparqlResponse A SPARQL JSON response.
   * @return {IBindings[]} An array of bindings.
   */
  public parseJsonResults(sparqlResponse: any): IBindings[] {
    return sparqlResponse.results.bindings.map((rawBindings: any) => this.parseJsonBindings(rawBindings));
  }

  /**
   * Convert a SPARQL JSON response stream to a stream of bindings objects.
   * @param {NodeJS.ReadableStream} sparqlResponseStream A SPARQL JSON response stream.
   * @return {NodeJS.ReadableStream} A stream of bindings.
   */
  public parseJsonResultsStream(sparqlResponseStream: NodeJS.ReadableStream): NodeJS.ReadableStream {
    return sparqlResponseStream.pipe(require('JSONStream').parse('results.bindings.*'))
      .pipe(new SparqlJsonBindingsTransformer(this));
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
