var fs = require('fs')
  , tv4 = require('tv4')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , pjsonld = require('..')
  , path = require('path');

var root = path.dirname(__filename);
var base = pjsonld.context['@context']['@base'];

var pkg = JSON.parse(fs.readFileSync(path.join(root, 'fixture', 'package.jsonld')));

describe('package-jsonld', function(){

  describe('jsonldify', function(){

    it('should add @type and @id', function(){

      var package = pjsonld.linkPackage(clone(pkg));

      assert.equal(package['@context'], pjsonld.contextUrl);
      assert.equal(package['@id'], 'mypkg/0.0.0');
      assert.deepEqual(package['@type'], ['Package', 'DataCatalog']);
      assert.equal(package.author['@type'], 'Person');
      assert.deepEqual(package.registry, { name: 'Standard Analytics IO', url:'https://registry.standardanalytics.io/' } );
      package.dataset.forEach(function(r){
        assert.equal(r['@type'], 'Dataset');
        assert.equal(r['@id'], 'mypkg/0.0.0/dataset/' + r.name);
        assert.equal(r.distribution[0]['@type'], 'DataDownload');
        assert.deepEqual(r.catalog, { '@type': ['Package', 'DataCatalog'], name: 'mypkg', version: '0.0.0', url: 'mypkg/0.0.0' } );
      });
      package.code.forEach(function(r){
        assert.equal(r['@type'], 'Code');
        assert.equal(r['@id'], 'mypkg/0.0.0/code/' + r.name);
        assert.equal(r.targetProduct[0]['@type'], 'SoftwareApplication');
        assert.deepEqual(r.package, { '@type': 'Package', name: 'mypkg', version: '0.0.0', url: 'mypkg/0.0.0' } );
      });
      package.figure.forEach(function(r){
        assert.equal(r['@type'], 'ImageObject');
        assert.equal(r['@id'], 'mypkg/0.0.0/figure/' + r.name);
        assert.equal(r.encoding[0]['@type'], 'ImageObject');
        assert.deepEqual(r.package, { '@type': 'Package', name: 'mypkg', version: '0.0.0', url: 'mypkg/0.0.0' } );
      });
      package.article.forEach(function(r){
        assert.equal(r['@type'], 'Article');
        assert.equal(r['@id'], 'mypkg/0.0.0/article/' + r.name);
        assert.equal(r.encoding[0]['@type'], 'MediaObject');
        assert.deepEqual(r.package, { '@type': 'Package', name: 'mypkg', version: '0.0.0', url: 'mypkg/0.0.0' } );
      });
    });

    it('should respect pre-existing figure or code @type', function(){
      var mypkg = clone(pkg);
      mypkg.code[0]['@type'] = 'CodeType';
      var package = pjsonld.linkPackage(mypkg);
      assert.deepEqual(['CodeType', 'Code'], package.code[0]['@type']);
    });

    it('should respect pre-existing figure or code @type array', function(){
      var mypkg = clone(pkg);
      mypkg.figure[0]['@type'] = ['FigType', 'FigType2'];
      var package = pjsonld.linkPackage(mypkg);
      assert.deepEqual(['FigType', 'FigType2', 'ImageObject'], package.figure[0]['@type']);
    });

  });

  describe('dataDependencies', function(){

    it('should extract dataDependencies', function(){
      var isBasedOnUrl = [
        'pkg0/0.0.0',
        'pkg1/latest',
        url.resolve(base, 'pkg2/0.0.0'),
        url.resolve(base, 'pkg3/0.0.1'),
        url.resolve(base, 'pkg4/latest'),
        url.resolve(base, 'pkg5/latest?range=' + encodeURIComponent('>2.0.0')),
        'http://example.com/a/b',
        'https://example.com/a/b/c/'
      ];
      var dataDependencies = pjsonld.dataDependencies(isBasedOnUrl);
      var expected = { pkg0: '0.0.0', pkg1: '*', pkg2: '0.0.0', pkg3: '0.0.1', pkg4: '*', pkg5: '>2.0.0' };

      assert.deepEqual(dataDependencies, expected);
    });

    it('should throw an error when a version range does not respect semver', function(){
      assert.throws( function(){ pjsonld.dataDependencies(['pkg/a.b.c']); }, Error );
    });

    it('should throw an error when a pkg as an invalid URI', function(){
      assert.throws( function(){ pjsonld.dataDependencies(['pkg']); }, Error);
      assert.throws( function(){ pjsonld.dataDependencies(['']); }, Error );
      assert.throws( function(){ pjsonld.dataDependencies([base]); }, Error );
    });

    it('should throw an error when a pkg is listed many times as dep', function(){
      assert.throws( function(){ pjsonld.dataDependencies(['pkg/0.0.0', url.resolve(base, 'pkg/0.1.1')]); }, Error );
    });

  });

  describe('required links', function(){

    it('should validate a valid required uri', function(){
      assert(!pjsonld.validateRequiredUri('pkg2/0.0.0', 'pkg', '0.0.0', {pkg2: '*'}));
    });

    it('should throw an error when on whithin pkg version mismatch', function(){
      assert.throws( function(){
        pjsonld.validateRequiredUri('pkg/0.0.0', 'pkg', '0.0.1', {});
      }, Error);
    });

    it('should throw an error when a required uri is not listed as dep', function(){
      assert.throws( function(){
        pjsonld.validateRequiredUri('pkg2/0.0.0', 'pkg', '0.0.0', {});
      }, Error);
    });

    it('should throw an error when a required uri does not satisfy the dep version', function(){
      assert.throws( function(){
        pjsonld.validateRequiredUri('pkg2/0.0.0', 'pkg', '0.0.0', {'pkg2':'0.1.0'});
      }, Error);
    });

    it('should throw an error on invalid uri', function(){
      assert.throws( function(){
        pjsonld.validateRequiredUri('pkg2', 'pkg', '0.0.0', {'pkg2':'0.1.0'});
      }, Error);
    });

  });

  describe('validate name', function(){
    ['.a', '<a>', 'a a', 'a/a', '', ' ', 'a@a', 'a%20'].forEach(function(invalidName){
      it('should throw an error for invalid names', function(){
        assert.throws( function(){
          pjsonld.validateName(invalidName);
        }, Error);
      });
    });
  });

  describe('validate require', function(){

    it('should validate when a package has valid require link', function(){
      var mypkg = clone(pkg);
      assert(!pjsonld.validateRequire(pkg));
    });

    it('should throw an error when a code has invalid require links', function(){
      assert.throws( function(){
        var mypkg = clone(pkg);
        mypkg.code = [ { targetProduct: { input: ['pkg5/0.0.0'] } } ];
        pjsonld.validateRequire(mypkg)
      }, Error);
    });

    it('should throw an error when a code list as input a local dataset that does not exists', function(){
      assert.throws( function(){
        var mypkg = clone(pkg);
        mypkg.code[0].targetProduct.input = [ 'mypkg/0.0.0/dataset/donotexists' ];
        pjsonld.validateRequire(mypkg)
      }, Error);
    });

  });

  describe('schema validation', function(){
    it('should validate', function(){
      var valid = tv4.validate(pkg, pjsonld.schema);
      assert(valid);
    });
    it('should validate', function(){
      var mypkg = clone(pkg);
      mypkg.keywords = 'kw';
      var valid = tv4.validate(mypkg, pjsonld.schema);
      assert(!valid);
    });
  });

});
