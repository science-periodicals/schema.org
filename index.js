//NOTE: this module has to be written so that it can be used from within CouchDb...

var isUrl = require('is-url')
  , semver = require('semver')
  , url = require('url');

var BASE = "https://registry.standardanalytics.io/";
var URL = 'https://registry.standardanalytics.io/contexts/datapackage.jsonld';

exports.contextUrl = URL;
exports.link = '<' + URL + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';

exports.context = {
  "@context": {
    "@base": BASE,

    "dpkg": "http://standardanalytics.io/datapackage/",
    "sch":  "http://schema.org/",
    "nfo":  "http://www.semanticdesktop.org/ontologies/nfo/#",
    "dc":   "http://purl.org/dc/terms/",

    "repository": { "@id": "dpkg:code",                      "@container": "@set" },
    "analytics":  { "@id": "dpkg:analytics",                 "@container": "@list" },
    "input":      { "@id": "dpkg:input",     "@type": "@id", "@container": "@set" },
    "output":     { "@id": "dpkg:output",    "@type": "@id", "@container": "@set" },
    "path": "dpkg:path",
    "contentPath": "dpkg:contentPath",
    "contentData": "dpkg:contentData",

    "license": "dc:license",

    "email": { "@id": "http://xmlns.com/foaf/0.1/mbox", "@type": "@id" },

    "hashAlgorithm": "nfo:hashAlgorithm",
    "hashValue": "nfo:hashValue",

    "keywords":       { "@id": "sch:keywords",                       "@container": "@list" },
    "isBasedOnUrl":   { "@id": "sch:isBasedOnUrl",   "@type": "@id", "@container": "@list" }, //dataDependencies
    "citation":       { "@id": "sch:citation",       "@type": "@id", "@container": "@list" },
    "contributor":    { "@id": "sch:contributor",                    "@container": "@list" },
    "dataset":        { "@id": "sch:dataset",                        "@container": "@list" },
    "codeRepository": { "@id": "sch:codeRepository", "@type": "@id" },
    "targetProduct":  { "@id": "sch:targetProduct",  "@type": "@id" },
    "url":            { "@id": "sch:url",            "@type": "@id" },
    "contentUrl":     { "@id": "sch:contentUrl",     "@type": "@id" },

    "name":                "sch:name",
    "about":               "sch:about",
    "version":             "sch:version",
    "description":         "sch:description",
    "distribution":        "sch:distribution",
    "author":              "sch:author",
    "encoding":            "sch:encoding",
    "runtime":             "sch:runtime",
    "programmingLanguage": "sch:programmingLanguage",
    "operatingSystem":     "sch:operatingSystem",
    "sampleType":          "sch:sampleType", //executable script ready to be run
    "contentSize":         "sch:contentSize",
    "encodingFormat":      "sch:encodingFormat",
    "catalog":             "sch:catalog",

    "MediaObject":         { "@id": "sch:MediaObject",         "@type": "@id" },
    "Person":              { "@id": "sch:Person",              "@type": "@id" },
    "Organization":        { "@id": "sch:Person",              "@type": "@id" },
    "DataCatalog":         { "@id": "sch:DataCatalog",         "@type": "@id" },
    "DataDownload":        { "@id": "sch:DataDownload",        "@type": "@id" },
    "Dataset":             { "@id": "sch:Dataset",             "@type": "@id" },
    "Code":                { "@id": "sch:Code",                "@type": "@id" },
    "SoftwareApplication": { "@id": "sch:SoftwareApplication", "@type": "@id" }
  }
};

