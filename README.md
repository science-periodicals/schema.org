[schema.org](http://schema.org)
===============================

[![CircleCI](https://circleci.com/gh/scienceai/schema.org.svg?style=svg)](https://circleci.com/gh/scienceai/schema.org)

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

Work in progress...

## Context

```
import context from 'schema.org/context';
```

## API

### SchemaOrg([data])

`data` is an optional array of flattened JSON-LD document containing
[RDFS](https://www.w3.org/TR/rdf-schema/) definition of schema.org
extension.

```
import SchemaOrg from 'schema.org';
var schemaOrg = new SchemaOrg();
```

### SchemaOrg.prototype.get(term)

returns the RDFS node corresponding to the term;

```
schemaOrg.get(MedicalScholarlyArticle)
{ '@id': 'schema:MedicalScholarlyArticle',
  '@type': 'rdfs:Class',
  comment: 'A scholarly article in the medical domain.',
  label: 'MedicalScholarlyArticle',
  subClassOf: [ 'schema:ScholarlyArticle' ] }
```

### SchemaOrg.prototype.getSubClasses(type[, recursive])

returns a set containing the sub classes of the `type`. if `recursive`
is `false` (default value is `true`) only the direct descendant are
returned.

```
schemaOrg.getSubClasses('Article', false)
Set {
  'NewsArticle',
  'Report',
  'ScholarlyArticle',
  'SocialMediaPosting',
  'TechArticle' }
```

### SchemaOrg.prototype.getParents(type)

returns a set representing the trail of parent classes.

```
schemaOrg.getParents('MedicalScholarlyArticle')
Set { 'ScholarlyArticle', 'Article', 'CreativeWork', 'Thing' }
```

### SchemaOrg.prototype.is(value, type)

returns `true` if `value` (or list of thereof) is a `type`

```
schemaOrg.is('MedicalScholarlyArticle', 'Article') === true
```

### SchemaOrg.prototype.getType(obj[, minType])

Infer the type of the object `obj` and returns `undefined` when no
type can be safely inferred (multiple options). If `minType` is
specified the returning type must be at least as specific or more
specific than `minType`.

```
schemaOrg.getType({
  "name": "a name",
  "videoQuality": "video quality",
  "transcript": "a transcript"
}) ===  'VideoObject'
```


## Utils

```
import * as utils from 'schema.org/utils';
```



Tests
=====

    npm test


License
=======

Apache 2.0
