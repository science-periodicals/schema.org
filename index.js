exports.context = {
  "@context": {
    "spec": "http://schema.standardanalytics.io/spec/",
    "schema": "http://schema.org/",
    "nfo": "http://www.semanticdesktop.org/ontologies/nfo/#",
    "@base": "http://registry.standardanalytics.io/",

    "url": { "@id": "schema:url", "@type": "@id" },
    "contentUrl": { "@id": "schema:contentUrl", "@type": "@id" },
    "contentSize": "schema:contentSize",
    "encodingFormat": "schema:encodingFormat",
    "name": "schema:name",
    "version": "schema:version",
    "license": "spec:license",
    "description": "schema:description",
    "keywords": { "@id": "schema:keywords", "@container": "@list" },
    "author": "schema:author",
    "contributor": "schema:contributor",
    "email": { "@id": "http://xmlns.com/foaf/0.1/mbox", "@type": "@id" },    
    "dataDependencies": { "@id": "spec:dataDependencies", "@type": "@id", "@container": "@set" },
    //"data": "spec:data", commented out on purpose: we don't want the data object from a semantic perspective'
    "resources": { "@id": "spec:resources", "@container": "@set" },
    "Person": { "@id": "schema:Person", "@type": "@id" },
    "DataCatalog": { "@id": "schema:DataCatalog", "@type": "@id" },
    "DataDownload": { "@id": "schema:DataDownload", "@type": "@id" },
    "DataSet": { "@id": "schema:DataSet", "@type": "@id" },
    "isBasedOnUrl": "schema:isBasedOnUrl",
    "catalog": "schema:catalog",
    "distribution": "schema:distribution",
    "encoding": "schema:encoding",
    "hashAlgorithm": "nfo:hashAlgorithm",
    "hashValue": "nfo:hashValue",
    "code": {"@id": "spec:code", "@container": "@list"},
    "Code": { "@id": "schema:Code", "@type": "@id" },
    "codeRepository": { "@id": "schema:codeRepository", "@type": "@id" },
    "runtime": "schema:runtime",
    "programmingLanguage": "schema:programmingLanguage"
  }
};

var URL = 'http://standardanalytics.io/contexts/datapackage.jsonld';

exports.contextUrl = URL;
exports.link = '<' + URL + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';


/**
 * modifies dpkg in place to add @id, @type and optionaly @context
 */
exports.ify = function(dpkg, options){  
  options = options || {addCtx: true};
  if(! ('addCtx' in options)){
    options.addCtx = true;
  }

  if(options.addCtx){
    var ctx = options.ctx || URL;
    dpkg["@context"] = ctx;
  }

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