exports.schema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object', 
  properties: {

    name: { type: 'string' },
    version: { type: 'string' },
    license: { type: 'string' },
    description: { type: 'string' },
    about: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string' }
      }
    },
    author: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' }
      },
      required: ['name']
    },
    contributor: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' }
        },
        required: ['name']
      }
    },
    keywords: { type: 'array', items: { type: 'string' } },
    isBasedOnUrl: { type: 'array', items: { type: 'string' } },
    repository: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          codeRepository: { type: 'string' },
          path: { type: 'string' }
        }
      }
    },
    encoding: { //dist_.tar.gz
      type: 'object',
      properties: {
        contentUrl: { type: 'string' },
        contentSize: { type: 'integer' },
        encodingFormat: { type: 'string' },
        hashAlgorithm: { type: 'string' },
        hashValue: { type: 'string' },
        uploadDate: { type: 'string' }
      },
      required: ['contentUrl']
    },

    catalog: { //if a catalog is part of a larger catalog (i.e a registry)
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string' }
      }
    },

    datePublished: { type: 'string' },

    dataset: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string'},
          description: { type: 'string'},
          isBasedOnUrl: { type: 'array', items: { type: 'string' } },
          distribution: {
            type: 'object',
            properties: {              
              '@context': { type: 'object' },
              contentUrl: { type: 'string' },
              contentPath: { type: 'string' },
              contentData: { type: 'string' },
              contentSize: { type: 'integer' },           
              encodingFormat: { type: 'string' },
              hashAlgorithm: { type: 'string' },
              hashValue: { type: 'string' },
              uploadDate: { type: 'string' },
              encoding: { //in case resource can be further compressed
                type: 'object',
                properties: {
                  contentSize: { type: 'integer' },
                  encodingFormat: { type: 'string' },
                }
              }
            }
          },
          catalog: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              version: { type: 'string' },
              url: { type: 'string' }
            }
          }
        },
        required: [ 'name' ],
      }
    },

    analytics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string'},
          description: { type: 'string'},
          programmingLanguage: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
            required: [ 'name' ]
          },
          runtime: { type: 'string' },
          targetProduct: { 
            type: 'object',
            properties: {
              operatingSystem: { type: 'string' }
            },
            required: [ 'operatingSystem' ]
          },
          sampleType: { type: 'string'},
          codeRepository: { type: 'string'},
          input:  { type: 'array', items: { type: 'string'} },
          output: { type: 'array', items: { type: 'string'} },
          isBasedOnUrl: { type: 'array', items: { type: 'string' } },
          catalog: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              version: { type: 'string' },
              url: { type: 'string' }
            }
          }
        },
        required: [ 'name' ]
      }
    }

  },
  required: ['name', 'version']
};


/**
 * add @type to an obj if possible
 */
function _addType(x, type){

  if( (typeof x !== 'object') || Array.isArray(x) ){
    return;
  }
  
  //x is an obj
  if( !('@type' in x) ){
    x['@type'] = type;
  } else if(Array.isArray(x['@type'])){
    if(x['@type'].indexOf(type) === -1){
      x['@type'].push(type);
    }
  } else if(typeof x['@type'] === 'string'){
    if(x['@type'] !== type){
      x['@type'] = [x['@type'], type];
    }
  }

  return x;
};


/**
 * modifies dpkg in place to add @id, @type and optionaly @context
 */
exports.linkDpkg = function(dpkg, options){  
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

  if( 'author' in dpkg && !('@type' in dpkg.author) ){ //pre-existing type might be Organization
    _addType(dpkg.author, 'Person');
  }

  if('repository' in dpkg){
    dpkg.repository.forEach(function(c){
      _addType(c, 'Code');
    });
  }

  if('contributor' in dpkg){
    dpkg.contributor.forEach(function(c){
      if ( !('@type' in c) ) { //pre-existing type might be Organization
        _addType(c, 'Person');
      }
    });
  }

  if('dataset' in dpkg){
    dpkg.dataset.forEach(function(r){
      linkDataset(r, dpkg.name, dpkg.version);
    });
  }

  if('analytics' in dpkg){
    dpkg.analytics.forEach(function(r){
      linkAnalytics(r, dpkg.name, dpkg.version);
    });
  }

  dpkg.catalog = { name: dpkg.name, url: dpkg.name };

  return dpkg;
};

/**
 * modifies dataset in place to add @id, @type
 */
