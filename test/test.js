var fs = require('fs')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , dpkgJsonLd = require('..')
  , path = require('path');

var root = path.dirname(__filename);
var base = dpkgJsonLd.context['@context']['@base'];

var dpkg = JSON.parse(fs.readFileSync(path.join(root, 'fixture', 'datapackage.jsonld')));

describe('datapacakge-jsonld', function(){

  describe('jsonldify', function(){

    it('should add @type and @id', function(){
      
      var ldpkg = dpkgJsonLd.linkDpkg(clone(dpkg));

      assert.equal(ldpkg['@context'], dpkgJsonLd.contextUrl);
      assert.equal(ldpkg['@id'], 'mydpkg/0.0.0');
      assert.equal(ldpkg['@type'], 'DataCatalog');
      assert.equal(ldpkg.author['@type'], 'Person');
      assert.equal(ldpkg.repository[0]['@type'], 'Code');
      assert.deepEqual(ldpkg.catalog, { name: 'mydpkg', url: 'mydpkg' } );
      ldpkg.dataset.forEach(function(r){
        assert.equal(r['@type'], 'Dataset');
        assert.equal(r['@id'], 'mydpkg/0.0.0/dataset/' + r.name);
        assert.deepEqual(r.catalog, { name: 'mydpkg', version: '0.0.0', url: 'mydpkg/0.0.0' } );
        assert.equal(r.distribution['@type'], 'DataDownload');
      });
      ldpkg.code.forEach(function(r){
        assert.equal(r['@type'], 'Code');
        assert.equal(r['@id'], 'mydpkg/0.0.0/code/' + r.name);
        assert.deepEqual(r.catalog, { name: 'mydpkg', version: '0.0.0', url: 'mydpkg/0.0.0' } );
        assert.equal(r.targetProduct['@type'], 'SoftwareApplication');
      });
      ldpkg.figure.forEach(function(r){
        assert.equal(r['@type'], 'ImageObject');
        assert.equal(r['@id'], 'mydpkg/0.0.0/figure/' + r.name);
        assert.deepEqual(r.catalog, { name: 'mydpkg', version: '0.0.0', url: 'mydpkg/0.0.0' } );
      });
    });

    it('should respect pre-existing dataset @type', function(){
      var mydpkg = clone(dpkg);
      mydpkg.dataset[0]['@type'] = 'StatTest';
      var ldpkg = dpkgJsonLd.linkDpkg(mydpkg);
      assert.deepEqual(['StatTest', 'Dataset'], ldpkg.dataset[0]['@type']);
    });

    it('should respect pre-existing dataset @type array', function(){
      var mydpkg = clone(dpkg);
      mydpkg.dataset[0]['@type'] = ['StatTest', 'ChisqTest'];
      var ldpkg = dpkgJsonLd.linkDpkg(mydpkg);
      assert.deepEqual(['StatTest', 'ChisqTest', 'Dataset'], ldpkg.dataset[0]['@type']);
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

  describe('validate name', function(){
    ['.a', '<a>', 'a a', 'a/a', '', ' ', 'a@a', 'a%20'].forEach(function(invalidName){
      it('should throw an error for invalid names', function(){      
        assert.throws( function(){ 
          dpkgJsonLd.validateName(invalidName);
        }, Error);
      });
    });
  });

  describe('validate require', function(){

    it('should validate when a package has valid require link', function(){
      var mydpkg = clone(dpkg);    
      assert(!dpkgJsonLd.validateRequire(dpkg));
    });

    it('should throw an error when a code has invalid require links', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.code = [ { targetProduct: { input: ['dpkg5/0.0.0'] } } ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a dataset point to an invalid require links', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.dataset[1].isBasedOnUrl = [ 'mydpkg/0.0.1/code/myanalytics' ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a code list as input a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.code[0].targetProduct.input = [ 'mydpkg/0.0.0/dataset/donotexists' ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.code[0].targetProduct.output = [ 'mydpkg/0.0.0/dataset/donotexists' ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl (no isBasedOnUrl at all)', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        delete mydpkg.dataset[2].isBasedOnUrl;
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.dataset[2].isBasedOnUrl = ['http://ex.com/smtgelse'];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it('should throw an error when a code list as output a local figure that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.figure[0].isBasedOnUrl = mydpkg.figure[0].isBasedOnUrl.slice(0,1);
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

    it("should throw an error when a resource list as isBasedOnUrl code that does not list that resource as it's outpt", function(){
      assert.throws( function(){ 
        var mydpkg = clone(dpkg);
        mydpkg.dataset[1].isBasedOnUrl = [ 'mydpkg/0.0.0/code/myanalytics' ];
        dpkgJsonLd.validateRequire(mydpkg)
      }, Error);
    });

  });

});
