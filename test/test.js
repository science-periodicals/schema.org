var fs = require('fs')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , cjsonld = require('..')
  , path = require('path');

var root = path.dirname(__filename);
var base = cjsonld.context['@context']['@base'];

var ctnr = JSON.parse(fs.readFileSync(path.join(root, 'fixture', 'container.jsonld')));

describe('container-jsonld', function(){

  describe('jsonldify', function(){

    it('should add @type and @id', function(){
      
      var container = cjsonld.linkContainer(clone(ctnr));

      assert.equal(container['@context'], cjsonld.contextUrl);
      assert.equal(container['@id'], 'myctnr/0.0.0');
      assert.equal(container['@type'], 'Container');
      assert.equal(container.author['@type'], 'Person');
      assert.equal(container.repository[0]['@type'], 'Code');
      assert.deepEqual(container.registry, { name: 'Standard Analytics IO', url:'https://registry.standardanalytics.io/' } );
      container.dataset.forEach(function(r){
        assert.equal(r['@type'], 'Dataset');
        assert.equal(r['@id'], 'myctnr/0.0.0/dataset/' + r.name);
        assert.deepEqual(r.container, { name: 'myctnr', version: '0.0.0', url: 'myctnr/0.0.0' } );
        assert.equal(r.distribution['@type'], 'DataDownload');
      });
      container.code.forEach(function(r){
        assert.equal(r['@type'], 'Code');
        assert.equal(r['@id'], 'myctnr/0.0.0/code/' + r.name);
        assert.deepEqual(r.container, { name: 'myctnr', version: '0.0.0', url: 'myctnr/0.0.0' } );
        assert.equal(r.targetProduct['@type'], 'SoftwareApplication');
      });
      container.figure.forEach(function(r){
        assert.equal(r['@type'], 'ImageObject');
        assert.equal(r['@id'], 'myctnr/0.0.0/figure/' + r.name);
        assert.deepEqual(r.container, { name: 'myctnr', version: '0.0.0', url: 'myctnr/0.0.0' } );
      });
    });

    it('should respect pre-existing figure or code @type', function(){
      var myctnr = clone(ctnr);
      myctnr.code[0]['@type'] = 'CodeType';
      var container = cjsonld.linkContainer(myctnr);
      assert.deepEqual(['CodeType', 'Code'], container.code[0]['@type']);
    });

    it('should respect pre-existing figure or code @type array', function(){
      var myctnr = clone(ctnr);
      myctnr.figure[0]['@type'] = ['FigType', 'FigType2'];
      var container = cjsonld.linkContainer(myctnr);
      assert.deepEqual(['FigType', 'FigType2', 'ImageObject'], container.figure[0]['@type']);
    });

    it('should add @type Dataset only if type is non existent', function(){
      var myctnr = clone(ctnr);
      myctnr.dataset[0]['@type'] = 'EmpiricalDataset';
      var container = cjsonld.linkContainer(myctnr);
      assert.equal('EmpiricalDataset', container.dataset[0]['@type']);
    });

  });

  describe('dataDependencies', function(){
    
    it('should extract dataDependencies', function(){
      var isBasedOnUrl = [
        'ctnr0/0.0.0',
        'ctnr1/latest',
        url.resolve(base, 'ctnr2/0.0.0'),
        url.resolve(base, 'ctnr3/0.0.1'),
        url.resolve(base, 'ctnr4/latest'),
        url.resolve(base, 'ctnr5/latest?range=' + encodeURIComponent('>2.0.0')),
        'http://example.com/a/b',
        'https://example.com/a/b/c/'
      ];
      var dataDependencies = cjsonld.dataDependencies(isBasedOnUrl);
      var expected = { ctnr0: '0.0.0', ctnr1: '*', ctnr2: '0.0.0', ctnr3: '0.0.1', ctnr4: '*', ctnr5: '>2.0.0' };

      assert.deepEqual(dataDependencies, expected);
    });

    it('should throw an error when a version range does not respect semver', function(){      
      assert.throws( function(){ cjsonld.dataDependencies(['ctnr/a.b.c']); }, Error );
    });
    
    it('should throw an error when a ctnr as an invalid URI', function(){
      assert.throws( function(){ cjsonld.dataDependencies(['ctnr']); }, Error);
      assert.throws( function(){ cjsonld.dataDependencies(['']); }, Error );
      assert.throws( function(){ cjsonld.dataDependencies([base]); }, Error );            
    });

    it('should throw an error when a ctnr is listed many times as dep', function(){      
      assert.throws( function(){ cjsonld.dataDependencies(['ctnr/0.0.0', url.resolve(base, 'ctnr/0.1.1')]); }, Error );     
    });

  });

  describe('required links', function(){

    it('should validate a valid required uri', function(){
      assert(!cjsonld.validateRequiredUri('ctnr2/0.0.0', 'ctnr', '0.0.0', {ctnr2: '*'}));
    });
    
    it('should throw an error when on whithin ctnr version mismatch', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('ctnr/0.0.0', 'ctnr', '0.0.1', {});
      }, Error);
    });

    it('should throw an error when a required uri is not listed as dep', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('ctnr2/0.0.0', 'ctnr', '0.0.0', {});
      }, Error);
    });

    it('should throw an error when a required uri does not satisfy the dep version', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('ctnr2/0.0.0', 'ctnr', '0.0.0', {'ctnr2':'0.1.0'});
      }, Error);
    });

    it('should throw an error on invalid uri', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('ctnr2', 'ctnr', '0.0.0', {'ctnr2':'0.1.0'});
      }, Error);
    });

  });

  describe('validate name', function(){
    ['.a', '<a>', 'a a', 'a/a', '', ' ', 'a@a', 'a%20'].forEach(function(invalidName){
      it('should throw an error for invalid names', function(){      
        assert.throws( function(){ 
          cjsonld.validateName(invalidName);
        }, Error);
      });
    });
  });

  describe('validate require', function(){

    it('should validate when a container has valid require link', function(){
      var myctnr = clone(ctnr);    
      assert(!cjsonld.validateRequire(ctnr));
    });

    it('should throw an error when a code has invalid require links', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.code = [ { targetProduct: { input: ['ctnr5/0.0.0'] } } ];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a dataset point to an invalid require links', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.dataset[1].isBasedOnUrl = [ 'myctnr/0.0.1/code/myanalytics' ];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a code list as input a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.code[0].targetProduct.input = [ 'myctnr/0.0.0/dataset/donotexists' ];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.code[0].targetProduct.output = [ 'myctnr/0.0.0/dataset/donotexists' ];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl (no isBasedOnUrl at all)', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        delete myctnr.dataset[2].isBasedOnUrl;
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.dataset[2].isBasedOnUrl = ['http://ex.com/smtgelse'];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it('should throw an error when a code list as output a local figure that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.figure[0].isBasedOnUrl = myctnr.figure[0].isBasedOnUrl.slice(0,1);
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

    it("should throw an error when a resource list as isBasedOnUrl code that does not list that resource as it's outpt", function(){
      assert.throws( function(){ 
        var myctnr = clone(ctnr);
        myctnr.dataset[1].isBasedOnUrl = [ 'myctnr/0.0.0/code/myanalytics' ];
        cjsonld.validateRequire(myctnr)
      }, Error);
    });

  });

});