function linkDataset(dataset, name, version){
  if('name' in dataset){
    dataset['@id'] = name + '/' + version + '/dataset/' + dataset.name;
  }

  _addType(dataset, 'Dataset');
  _addType(dataset.distribution, 'DataDownload');

  dataset.catalog = { name: name, version: version, url: name + '/' + version };  
  
  return dataset;
};
exports.linkDataset = linkDataset;



/**
 * modifies dataset in place to add @id, @type
 */
function linkAnalytics(analytics, name, version){
  if('name' in analytics){
    analytics['@id'] = name + '/' + version + '/analytics/' + analytics.name;
  }

  _addType(analytics, 'Code');
  _addType(analytics.targetProduct, 'SoftwareApplication');

  analytics.catalog = { name: name, version: version, url: name + '/' + version };  
  
  return analytics;
};
exports.linkAnalytics = linkAnalytics;






/**
 * validate isBasedOnUrl and returns a dataDependencies hash
 */
exports.dataDependencies = function(isBasedOnUrl){

  if(!isBasedOnUrl) return undefined;

  var dataDependencies = {};

  isBasedOnUrl.forEach(function(uri){
    var absUrl = (isUrl(uri)) ? uri : url.resolve(BASE, uri);
    var urlObj = url.parse(absUrl, true);

    if(urlObj.hostname === url.parse(BASE).hostname){ //it's a dpkg of this registry
      var pathname = urlObj.pathname.replace(/^\//, '');
      var splt = pathname.split('/'); //name, version, ...
      if(splt.length < 2){
        throw new Error('invalid URI: '+ uri);
      }

      var name = splt[0];
      var version = splt[1];
      if(version === 'latest'){
        version = (urlObj.query && urlObj.query.range) || '*';
      }

      if(!semver.validRange(version)){
        throw new Error('invalid version/range '+ version);        
      }

      if(name in dataDependencies){
        throw new Error(name + ' is already listed as dependencies');
      }
      dataDependencies[name] = version;
    }
  });

  return dataDependencies;
};

/**
 * make sure that link to dpkg hosted on the registry respect the
 * versioning scheme used
 */
function validateRequiredUri(uri, name, version, dataDependencies){

  var dataDependencies = dataDependencies || {};

  var absUrl = (isUrl(uri)) ? uri : url.resolve(BASE, uri);
  var urlObj = url.parse(absUrl);

  if(urlObj.hostname === url.parse(BASE).hostname){ //it's a dpkg of this registry
    var pathname = urlObj.pathname.replace(/^\//, '');
    var splt = pathname.split('/'); //name, version, ...

    if(splt.length < 2){
      throw new Error('invalid URI: '+ uri);
    }
    
    if (splt[0] === name){ //whithin dpkg link
      if (splt[1] !== version){
        throw new Error('version mismatch for :' + uri);
      } else {
        return;
      };
    } else { //link to another dpkg on this registry: does it satisfies the data dependencies constraints ?

      if(!(splt[0] in dataDependencies)){
        throw new Error( splt[0] + '/' + splt[1] + ' is not listed in isBasedOnUrl (required in ' + uri  + ')');
      } else {        
        //check version match
        if(!semver.satisfies(splt[1], dataDependencies[splt[0]])){
          throw new Error( uri + ' does not respect semver requirement of isBasedOnUrl (' + dataDependencies[splt[0]] + ')');
        };
      }      
    }
  }
};
exports.validateRequiredUri = validateRequiredUri;

exports.validateRequire = function(dpkg, dataDependencies){

  var dataDependencies = dataDependencies || exports.dataDependencies(dpkg.isBasedOnUrl);

  var dataset = dpkg.dataset || [];
  dataset.forEach(function(r){
    if('distribution' in r && r.distribution.contentUrl) {
      validateRequiredUri(r.distribution.contentUrl, dpkg.name, dpkg.version, dataDependencies);
    }
  });

  var analytics = dpkg.analytics || [];
  analytics.forEach(function(r){
    ['input', 'output'].forEach(function(prop){
      if (prop in r) {
        r[prop].forEach(function(uri){
          validateRequiredUri(uri, dpkg.name, dpkg.version, dataDependencies);
        });
      }
    });
  });

};
