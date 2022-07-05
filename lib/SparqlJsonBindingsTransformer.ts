import {SparqlJsonParser} from "./SparqlJsonParser";

import { Transform } from "readable-stream";

/**
 * Transforms a stream of SPARQL JSON bindings object to parsed bindings.
 */
export class SparqlJsonBindingsTransformer extends Transform {

  private readonly parser: SparqlJsonParser;

  constructor(parser: SparqlJsonParser) {
    super({ objectMode: true });
    this.parser = parser;
  }

  public _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
    callback(null, this.parser.parseJsonBindings(chunk));
  }

}
