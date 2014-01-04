/**
 * modifies dpkg in place to add @id and @type
 */

exports.ify = function(dpkg, options){  
  options = options || {};

  var ctx = options.ctx || "http://schema.standardanalytics.io/spec/datapackage.jsonld";

  dpkg["@context"] = ctx;
  dpkg['@id'] = dpkg.name + '/' + dpkg.version;
  dpkg['@type'] = 'DataCatalog';

  if('author' in dpkg){
    dpkg.author['@type'] = 'Person';
  }

  if('code' in dpkg){
    dpkg.code.forEach(function(c){
      c['@type'] = 'Code';
    });
  }

  if('resources' in dpkg){
    dpkg.resources.forEach(function(r){
      if('name' in r){
        r['@id'] = dpkg['@id'] + '/' + r.name;
      }

      if('@type' in r){
        if(Array.isArray(r['@type'])){
            if(r['@type'].indexOf('DataSet') === -1){
              r['@type'].push('DataSet');
            }
        } else if (r['@type'] !== 'DataSet') {
          r['@type'] = [ r['@type'], 'DataSet' ];
        }
      } else {
        r['@type'] = 'DataSet';
      }      

      if('distribution' in r){
        r.distribution['@type'] = 'DataDownload';
      }

      r.catalog = { name: dpkg.name, version: dpkg.version, url: dpkg['@id'] }
    });
  }

  return dpkg;
  
};
