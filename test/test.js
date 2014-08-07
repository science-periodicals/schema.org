var fs = require('fs')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , pjsonld = require('..')
  , path = require('path');

var root = path.dirname(__filename);

describe('package-jsonld', function(){

  describe('TypeInferrer', function(){
    var graph, typeInferrer;
    before(function(){
      graph = JSON.parse(fs.readFileSync(path.resolve(root, '..', 'data', 'schema_org.jsonld')))['@graph'];
      typeInferrer = new pjsonld.TypeInferrer(graph, ['schema']);
    });

    it('should have init this.propMap', function(){
      assert.deepEqual(typeInferrer.propMap['valueReference'], {
        domains: [ 'QualitativeValue', 'QuantitativeValue' ],
        ranges: [ 'Enumeration', 'StructuredValue' ]
      });
    });

    it('should have init this.classMap', function(){
      assert.deepEqual(typeInferrer.classMap['MedicalScholarlyArticle'], {
        subClasses: [ 'ScholarlyArticle' ],
        parents: [ 'ScholarlyArticle', 'Article', 'CreativeWork', 'Thing' ]
      });
    });

    it('should infer type', function(){
      var obj = {
        "name": "enc",
        "videoQuality": "bad",
        "transcript": "no string"
      };
      assert.equal(typeInferrer.type(obj, typeInferrer.getRanges('encoding')), 'VideoObject');
    });
  });

});
