exports.context = {
  "@context": {
    "spec": "http://schema.standardanalytics.io/spec/",
    "sch": "http://schema.org/",
    "nfo": "http://www.semanticdesktop.org/ontologies/nfo/#",
    "@base": "http://registry.standardanalytics.io/",

    "url": { "@id": "sch:url", "@type": "@id" },
    "contentUrl": { "@id": "sch:contentUrl", "@type": "@id" },
    "contentSize": "sch:contentSize",
    "encodingFormat": "sch:encodingFormat",
    "name": "sch:name",
    "version": "sch:version",
    "license": "spec:license",
    "description": "sch:description",
    "keywords": { "@id": "sch:keywords", "@container": "@list" },
    "author": "sch:author",
    "contributor": "sch:contributor",
    "email": { "@id": "http://xmlns.com/foaf/0.1/mbox", "@type": "@id" },    
    "dataDependencies": { "@id": "spec:dataDependencies", "@type": "@id", "@container": "@set" },
    //"data": "spec:data", commented out on purpose: we don't want the data object from a semantic perspective'
    "Person": { "@id": "sch:Person", "@type": "@id" },
    "DataCatalog": { "@id": "sch:DataCatalog", "@type": "@id" },
    "DataDownload": { "@id": "sch:DataDownload", "@type": "@id" },
    "DataSet": { "@id": "sch:DataSet", "@type": "@id" },
    "isBasedOnUrl": "sch:isBasedOnUrl",
    "dataset": "sch:dataset",
    "catalog": "sch:catalog",
    "distribution": "sch:distribution",
    "encoding": "sch:encoding",
    "hashAlgorithm": "nfo:hashAlgorithm",
    "hashValue": "nfo:hashValue",
    "code": {"@id": "spec:code", "@container": "@list"}, //TODO change to repository
    "Code": { "@id": "sch:Code", "@type": "@id" },
    "codeRepository": { "@id": "sch:codeRepository", "@type": "@id" },
    "runtime": "sch:runtime",
    "programmingLanguage": "sch:programmingLanguage"
  }
};

var URL = 'http://registry.standardanalytics.io/contexts/datapackage.jsonld';

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

  if('dataset' in dpkg){
    dpkg.dataset.forEach(function(r){
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

  dpkg.catalog = { name: dpkg.name, url: dpkg.name };

  return dpkg;
};
