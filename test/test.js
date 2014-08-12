var fs = require('fs')
  , path = require('path')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , jsonld = require('jsonld')
  , Packager = require('..');

var root = path.dirname(__filename);

describe('package-jsonld', function(){

  describe('jsonld context', function(){
    it('should standardize a package.jsonld with the vanilla context', function(done){
      var doc = {
        "@context": [
          {'@vocab': 'http://schema.org/'},
          Packager.context()['@context'][1] //avoid having to fetch schema.org context so that it works offline
        ],
        "@id": "myNameSpace",
        encoding: {contentUrl: 'http://example.com/data'},
        distribution: {name: "name"},
        hasPart: {'@id': 'http://example.com/part'}
      };

      jsonld.compact(doc, doc['@context'], function(err, cdoc){
        assert.equal(cdoc['@id'], 'sa:myNameSpace');
        assert.deepEqual(cdoc.encoding, [doc.encoding]);
        assert.deepEqual(cdoc.distribution, [doc.distribution]);
        assert.deepEqual(cdoc.hasPart, [doc.hasPart['@id']]);
        done();
      });
    });
  });

  describe('Packager', function(){
    var packager;
    before(function(){
      packager = new Packager();
    });

    it('should have well initialized this.propMap', function(){
      assert.deepEqual(packager.propMap['valueReference'], {
        domains: [ 'QualitativeValue', 'QuantitativeValue' ],
        ranges: [ 'Enumeration', 'StructuredValue' ]
      });
    });

    it('should have well initialized this.propMap with extra :saterms', function(){
      assert.deepEqual(packager.propMap['hasPart'], {
        domains: [ 'CreativeWork' ],
        ranges: [ 'CreativeWork' ]
      });
    });

    it('should have well initialized this.classMap', function(){
      assert.deepEqual(packager.classMap['MedicalScholarlyArticle'], {
        subClasses: [ 'ScholarlyArticle' ],
        subClassesChain: [ 'ScholarlyArticle', 'Article', 'CreativeWork', 'Thing' ]
      });
    });

    it('should throw an error for invalid @id', function(){
      ['nobase', '.a', 'wrongprefix:a', 'sa:/../', '../', 'sa:/ns@version', 'sa:ns%40version'].forEach(function(invalidId){
        assert.throws( function(){ packager.validateId(invalidId); }, Error );
      });
    });

    it('should throw an error for an invalid namespace @id', function(){
      ['sa:ns/nons', 'https://registry.standardanalytics.io/ns/nons'].forEach(function(invalidId){
        assert.throws( function(){ packager.validateId(invalidId, {isNameSpace: true}); }, Error );
      });
    });

    it('should validate @id and return a normalized version', function(){
      assert.equal(packager.validateId('https://registry.standardanalytics.io/ns'), 'sa:ns');
      assert.equal(packager.validateId('sa:ns'), 'sa:ns');
      assert.equal(packager.validateId('https://registry.standardanalytics.io/ns/a'), 'sa:ns/a');
      assert.equal(packager.validateId('sa:ns/a'), 'sa:ns/a');
    });

    it('should add @id', function(){
      var doc = {
        "@context": "https://registry.standardanalytics.io/context.jsonld",
        "@id": "sa:ns",
        "version": "0.0.0",
        "name": 'myname',
        "author": { "name": "peter" },
        "encoding": { "name": "enc" },
        "hasPart": [
          { "@id": "sa:ns/n1",  "name": "part a" },
          { "name": "part b" },
          { "name": "part c" }
        ]
      };

      packager.setIds(doc);

      assert.equal(doc['@id'], 'sa:ns');
      assert.equal(doc.author['@id'], 'sa:ns/n0');
      assert.equal(doc.encoding['@id'], 'sa:ns/n2');
      assert.equal(doc.hasPart[0]['@id'], 'sa:ns/n1');
      assert.equal(doc.hasPart[1]['@id'], 'sa:ns/n3');
      assert.equal(doc.hasPart[2]['@id'], 'sa:ns/n4');
    });

    it('should add @id and respect options', function(){
      var doc = {
        "@context": "https://registry.standardanalytics.io/context.jsonld",
        "@id": "sa:ns",
        "version": "0.0.0",
        "author": { "name": "peter" },
        "encoding": { "name": "enc" },
      };

      var mdoc = packager.setIds(clone(doc), {ignoredProps: ['encoding'], restrictToClasses: ['CreativeWork']});
      assert.deepEqual(doc, mdoc);
    });

    it('should infer type of a node', function(){
      var obj = {
        "name": "enc",
        "videoQuality": "bad",
        "transcript": "a transcript"
      };
      assert.equal(packager._type(obj), 'VideoObject');
    });

    it('should add types to a document', function(){

      var doc = {
        "name": 'myname',
        "author": { "givenName": "peter" },
        "encoding": { "name": "enc" },
        "hasPart": [
          { "name": "a part" }
        ]
      };

      var mdoc = packager.type(clone(doc), ['Article']);
      assert.equal(mdoc['@type'], 'Article');
      assert.equal(mdoc.author['@type'], 'Person');
      assert.equal(mdoc.hasPart[0]['@type'], 'CreativeWork');
    });


    it('should add potential actions to a document', function(){
      var doc = JSON.parse(fs.readFileSync(path.join(root, 'fixture', 'package.jsonld')));
      packager.potentialAction(doc);
      assert(Array.isArray(doc.potentialAction))
      doc.hasPart.forEach(function(part){
        assert(! ('potentialAction' in part))
      });
    });

  });

});
