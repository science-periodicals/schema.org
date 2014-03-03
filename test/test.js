var fs = require('fs')
  , url = require('url')
  , assert = require('assert')
  , clone = require('clone')
  , cjsonld = require('..')
  , path = require('path');

var root = path.dirname(__filename);
var base = cjsonld.context['@context']['@base'];

var sch = JSON.parse(fs.readFileSync(path.join(root, 'fixture', 'scheme.jsonld')));

describe('scheme-jsonld', function(){

  describe('jsonldify', function(){

    it('should add @type and @id', function(){
      
      var scheme = cjsonld.linkScheme(clone(sch));

      assert.equal(scheme['@context'], cjsonld.contextUrl);
      assert.equal(scheme['@id'], 'mysch/0.0.0');
      assert.deepEqual(scheme['@type'], ['Scheme', 'DataCatalog']);
      assert.equal(scheme.author['@type'], 'Person');
      assert.deepEqual(scheme.registry, { name: 'Standard Analytics IO', url:'https://registry.standardanalytics.io/' } );
      scheme.dataset.forEach(function(r){
        assert.equal(r['@type'], 'Dataset');
        assert.equal(r['@id'], 'mysch/0.0.0/dataset/' + r.name);
        assert.deepEqual(r.catalog, { '@type': ['Scheme', 'DataCatalog'], name: 'mysch', version: '0.0.0', url: 'mysch/0.0.0' } );
        assert.equal(r.distribution['@type'], 'DataDownload');
      });
      scheme.code.forEach(function(r){
        assert.equal(r['@type'], 'Code');
        assert.equal(r['@id'], 'mysch/0.0.0/code/' + r.name);
        assert.deepEqual(r.scheme, { name: 'mysch', version: '0.0.0', url: 'mysch/0.0.0' } );
        assert.equal(r.targetProduct['@type'], 'SoftwareApplication');
      });
      scheme.figure.forEach(function(r){
        assert.equal(r['@type'], 'ImageObject');
        assert.equal(r['@id'], 'mysch/0.0.0/figure/' + r.name);
        assert.deepEqual(r.scheme, { name: 'mysch', version: '0.0.0', url: 'mysch/0.0.0' } );
      });
    });

    it('should respect pre-existing figure or code @type', function(){
      var mysch = clone(sch);
      mysch.code[0]['@type'] = 'CodeType';
      var scheme = cjsonld.linkScheme(mysch);
      assert.deepEqual(['CodeType', 'Code'], scheme.code[0]['@type']);
    });

    it('should respect pre-existing figure or code @type array', function(){
      var mysch = clone(sch);
      mysch.figure[0]['@type'] = ['FigType', 'FigType2'];
      var scheme = cjsonld.linkScheme(mysch);
      assert.deepEqual(['FigType', 'FigType2', 'ImageObject'], scheme.figure[0]['@type']);
    });

    it('should add @type Dataset only if type is non existent', function(){
      var mysch = clone(sch);
      mysch.dataset[0]['@type'] = 'EmpiricalDataset';
      var scheme = cjsonld.linkScheme(mysch);
      assert.equal('EmpiricalDataset', scheme.dataset[0]['@type']);
    });

  });

  describe('dataDependencies', function(){
    
    it('should extract dataDependencies', function(){
      var isBasedOnUrl = [
        'sch0/0.0.0',
        'sch1/latest',
        url.resolve(base, 'sch2/0.0.0'),
        url.resolve(base, 'sch3/0.0.1'),
        url.resolve(base, 'sch4/latest'),
        url.resolve(base, 'sch5/latest?range=' + encodeURIComponent('>2.0.0')),
        'http://example.com/a/b',
        'https://example.com/a/b/c/'
      ];
      var dataDependencies = cjsonld.dataDependencies(isBasedOnUrl);
      var expected = { sch0: '0.0.0', sch1: '*', sch2: '0.0.0', sch3: '0.0.1', sch4: '*', sch5: '>2.0.0' };

      assert.deepEqual(dataDependencies, expected);
    });

    it('should throw an error when a version range does not respect semver', function(){      
      assert.throws( function(){ cjsonld.dataDependencies(['sch/a.b.c']); }, Error );
    });
    
    it('should throw an error when a sch as an invalid URI', function(){
      assert.throws( function(){ cjsonld.dataDependencies(['sch']); }, Error);
      assert.throws( function(){ cjsonld.dataDependencies(['']); }, Error );
      assert.throws( function(){ cjsonld.dataDependencies([base]); }, Error );            
    });

    it('should throw an error when a sch is listed many times as dep', function(){      
      assert.throws( function(){ cjsonld.dataDependencies(['sch/0.0.0', url.resolve(base, 'sch/0.1.1')]); }, Error );     
    });

  });

  describe('required links', function(){

    it('should validate a valid required uri', function(){
      assert(!cjsonld.validateRequiredUri('sch2/0.0.0', 'sch', '0.0.0', {sch2: '*'}));
    });
    
    it('should throw an error when on whithin sch version mismatch', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('sch/0.0.0', 'sch', '0.0.1', {});
      }, Error);
    });

    it('should throw an error when a required uri is not listed as dep', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('sch2/0.0.0', 'sch', '0.0.0', {});
      }, Error);
    });

    it('should throw an error when a required uri does not satisfy the dep version', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('sch2/0.0.0', 'sch', '0.0.0', {'sch2':'0.1.0'});
      }, Error);
    });

    it('should throw an error on invalid uri', function(){
      assert.throws( function(){ 
        cjsonld.validateRequiredUri('sch2', 'sch', '0.0.0', {'sch2':'0.1.0'});
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

    it('should validate when a scheme has valid require link', function(){
      var mysch = clone(sch);    
      assert(!cjsonld.validateRequire(sch));
    });

    it('should throw an error when a code has invalid require links', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.code = [ { targetProduct: { input: ['sch5/0.0.0'] } } ];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a dataset point to an invalid require links', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.dataset[1].isBasedOnUrl = [ 'mysch/0.0.1/code/myanalytics' ];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a code list as input a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.code[0].targetProduct.input = [ 'mysch/0.0.0/dataset/donotexists' ];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not exists', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.code[0].targetProduct.output = [ 'mysch/0.0.0/dataset/donotexists' ];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl (no isBasedOnUrl at all)', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        delete mysch.dataset[2].isBasedOnUrl;
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a code list as output a local dataset that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.dataset[2].isBasedOnUrl = ['http://ex.com/smtgelse'];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it('should throw an error when a code list as output a local figure that does not list this code as isBasedOnUrl', function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.figure[0].isBasedOnUrl = mysch.figure[0].isBasedOnUrl.slice(0,1);
        cjsonld.validateRequire(mysch)
      }, Error);
    });

    it("should throw an error when a resource list as isBasedOnUrl code that does not list that resource as it's outpt", function(){
      assert.throws( function(){ 
        var mysch = clone(sch);
        mysch.dataset[1].isBasedOnUrl = [ 'mysch/0.0.0/code/myanalytics' ];
        cjsonld.validateRequire(mysch)
      }, Error);
    });

  });

});
