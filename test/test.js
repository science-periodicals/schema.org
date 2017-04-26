import assert from 'assert';
import SchemaOrg from '../src';
import jsonld from 'jsonld';
import * as utils from '../src/utils';
import context from '../src/context';

describe('schema-org', function() {
  describe('SchemaOrg', function() {
    var schemaOrg;
    before(function() {
      schemaOrg = new SchemaOrg();
    });

    it('should return all the RDFS node', function() {
      assert(schemaOrg.get('ScholarlyArticle').label, 'ScholarlyArticle');
    });

    it('should expand terms into URL', function() {
      const custom = new SchemaOrg({
        '@context': {
          customPrefix: 'http://example.com/customPrefix/'
        },
        '@graph': [
          {
            '@id': 'customPrefix:CustomTerm',
            '@type': 'rdfs:Class',
            label: 'CustomTerm'
          }
        ]
      });

      assert.equal(
        custom.expand('ScholarlyArticle'),
        'http://schema.org/ScholarlyArticle'
      );
      assert.equal(
        custom.expand('CustomTerm'),
        'http://example.com/customPrefix/CustomTerm'
      );
    });

    it('should return all the parent classes', function() {
      assert.deepEqual(Array.from(schemaOrg.getParents('ScholarlyArticle')), [
        'Article',
        'CreativeWork',
        'Thing'
      ]);
    });

    it('should assess if a type is of a given class or not taking into account all the parent classes', function() {
      assert(schemaOrg.is({ '@type': 'ScholarlyArticle' }, 'Article'));
      assert(schemaOrg.is([{ '@type': 'ScholarlyArticle' }], 'Article'));
      assert(schemaOrg.is(['ScholarlyArticle'], 'Article'));
      assert(schemaOrg.is('ScholarlyArticle', 'Article'));
      assert(!schemaOrg.is('ScholarlyArticle', 'QuantitativeValue'));

      // test memoization (second call is memoized);
      assert(schemaOrg.is('ScholarlyArticle', 'Article'));
      assert(schemaOrg.is({ '@type': 'Action' }, 'Action'));
      assert(schemaOrg.is({ '@type': 'Action' }, 'Action'));
      assert(schemaOrg.is({ '@type': 'PublicationEvent' }, 'Event'));
      assert(schemaOrg.is({ '@type': 'PublicationEvent' }, 'Event'));

      assert(!schemaOrg.is(undefined, 'Article'));
    });

    it('should return all the subclasses of a className', function() {
      assert.deepEqual(Array.from(schemaOrg.getSubClasses('Article').keys()), [
        'APIReference',
        'BlogPosting',
        'DiscussionForumPosting',
        'LiveBlogPosting',
        'NewsArticle',
        'Report',
        'ScholarlyArticle',
        'SocialMediaPosting',
        'TechArticle'
      ]);
    });

    it('should return the direct subclasses of a className', function() {
      assert.deepEqual(
        Array.from(schemaOrg.getSubClasses('Article', false).keys()),
        [
          'NewsArticle',
          'Report',
          'ScholarlyArticle',
          'SocialMediaPosting',
          'TechArticle'
        ]
      );
    });

    it('should assess if a class is more specific than another', function() {
      assert(schemaOrg.isMoreSpecific('ScholarlyArticle', 'Article'));
      assert(!schemaOrg.isMoreSpecific('Article', 'ScholarlyArticle'));
    });

    it('should infer type of a node', function() {
      var obj = {
        name: 'a name',
        videoQuality: 'bad',
        transcript: 'a transcript'
      };
      assert.equal(schemaOrg.getType(obj), 'VideoObject');
    });
  });

  describe('SchemaOrg and extensions', function() {
    it('should work with extensions', function() {
      var schemaorg = new SchemaOrg([
        { '@graph': { '@id': 'sa:Image', subClassOf: ['schema:CreativeWork'] } }
      ]);
      assert(schemaorg.is('Image', 'CreativeWork'));
    });
  });

  describe('utils', function() {
    describe('getParts', function() {
      const tree = {
        '@context': {
          hasPart: {
            '@id': 'http://schema.org/hasPart',
            '@type': '@id',
            '@container': '@list'
          }
        },
        '@id': 'root',
        hasPart: [
          {
            '@id': 'a',
            hasPart: [{ '@id': 'b', hasPart: [{ '@id': 'c' }, { '@id': 'd' }] }]
          }
        ]
      };

      it('should work with a tree', function() {
        assert.deepEqual(utils.getParts(tree).map(r => r['@id']), [
          'a',
          'b',
          'c',
          'd'
        ]);
      });

      it('should work with a graph', function(done) {
        jsonld.flatten(tree, tree['@context'], (err, flat) => {
          assert.deepEqual(utils.getParts('root', flat), ['a', 'b', 'c', 'd']);
          done();
        });
      });
    });

    describe('getRootPart', function() {
      it('should get the root part', function() {
        const tree = {
          '@id': '_:1',
          isPartOf: {
            '@id': '_:2',
            isPartOf: {
              '@id': '_:3',
              isPartOf: '_:4'
            }
          }
        };

        assert.equal(utils.getRootPart(tree), '_:4');
        assert.equal(utils.getRootPartId(tree), '_:4');
      });
    });

    describe('getCreativeWorkTypeFromMime', function() {
      it('should get a CreativeWork @type from a MIME', function() {
        assert.equal(
          utils.getCreativeWorkTypeFromMime(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ),
          'ScholarlyArticle'
        );
      });
    });

    describe('getEncodingTypeFromMime', function() {
      it('should get an encoding @type from a MIME', function() {
        assert.equal(
          utils.getEncodingTypeFromMime(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ),
          'DocumentObject'
        );
      });
    });

    describe('getAgent', function() {
      it('should unrolify or return the agent if not a role', function() {
        assert.equal(utils.getAgent({ author: 'ex:authorId' }), 'ex:authorId');
        assert.equal(utils.getAgent('ex:authorId'), 'ex:authorId');
      });

      it('should get the agent Id', function() {
        assert.equal(
          utils.getAgentId({ author: { '@id': 'ex:authorId' } }),
          'ex:authorId'
        );
      });
    });

    describe('getObject', function() {
      it('should unrolify', function() {
        assert.deepEqual(
          utils.getObject({ object: { object: { '@id': 'ex:objectId' } } }),
          { '@id': 'ex:objectId' }
        );
      });

      it('should unrolify and get the @id', function() {
        assert.equal(
          utils.getObjectId({ object: { object: { '@id': 'ex:objectId' } } }),
          'ex:objectId'
        );
      });
    });

    describe('getTargetCollection', function() {
      it('should unrolify', function() {
        assert.deepEqual(
          utils.getTargetCollection({
            targetCollection: {
              targetCollection: { '@id': 'ex:targetCollectionId' }
            }
          }),
          { '@id': 'ex:targetCollectionId' }
        );
      });

      it('should unrolify and get the @id', function() {
        assert.equal(
          utils.getTargetCollectionId({
            targetCollection: {
              targetCollection: { '@id': 'ex:targetCollectionId' }
            }
          }),
          'ex:targetCollectionId'
        );
      });
    });

    describe('getChecksumValue', function() {
      it('should get the nash', function() {
        const doc = {
          contentChecksum: [
            {
              checksumAlgorithm: 'nash',
              checksumValue: 'nash'
            },
            {
              checksumAlgorithm: 'sha-256',
              checksumValue: 'sha-256'
            }
          ]
        };
        assert.equal(utils.getChecksumValue(doc), 'nash');
      });
    });

    describe('getUrlTemplateCtx', function() {
      it('should get urlTemplate context from an action', function() {
        let action = {
          'a-input': {
            valueName: 'a',
            defaultValue: 'aa'
          },
          target: {
            'b-input': {
              valueName: 'b',
              defaultValue: 'bb'
            }
          }
        };
        var ctx = utils.getUrlTemplateCtx(action, { a: 'aaa' });
        assert.deepEqual(ctx, { a: 'aaa', b: 'bb' });
      });
    });
  });

  describe('context', function() {
    it('should have schema.org context', function() {
      assert(context['@context']);
    });
  });
});
