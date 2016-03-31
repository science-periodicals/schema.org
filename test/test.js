import assert from 'assert';
import SchemaOrg from '../src';
import util from 'util';
import jsonld from 'jsonld';
import * as utils from '../src/utils';
import context from '../src/context';

describe('schema-org', function() {

  describe('SchemaOrg', function() {
    var schemaOrg;
    before(function(){
      schemaOrg = new SchemaOrg();
    });

    it('should return all the RDFS node', function() {
      assert(schemaOrg.get('MedicalScholarlyArticle').label, 'MedicalScholarlyArticle');
    });

    it('should expand terms into URL', function() {
      const custom = new SchemaOrg({
        '@context': {
          customPrefix: 'http://example.com/customPrefix/'
        },
        '@graph': [
          {
            "@id": "customPrefix:CustomTerm",
            "@type": "rdfs:Class",
            "label": "CustomTerm"
          }
        ]
      });

      assert.equal(custom.expand('MedicalScholarlyArticle'), 'http://schema.org/MedicalScholarlyArticle');
      assert.equal(custom.expand('CustomTerm'), 'http://example.com/customPrefix/CustomTerm');
    })

    it('should return all the parent classes', function() {
      assert.deepEqual(Array.from(schemaOrg.getParents('MedicalScholarlyArticle')), [ 'ScholarlyArticle', 'Article', 'CreativeWork', 'Thing' ]);
    });


    it('should assess if a type is of a given class or not taking into account all the parent classes', function() {
      assert(schemaOrg.is('MedicalScholarlyArticle', 'MedicalScholarlyArticle'));
      assert(schemaOrg.is('MedicalScholarlyArticle', 'Article'));
      assert(!schemaOrg.is('MedicalScholarlyArticle', 'QuantitativeValue'));

      // test memoization (second call is memoized);
      assert(schemaOrg.is('MedicalScholarlyArticle', 'MedicalScholarlyArticle'));

      assert(!schemaOrg.is(undefined, 'Article'));
    });



    it('should return all the subclasses of a className', function() {
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

    it('should return the direct subclasses of a className', function() {
      assert.deepEqual(Array.from(schemaOrg.getSubClasses('Article', false).keys()), [
        'NewsArticle',
        'Report',
        'ScholarlyArticle',
        'SocialMediaPosting',
        'TechArticle'
      ]);
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


  describe('SchemaOrg and extensions', function() {
    it('should work with extensions', function() {
      var schemaorg = new SchemaOrg([{'@graph': {'@id': 'sa:Image', subClassOf: ['schema:CreativeWork']}}]);
      assert(schemaorg.is('Image', 'CreativeWork'));
    });
  });


  describe('utils', function() {

    describe('getParts', function() {
      const tree = {
        '@context': {
          'hasPart': {
            '@id': 'http://schema.org/hasPart',
            '@type': '@id',
            '@container': '@list'
          }
        },
        '@id': 'root',
        'hasPart': [{'@id': 'a', hasPart: [{'@id': 'b', hasPart: [{'@id': 'c'}, {'@id': 'd'}]}]}]
      };

      it('should work with a tree', function() {
        assert.deepEqual(utils.getParts(tree).map(r => r['@id']), ['a','b','c','d']);
      });

      it('should work with a graph', function(done) {
        jsonld.flatten(tree, tree['@context'], (err, flat) => {
          assert.deepEqual(utils.getParts('root', flat), ['a','b','c','d']);
          done();
        });
      });
    });

  });

  describe('context', function() {
    it('should have schema.org context', function() {
      assert(context['@context']);
    });
  });

});
