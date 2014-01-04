var fs = require('fs')
  , assert = require('assert')
  , clone = require('clone')
  , ldjson = require('..')
  , path = require('path');


var root = path.dirname(__filename);

var dpkg = require(path.join(root, 'fixture', 'package.json'));

describe('datapacakge-jsonld', function(){

  it('should jsonldify', function(){
    
    var ldpkg = ldjson.ify(clone(dpkg));

    assert.equal(ldpkg['@context'], 'http://schema.standardanalytics.io/spec/datapackage.jsonld');
    assert.equal(ldpkg['@id'], 'mydpkg/0.0.0');
    assert.equal(ldpkg['@type'], 'DataCatalog');
    assert.equal(ldpkg.author['@type'], 'Person');
    assert.equal(ldpkg.code[0]['@type'], 'Code');
    ldpkg.resources.forEach(function(r){
      assert.equal(r['@type'], 'DataSet');
      assert.equal(r['@id'], 'mydpkg/0.0.0/' + r.name);
      assert.deepEqual(r.catalog, { name: 'mydpkg', version: '0.0.0', url: 'mydpkg/0.0.0' } );
      assert.equal(r.distribution['@type'], 'DataDownload');
    });

  });

  it('should respect pre-existing resource @type', function(){
    var mydpkg = clone(dpkg);
    mydpkg.resources[0]['@type'] = 'StatTest';
    var ldpkg = ldjson.ify(mydpkg);
    assert.deepEqual(['StatTest', 'DataSet'], ldpkg.resources[0]['@type']);
  });

  it('should respect pre-existing resource @type array', function(){
    var mydpkg = clone(dpkg);
    mydpkg.resources[0]['@type'] = ['StatTest', 'Chi2Test'];
    var ldpkg = ldjson.ify(mydpkg);
    assert.deepEqual(['StatTest', 'Chi2Test', 'DataSet'], ldpkg.resources[0]['@type']);
  });

});
