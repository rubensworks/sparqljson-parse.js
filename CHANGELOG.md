# Changelog
All notable changes to this project will be documented in this file.

<a name="v3.3.0"></a>
## [v3.3.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v3.2.0...v3.3.0) - 2025-10-24

### Added
* [Accept and validate version as media type parameter](https://github.com/rubensworks/sparqljson-parse.js/commit/de3abcae186e15112aa8bfe384fa1886c6a7b600)

<a name="v3.2.0"></a>
## [v3.2.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v3.1.0...v3.2.0) - 2025-10-23

### Changed
* [Emit error on unsupported versions](https://github.com/rubensworks/sparqljson-parse.js/commit/571d0d971783d5b09e7492b96c451e6ee8447eae)

<a name="v3.1.0"></a>
## [v3.1.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v3.0.0...v3.1.0) - 2025-06-17

### Added
* [Parse version and link head elements](https://github.com/rubensworks/sparqljson-parse.js/commit/532366da8da1e2a946068abaafe953492a8c4a72)

<a name="v3.0.0"></a>
## [v3.0.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.2.0...v3.0.0) - 2025-01-08

### BREAKING CHANGES
* [Update to rdf-data-factory v2](https://github.com/rubensworks/sparqljson-parse.js/commit/b2c2926c5cbcc831b064f97c5cc26a9305de1ed5)
    This includes a bump to @rdfjs/types@2.0.0, which requires TypeScript 5 and Node 14+

### Added
* [Add optional direction for literals](https://github.com/rubensworks/sparqljson-parse.js/commit/e5fe4c9a9bfcccd3bb8edbbd476f699a005f9d75)

<a name="v2.2.0"></a>
## [v2.2.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.1.2...v2.2.0) - 2023-01-27

### Added
* [Parse quoted RDF-star triples, Closes #48](https://github.com/rubensworks/sparqljson-parse.js/commit/4eafdc9aee218a86b1f36e8848a582fc8252ad48)

### Fixed
* [Fix Buffer not defined in Web environments, Closes #42](https://github.com/rubensworks/sparqljson-parse.js/commit/221b968f3db33c0b8998e044f1fa5d50de3da39f)

<a name="v2.1.2"></a>
## [v2.1.2](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.1.1...v2.1.2) - 2022-11-09

### Fixed
* [Include source map files in packed files](https://github.com/rubensworks/sparqljson-parse.js/commit/3f2117ed7158773dee02c9fc9ddce6d9957646f2)

<a name="v2.1.1"></a>
## [v2.1.1](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.0.1...v2.1.1) - 2022-09-06

### Fixed
* [Add option to suppress stream results error](https://github.com/rubensworks/sparqljson-parse.js/commit/523efec418e2c678f4e3d72bc047396451c67e18)

<a name="v2.1.0"></a>
## [v2.1.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.0.1...v2.1.0) - 2022-08-03

### Added
* [Allow parsing of metadata in the JSON result stream](https://github.com/rubensworks/sparqljson-parse.js/commit/0ab561d95a5b0f576ad3ff431076e78d366f658d)

<a name="v2.0.1"></a>
## [v2.0.1](https://github.com/rubensworks/sparqljson-parse.js/compare/v2.0.0...v2.0.1) - 2022-07-15

### Fixed
* [Ensure variables or error event is emitted](https://github.com/rubensworks/sparqljson-parse.js/commit/40a86691c9096a75ef3218a928e73bc0ea68cefb)

<a name="v2.0.0"></a>
## [v2.0.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.7.0...v2.0.0) - 2022-07-14

This release has been marked as a major change due to the transition from Node's internal `stream` API to `readable-stream`.
Most users should experience not breakages with this change.

### Changed
* [Remove JSONStream dependency](https://github.com/rubensworks/sparqljson-parse.js/commit/18d98ff26dfa553bb8b8e33c3d5472384c4fb269)
* [Depend on readable-stream to avoid direct dependency on NodeJS](https://github.com/rubensworks/sparqljson-parse.js/commit/e4fc43ca7dda310e81077b24926c4a7e82355707)
* [Mark sideEffects: false in package.json](https://github.com/rubensworks/sparqljson-parse.js/commit/959ff9c381963347df5a02ee697623f1ae29e061)

<a name="v1.7.0"></a>
## [v1.7.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.6.1...v1.7.0) - 2021-08-11

### Changed
* [Migrate to @rdfjs/types](https://github.com/rubensworks/sparqljson-parse.js/commit/160aee426f812ff86194f47bb67ab1d93acf5a5a)

<a name="v1.6.1"></a>
## [v1.6.1](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.6.0...v1.6.1) - 2021-07-27

### Fixed
* [Fix not all JSON parse errors being caught](https://github.com/rubensworks/sparqljson-parse.js/commit/3389a2949f0d59a959fb43d4c7b8c248a891b30c)

<a name="v1.6.0"></a>
## [v1.6.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.5.2...v1.6.0) - 2020-09-16

### Changed
* [Migrate to rdf-data-factory and @types/rdf-js 4.x](https://github.com/rubensworks/sparqljson-parse.js/commit/98bd2eb22809945e1b7b244e70cac2bf5adbb952)

<a name="v1.5.2"></a>
## [v1.5.2](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.5.1...v1.5.2) - 2020-04-28

### Changed
* [Update dependency @types/rdf-js to v3 (#20)](https://github.com/rubensworks/sparqljson-parse.js/commit/72bdf12d1bda94a2da234e7f593d06eabeb6dbaf)

<a name="v1.5.1"></a>
## [v1.5.1](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.5.0...v1.5.1) - 2019-08-22

### Fixed
* [Add required typings as dependencies, Closes #11](https://github.com/rubensworks/sparqljson-parse.js/commit/d5d2b1e9c15b6a8269d3595439760058c4433c9a)

<a name="v1.5.0"></a>
## [v1.5.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.4.0...v1.5.0) - 2018-11-08

### Changed
* [Update to generic RDFJS typings](https://github.com/rubensworks/sparqljson-parse.js/commit/f0c44dd7f5d19dbe626b292353f4de169c0b4939)

<a name="1.4.0"></a>
## [1.3.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.3.1...v1.4.0) - 2018-10-02
### Added
- [Add support for Virtuoso's custom typed-literal](https://github.com/rubensworks/sparqljson-parse.js/commit/d26c08c1028b0defc58f84cfa7a4f3fcbe15d2b5)

<a name="1.3.1"></a>
## [1.3.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.3.0...v1.3.1) - 2018-09-05
### Fixed
- [Remove tslib dependency](https://github.com/rubensworks/sparqljson-parse.js/commit/969b0b03f22b578bb2a67641c663bd057392c284)
- [Remove invalid bin script](https://github.com/rubensworks/sparqljson-parse.js/commit/b111b4904d07f9ce81ca7d7bffaa659d3fee4d4c)

<a name="1.3.0"></a>
## [1.3.0](https://github.com/rubensworks/sparqljson-parse.js/compare/v1.2.0...v1.3.0) - 2018-08-21
### Added
- [Emit 'variables' event in bindings stream](https://github.com/rubensworks/sparqljson-parse.js/commit/b2421decfded34fb68e7ebacabf887f6063aa531)

<a name="1.2.0"></a>
## [1.2.0] - 2018-08-06
