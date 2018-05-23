import {blankNode, literal, namedNode} from "rdf-data-model";
import {SparqlJsonParser} from "../lib/SparqlJsonParser";
const arrayifyStream = require('arrayify-stream');
const streamifyString = require('streamify-string');

describe('SparqlJsonParser', () => {

  describe('constructed without options', () => {
    const optionlessInstance = new SparqlJsonParser();

    it('should be a valid instance', () => {
      return expect(optionlessInstance).toBeInstanceOf(SparqlJsonParser);
    });

    it('should have the default data factory', () => {
      return expect((<any> optionlessInstance).dataFactory).toBe(require('rdf-data-model'));
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
      return expect((<any> optionsEmptyInstance).dataFactory).toBe(require('rdf-data-model'));
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
    parser = new SparqlJsonParser({ prefixVariableQuestionMark: true });
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
        { '?book': namedNode('http://example.org/book/book1') },
        { '?book': namedNode('http://example.org/book/book2') },
        { '?book': namedNode('http://example.org/book/book3') },
        { '?book': namedNode('http://example.org/book/book4') },
        { '?book': namedNode('http://example.org/book/book5') },
      ]);
    });
  });

  describe('#parseJsonResultsStream', () => {
    it('should convert an empty SPARQL JSON response', async () => {
      return expect(await arrayifyStream(parser.parseJsonResultsStream(streamifyString(`
{
  "results": {
    "bindings": []
  }
}
`)))).toEqual([]);
    });

    it('should convert an empty SPARQL JSON response', async () => {
      return expect(await arrayifyStream(parser.parseJsonResultsStream(streamifyString(`
{
  "results": {
    "bindings": [
      { "book": { "type": "uri", "value": "http://example.org/book/book1" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book2" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book3" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book4" } },
      { "book": { "type": "uri", "value": "http://example.org/book/book5" } }
    ]
  }
}
`)))).toEqual([
        { '?book': namedNode('http://example.org/book/book1') },
        { '?book': namedNode('http://example.org/book/book2') },
        { '?book': namedNode('http://example.org/book/book3') },
        { '?book': namedNode('http://example.org/book/book4') },
        { '?book': namedNode('http://example.org/book/book5') },
]);
    });
  });

  describe('#parseJsonBindings', () => {
    it('should convert bindings with named nodes', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'uri', value: 'http://example.org/book/book6' },
      })).toEqual({ '?book': namedNode('http://example.org/book/book6') });
    });

    it('should convert bindings with named nodes without variable prefixing', () => {
      return expect(new SparqlJsonParser().parseJsonBindings({
        book: { type: 'uri', value: 'http://example.org/book/book6' },
      })).toEqual({ book: namedNode('http://example.org/book/book6') });
    });

    it('should convert bindings with blank nodes', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'bnode', value: 'abc' },
      })).toEqual({ '?book': blankNode('abc') });
    });

    it('should convert bindings with literals', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'literal', value: 'abc' },
      })).toEqual({ '?book': literal('abc') });
    });

    it('should convert bindings with languaged literals', () => {
      return expect(parser.parseJsonBindings({
        book: { 'type': 'literal', 'value': 'abc', 'xml:lang': 'en-us' },
      })).toEqual({ '?book': literal('abc', 'en-us') });
    });

    it('should convert bindings with datatyped literals', () => {
      return expect(parser.parseJsonBindings({
        book: { type: 'literal', value: 'abc', datatype: 'http://ex' },
      })).toEqual({ '?book': literal('abc', namedNode('http://ex')) });
    });

    it('should convert mixed bindings', () => {
      return expect(parser.parseJsonBindings({
        book1: { type: 'uri', value: 'http://example.org/book/book6' },
        book2: { type: 'bnode', value: 'abc' },
        book3: { type: 'literal', value: 'abc' },
        book4: { 'type': 'literal', 'value': 'abc', 'xml:lang': 'en-us' },
        book5: { type: 'literal', value: 'abc', datatype: 'http://ex' },
      })).toEqual({
        '?book1': namedNode('http://example.org/book/book6'),
        '?book2': blankNode('abc'),
        '?book3': literal('abc'),
        '?book4': literal('abc', 'en-us'),
        '?book5': literal('abc', namedNode('http://ex')),
      });
    });
  });
});
