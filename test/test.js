import assert from 'assert';
import SchemaOrg from '../src';
import util from 'util';

describe('schema-org', function() {
  var schemaOrg;
  before(function(){
    schemaOrg = new SchemaOrg();
  });

  it('should have well initialized this.propMap', function() {
    let map = schemaOrg.propMap['valueReference'];
    assert.deepEqual(Array.from(map.domain).sort(), [
      'PropertyValue',
      'QualitativeValue',
      'QuantitativeValue'
    ].sort());
    assert.deepEqual(Array.from(map.range).sort(), [
      'Enumeration',
      'PropertyValue',
      'QualitativeValue',
      'QuantitativeValue',
      'StructuredValue'
    ].sort());
  });

  it('should have well initialized this.classMap', function() {
    let map = schemaOrg.classMap['MedicalScholarlyArticle'];
    assert.deepEqual(Array.from(map.subClassOf.keys()), [ 'ScholarlyArticle' ]);
    assert.deepEqual(Array.from(map.subClassOfChain.keys()), [ 'ScholarlyArticle', 'Article', 'CreativeWork', 'Thing' ]);
  });

  it('should return the subclasses of a className', function() {
    assert.deepEqual(Array.from(schemaOrg.getSubClasses('Article').keys()), [
      'APIReference',
      'BlogPosting',
      'DiscussionForumPosting',
      'LiveBlogPosting',
      'MedicalScholarlyArticle',
      'NewsArticle',
      'Report',
      'ScholarlyArticle',
      'SocialMediaPosting',
      'TechArticle'
    ]);
  });

  it('should assess if a type is of a given class or not taking into account all the parent classes', function() {
    assert(schemaOrg.is('MedicalScholarlyArticle', 'Article'));
    assert(!schemaOrg.is('MedicalScholarlyArticle', 'QuantitativeValue'));
  });

  it('should assess if a class is more specific than another', function() {
    assert(schemaOrg.isMoreSpecific('MedicalScholarlyArticle', 'Article'));
    assert(!schemaOrg.isMoreSpecific('Article', 'MedicalScholarlyArticle'));
  });

  it('should infer type of a node', function(){
    var obj = {
      "name": "a name",
      "videoQuality": "bad",
      "transcript": "a transcript"
    };
    assert.equal(schemaOrg.getType(obj), 'VideoObject');
  });

});
