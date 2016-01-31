[schema.org](http://schema.org)
===============================

WIP, nothing to see yet.


## API


### SchemaOrg.prototype.is(value, type)

returns `true` if `value` (or list of thereof) is a `type`

```schemaOrg.is('MedicalScholarlyArticle', 'Article') === true```

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


Tests
=====

    npm test


License
=======

Apache 2.0
