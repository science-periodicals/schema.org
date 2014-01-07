var fs = require('fs')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , dpkgJsonLd = require('..')
  , path = require('path');


var root = path.dirname(__filename);
var base = dpkgJsonLd.context['@context']['@base'];

var dpkg = require(path.join(root, 'fixture', 'package.json'));

describe('datapacakge-jsonld', function(){

  describe('jsonldify', function(){

    it('should add @type and @id', function(){
      
      var ldpkg = dpkgJsonLd.ify(clone(dpkg));

      assert.equal(ldpkg['@context'], dpkgJsonLd.contextUrl);
      assert.equal(ldpkg['@id'], 'mydpkg/0.0.0');
      assert.equal(ldpkg['@type'], 'DataCatalog');
      assert.equal(ldpkg.author['@type'], 'Person');
      assert.equal(ldpkg.repository[0]['@type'], 'Code');
      assert.deepEqual(ldpkg.catalog, { name: 'mydpkg', url: 'mydpkg' } );
      ldpkg.dataset.forEach(function(r){
        assert.equal(r['@type'], 'DataSet');
        assert.equal(r['@id'], 'mydpkg/0.0.0/' + r.name);
        assert.deepEqual(r.catalog, { name: 'mydpkg', version: '0.0.0', url: 'mydpkg/0.0.0' } );
        assert.equal(r.distribution['@type'], 'DataDownload');
      });

    });

    it('should respect pre-existing dataset @type', function(){
      var mydpkg = clone(dpkg);
      mydpkg.dataset[0]['@type'] = 'StatTest';
      var ldpkg = dpkgJsonLd.ify(mydpkg);
      assert.deepEqual(['StatTest', 'DataSet'], ldpkg.dataset[0]['@type']);
    });

    it('should respect pre-existing dataset @type array', function(){
      var mydpkg = clone(dpkg);
      mydpkg.dataset[0]['@type'] = ['StatTest', 'Chi2Test'];
      var ldpkg = dpkgJsonLd.ify(mydpkg);
      assert.deepEqual(['StatTest', 'Chi2Test', 'DataSet'], ldpkg.dataset[0]['@type']);
    });

  });

  describe('dataDependencies', function(){
    
    it('should extract dataDependencies', function(){
      var isBasedOnUrl = [
        'dpkg0/0.0.0',
        'dpkg1/latest',
        url.resolve(base, 'dpkg2/0.0.0'),
        url.resolve(base, 'dpkg3/0.0.1'),
        url.resolve(base, 'dpkg4/latest'),
        url.resolve(base, 'dpkg5/latest?range=' + encodeURIComponent('>2.0.0')),
        'http://example.com/a/b',
        'https://example.com/a/b/c/'
      ];
      var dataDependencies = dpkgJsonLd.dataDependencies(isBasedOnUrl);
      var expected = { dpkg0: '0.0.0', dpkg1: '*', dpkg2: '0.0.0', dpkg3: '0.0.1', dpkg4: '*', dpkg5: '>2.0.0' };

      assert.deepEqual(dataDependencies, expected);
    });

    it('should throw an error when a version range does not respect semver', function(){      
      assert.throws( function(){ dpkgJsonLd.dataDependencies(['dpkg/a.b.c']); }, Error );
    });
    
    it('should throw an error when a dpkg as an invalid URI', function(){
      assert.throws( function(){ dpkgJsonLd.dataDependencies(['dpkg']); }, Error);
      assert.throws( function(){ dpkgJsonLd.dataDependencies(['']); }, Error );
      assert.throws( function(){ dpkgJsonLd.dataDependencies([base]); }, Error );            
    });

    it('should throw an error when a dpkg is listed many times as dep', function(){      
      assert.throws( function(){ dpkgJsonLd.dataDependencies(['dpkg/0.0.0', url.resolve(base, 'dpkg/0.1.1')]); }, Error );     
    });

  });

  describe('required links', function(){

    it('should validate a valid required uri', function(){
      assert(!dpkgJsonLd.validateRequiredUri('dpkg2/0.0.0', 'dpkg', '0.0.0', {dpkg2: '*'}));
    });
    
    it('should throw an error when on whithin dpkg version mismatch', function(){
      assert.throws( function(){ 
        dpkgJsonLd.validateRequiredUri('dpkg/0.0.0', 'dpkg', '0.0.1', {});
      }, Error);
    });

    it('should throw an error when a required uri is not listed as dep', function(){
      assert.throws( function(){ 
        dpkgJsonLd.validateRequiredUri('dpkg2/0.0.0', 'dpkg', '0.0.0', {});
      }, Error);
    });

    it('should throw an error when a required uri does not satisfy the dep version', function(){
      assert.throws( function(){ 
        dpkgJsonLd.validateRequiredUri('dpkg2/0.0.0', 'dpkg', '0.0.0', {'dpkg2':'0.1.0'});
      }, Error);
    });

    it('should throw an error on invalid uri', function(){
      assert.throws( function(){ 
        dpkgJsonLd.validateRequiredUri('dpkg2', 'dpkg', '0.0.0', {'dpkg2':'0.1.0'});
      }, Error);
    });

  });


  describe('validate require', function(){
    it('should validate when a package has valid require link', function(){
      assert(!dpkgJsonLd.validateRequire(dpkg));
    });

    it('should throw an error when a package has invalid require links', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.analytics = [ { input: ['dpkg5/0.0.0'] } ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

  });

});
