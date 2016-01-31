import assert from 'assert';
import SchemaOrg from '../src';
import util from 'util';

describe('schema-org', function() {
  var schemaOrg;
  before(function(){
    schemaOrg = new SchemaOrg();
  });

  it('should have well initialized this.propMap', function() {
    let map = schemaOrg.propMap['schema:valueReference'];
    assert.deepEqual(Array.from(map.domain).sort(), [
      'schema:PropertyValue',
      'schema:QualitativeValue',
      'schema:QuantitativeValue'
    ].sort());
    assert.deepEqual(Array.from(map.range).sort(), [
      'schema:Enumeration',
      'schema:PropertyValue',
      'schema:QualitativeValue',
      'schema:QuantitativeValue',
      'schema:StructuredValue'
    ].sort());
  });

  it('should have well initialized this.classMap', function() {
    let map = schemaOrg.classMap['schema:MedicalScholarlyArticle'];
    assert.deepEqual(Array.from(map.subClassOf.keys()), [ 'schema:ScholarlyArticle' ]);
    assert.deepEqual(Array.from(map.subClassOfChain.keys()), [ 'schema:ScholarlyArticle', 'schema:Article', 'schema:CreativeWork', 'schema:Thing' ]);
  });

  it('should return the subclasses of a className', function() {
    assert.deepEqual(Array.from(schemaOrg.getSubClasses('schema:Article').keys()), [
      'schema:APIReference',
      'schema:BlogPosting',
      'schema:DiscussionForumPosting',
      'schema:LiveBlogPosting',
      'schema:MedicalScholarlyArticle',
      'schema:NewsArticle',
      'schema:Report',
      'schema:ScholarlyArticle',
      'schema:SocialMediaPosting',
      'schema:TechArticle'
    ]);
  });

  it('should assess if a type is of a given class or not taking into account all the parent classes', function() {
    assert(schemaOrg.is('schema:MedicalScholarlyArticle', 'schema:Article'));
    assert(!schemaOrg.is('schema:MedicalScholarlyArticle', 'schema:QuantitativeValue'));
  });

  it('should assess if a class is more specific than another', function() {
    assert(schemaOrg.isMoreSpecific('schema:MedicalScholarlyArticle', 'schema:Article'));
    assert(!schemaOrg.isMoreSpecific('schema:Article', 'schema:MedicalScholarlyArticle'));
  });

  it('should infer type of a node', function(){
    var obj = {
      "schema:name": "a name",
      "schema:videoQuality": "bad",
      "schema:transcript": "a transcript"
    };
    assert.equal(schemaOrg.getType(obj, 'schema:CreativeWork'), 'schema:VideoObject');
  });

});
