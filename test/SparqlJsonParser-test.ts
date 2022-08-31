import {DataFactory} from "rdf-data-factory";
import "jest-rdf";
import {PassThrough} from "stream";
import {SparqlJsonParser} from "../lib/SparqlJsonParser";
import arrayifyStream from 'arrayify-stream';
const streamifyString = require('streamify-string');
const DF = new DataFactory();

describe('SparqlJsonParser', () => {

  describe('constructed without options', () => {
    const optionlessInstance = new SparqlJsonParser();

    it('should be a valid instance', () => {
      return expect(optionlessInstance).toBeInstanceOf(SparqlJsonParser);
    });

    it('should have the default data factory', () => {
      return expect((<any> optionlessInstance).dataFactory).toBeInstanceOf(DataFactory);
    });

    it('should not prefix variables with a question mark', () => {
      return expect((<any> optionlessInstance).prefixVariableQuestionMark).toBeFalsy();
    });
  });

  describe('constructed with empty options', () => {
    const optionsEmptyInstance = new SparqlJsonParser({});

    it('should be a valid instance', () => {
      return expect(optionsEmptyInstance).toBeInstanceOf(SparqlJsonParser);
    });

    it('should have the default data factory', () => {
      return expect((<any> optionsEmptyInstance).dataFactory).toBeInstanceOf(DataFactory);
    });

    it('should not prefix variables with a question mark', () => {
      return expect((<any> optionsEmptyInstance).prefixVariableQuestionMark).toBeFalsy();
    });
  });

  describe('constructed with options', () => {
    const optionsInstance = new SparqlJsonParser({ dataFactory: <any> 'abc', prefixVariableQuestionMark: true });

    it('should be a valid instance', () => {
      return expect(optionsInstance).toBeInstanceOf(SparqlJsonParser);
    });

    it('should have the default data factory', () => {
      return expect((<any> optionsInstance).dataFactory).toEqual('abc');
    });

    it('should not prefix variables with a question mark', () => {
      return expect((<any> optionsInstance).prefixVariableQuestionMark).toBeTruthy();
    });
  });

  let parser;

  beforeEach(() => {
    parser = new SparqlJsonParser({ prefixVariableQuestionMark: true, suppressMissingStreamResultsError: false });
  });

  describe('#parseJsonResults', () => {
    it('should convert an empty SPARQL JSON response', () => {
      return expect(parser.parseJsonResults({ results: { bindings: [] } })).toEqual([]);
    });

    it('should convert a non-empty SPARQL JSON response', () => {
      return expect(parser.parseJsonResults({ results: { bindings: [
        { book: { type: 'uri', value: 'http://example.org/book/book1' } },
        { book: { type: 'uri', value: 'http://example.org/book/book2' } },
        { book: { type: 'uri', value: 'http://example.org/book/book3' } },
        { book: { type: 'uri', value: 'http://example.org/book/book4' } },
        { book: { type: 'uri', value: 'http://example.org/book/book5' } },
      ] } })).toEqual([
        { '?book': DF.namedNode('http://example.org/book/book1') },
        { '?book': DF.namedNode('http://example.org/book/book2') },
        { '?book': DF.namedNode('http://example.org/book/book3') },
        { '?book': DF.namedNode('http://example.org/book/book4') },
        { '?book': DF.namedNode('http://example.org/book/book5') },
      ]);
    });
  });

  describe('#parseJsonResultsStream', () => {
    it('should convert an empty SPARQL JSON response', async () => {
      return expect(await arrayifyStream(parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [] },
  "results": {
    "bindings": []
  }
}
`)))).toEqual([]);
    });

    it('should convert a slightly invalid empty SPARQL JSON response (common PHP error)', async () => {
      return expect(await arrayifyStream(parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [] },
  "results": {
    "bindings": {}
  }
}
`)))).toEqual([]);
    });

    it('should convert an empty SPARQL JSON response and emit the variables', async () => {
      const stream = parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [] },
  "results": {
    "bindings": []
  }
}
`));
      return expect(new Promise((resolve) => stream.on('variables', resolve))).resolves.toEqualRdfTermArray([
      ]);
    });

    it('should convert a more empty SPARQL JSON response and emit the variables', async () => {
      const stream = parser.parseJsonResultsStream(streamifyString(`
{
  "results": {
    "bindings": []
  }
}
`));
      return expect(new Promise((resolve) => stream.on('variables', resolve))).resolves.toEqualRdfTermArray([
      ]);
    });

    it('should convert a SPARQL JSON response', async () => {
      return expect(await arrayifyStream(parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [ "book", "library" ] },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" }, "library": { "type": "uri", "value": "http://example.org/book/library1" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book2" }, "library": { "type": "uri", "value": "http://example.org/book/library2" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book3" }, "library": { "type": "uri", "value": "http://example.org/book/library3" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book4" }, "library": { "type": "uri", "value": "http://example.org/book/library4" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book5" }, "library": { "type": "uri", "value": "http://example.org/book/library5" } }
    ]
  }
}
`)))).toEqual([
        { '?book': DF.namedNode('http://example.org/book/book1'), '?library': DF.namedNode('http://example.org/book/library1') },
        { '?book': DF.namedNode('http://example.org/book/book2'), '?library': DF.namedNode('http://example.org/book/library2') },
        { '?book': DF.namedNode('http://example.org/book/book3'), '?library': DF.namedNode('http://example.org/book/library3') },
        { '?book': DF.namedNode('http://example.org/book/book4'), '?library': DF.namedNode('http://example.org/book/library4') },
        { '?book': DF.namedNode('http://example.org/book/book5'), '?library': DF.namedNode('http://example.org/book/library5') },
]);
    });

    it('should convert a SPARQL JSON response and emit the variables', async () => {
      const stream = parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [ "book", "library" ] },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" }, "library": { "type": "uri", "value": "http://example.org/book/library1" } }
    ]
  }
}
`));
      return expect(new Promise((resolve) => stream.on('variables', resolve))).resolves.toEqualRdfTermArray([
        DF.variable('book'), DF.variable('library')
      ]);
    });

    it('should reject a boolean payload', async () => {
      return expect(arrayifyStream(parser.parseJsonResultsStream(streamifyString(`{"head": {}, "boolean": true}`)))).rejects.toBeTruthy();
    });

    it('should reject an empty payload', async () => {
      return expect(arrayifyStream(parser.parseJsonResultsStream(streamifyString('{}')))).rejects.toBeTruthy();
    });

    it('should reject on an invalid JSON', async () => {
      return expect(arrayifyStream(parser.parseJsonResultsStream(streamifyString('{')))).rejects.toBeTruthy();
    });

    it('should reject on an invalid variables', async () => {
      return expect(arrayifyStream(parser.parseJsonResultsStream(streamifyString('{"head": {"vars": null}, "results": {"bindings": []}}')))).rejects.toBeTruthy();
    });

    it('should reject on an invalid variables 2', async () => {
      return expect(arrayifyStream(parser.parseJsonResultsStream(streamifyString('{"head": {"vars": [[]]}, "results": {"bindings": []}}')))).rejects.toBeTruthy();
    });

    it('should emit an error on an erroring stream', async () => {
      const errorStream = new PassThrough();
      errorStream._read = () => errorStream.emit('error', new Error('Some stream error'));
      return expect(arrayifyStream(parser.parseJsonResultsStream(errorStream))).rejects.toBeTruthy();
    });

    it('should handle meadata in a SPARQL JSON response', async () => {
      const stream = parser.parseJsonResultsStream(streamifyString(`
{
  "head": { "vars": [ "book", "library" ] },
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" }, "library": { "type": "uri", "value": "http://example.org/book/library1" } }
    ]
  },
  "metadata": { "httpRequests": 0 }
}
`));
      return expect(await new Promise((resolve, reject) => {
        stream.on('metadata', resolve);
        stream.on('end', reject);
      })).toEqual({ "httpRequests": 0 });
    });
  });

  describe('#parseJsonBindings', () => {
    it('should convert bindings with named nodes', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'uri', value: 'http://example.org/book/book6' },
      })).toEqual({ '?book': DF.namedNode('http://example.org/book/book6') });
    });

    it('should convert bindings with named nodes without variable prefixing', () => {
      return expect(new SparqlJsonParser().parseJsonBindings({
        book: { type: 'uri', value: 'http://example.org/book/book6' },
      })).toEqual({ book: DF.namedNode('http://example.org/book/book6') });
    });

    it('should convert bindings with blank nodes', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'bnode', value: 'abc' },
      })).toEqual({ '?book': DF.blankNode('abc') });
    });

    it('should convert bindings with literals', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'literal', value: 'abc' },
      })).toEqual({ '?book': DF.literal('abc') });
    });

    it('should convert bindings with languaged literals', () => {
      return expect(parser.parseJsonBindings({
        book: { 'type': 'literal', 'value': 'abc', 'xml:lang': 'en-us' },
      })).toEqual({ '?book': DF.literal('abc', 'en-us') });
    });

    it('should convert bindings with datatyped literals', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'literal', value: 'abc', datatype: 'http://ex' },
      })).toEqual({ '?book': DF.literal('abc', DF.namedNode('http://ex')) });
    });

    it('should convert bindings with Virtuoso\'s datatyped literals', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'typed-literal', value: 'abc', datatype: 'http://ex' },
      })).toEqual({ '?book': DF.literal('abc', DF.namedNode('http://ex')) });
    });

    it('should convert mixed bindings', () => {
      return expect(parser.parseJsonBindings({
        book1: { type: 'uri', value: 'http://example.org/book/book6' },
        book2: { type: 'bnode', value: 'abc' },
        book3: { type: 'literal', value: 'abc' },
        book4: { 'type': 'literal', 'value': 'abc', 'xml:lang': 'en-us' },
        book5: { type: 'literal', value: 'abc', datatype: 'http://ex' },
      })).toEqual({
        '?book1': DF.namedNode('http://example.org/book/book6'),
        '?book2': DF.blankNode('abc'),
        '?book3': DF.literal('abc'),
        '?book4': DF.literal('abc', 'en-us'),
        '?book5': DF.literal('abc', DF.namedNode('http://ex')),
      });
    });
  });

  describe('#parseJsonBoolean', () => {
    it('should convert an empty SPARQL JSON response', () => {
      return expect(() => parser.parseJsonBoolean({})).toThrow();
    });

    it('should convert an true SPARQL JSON boolean response', () => {
      return expect(parser.parseJsonBoolean({ boolean: true })).toEqual(true);
    });

    it('should convert an false SPARQL JSON boolean response', () => {
      return expect(parser.parseJsonBoolean({ boolean: false })).toEqual(false);
    });
  });

  describe('#parseJsonBooleanStream', () => {
    it('should reject on an empty SPARQL JSON response', async () => {
      return expect(parser.parseJsonBooleanStream(streamifyString(`{}`))).rejects.toBeTruthy();
    });

    it('should convert a true SPARQL JSON boolean response', async () => {
      return expect(await parser.parseJsonBooleanStream(streamifyString(`{ "boolean": true }`))).toEqual(true);
    });

    it('should convert a false SPARQL JSON boolean response', async () => {
      return expect(await parser.parseJsonBooleanStream(streamifyString(`{ "boolean": false }`))).toEqual(false);
    });

    it('should reject on an invalid JSON', async () => {
      return expect(() => parser.parseJsonBooleanStream(streamifyString(`{`))).rejects.toBeTruthy();
    });

    it('should reject on an erroring stream', async () => {
      const errorStream = new PassThrough();
      errorStream._read = () => errorStream.emit('error', new Error('Some stream error'));
      return expect(parser.parseJsonBooleanStream(errorStream)).rejects.toBeTruthy();
    });
  });
});
