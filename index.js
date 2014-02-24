//NOTE: this module has to be written so that it can be used from within CouchDb...

var isUrl = require('is-url')
  , semver = require('semver')
  , url = require('url');

var BASE = "https://registry.standardanalytics.io/";
var URL = 'https://registry.standardanalytics.io/container.jsonld';

exports.contextUrl = URL;
exports.link = '<' + URL + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';

exports.terms = {
  "@context": {
    "container": "http://standardanalytics.io/container/",
    "schema": "http://schema.org/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "vs": "http://www.w3.org/2003/06/sw-vocab-status/ns#",
    "defines": {
      "@reverse": "rdfs:isDefinedBy"
    },
    "comment": "rdfs:comment",
    "label": "rdfs:label",
    "domain": {
      "@id": "rdfs:domain",
      "@type": "@id"
    },
    "range": {
      "@id": "rdfs:range",
      "@type": "@id"
    },
    "subClassOf": {
      "@id": "rdfs:subClassOf",
      "@type": "@id",
      "@container": "@set"
    },
    "subPropertyOf": {
      "@id": "rdfs:subPropertyOf",
      "@type": "@id",
      "@container": "@set"
    },
    "seeAlso": {
      "@id": "rdfs:seeAlso",
      "@type": "@id"
    },
    "status": "vs:term_status"
  },
  "@id": "http://standardanalytics.io/container",
  "defines": [
    {
      "@id": "ctnr:repository",
      "@type": "rdf:Property",
      "label": "repository",
      "comment":"Array of repositories where the package can be located. For a github repository, for example, it is common practice to indicate the codeRepository link to the repo, and the relative path of the folder.",
      "range": "schema:Code",
      "domain": "ctnr:Container",
      "status": "testing",
      "seeAlso": "http://schema.org/Code"
    },
    {
      "@id": "ctnr:path",
      "@type": "rdf:Property",
      "label": "path",
      "comment":"Absolute or relative path.",
      "range": "xsd:string",
      "domain": "schema:Code",
      "status": "testing",
      "seeAlso": "http://wiki.commonjs.org/wiki/Packages/1.1"
    },

    {
      "@id": "ctnr:dataset",
      "@type": "rdf:Property",
      "label": "dataset",
      "comment":"List of dataset",
      "range": "schema:Code",
      "domain": "ctnr:Container",
      "status": "testing",
      "seeAlso": "http://schema.org/Dataset"
    },
    {
      "@id": "ctnr:code",
      "@type": "rdf:Property",
      "label": "code",
      "comment":"List of code resources used for analytics or views",
      "range": "schema:Code",
      "domain": "ctnr:Container",
      "status": "testing",
      "seeAlso": "http://schema.org/Code"
    },
    {
      "@id": "ctnr:figure",
      "@type": "rdf:Property",
      "label": "figure",
      "comment":"List of figures",
      "range": "schema:ImageObject",
      "domain": "ctnr:Container",
      "status": "testing",
      "seeAlso": "http://schema.org/ImageObject"
    },
    {
      "@id": "ctnr:registry",
      "@type": "rdf:Property",
      "label": "registry",
      "comment":"registry hosting resource of type Container",
      "range": "schema:Thing",
      "domain": "ctnr:Container",
      "status": "testing",
      "seeAlso": "http://en.wikipedia.org/wiki/Metadata_registry"
    },

    {
      "@id": "ctnr:container",
      "@type": "rdf:Property",
      "label": "container",
      "comment":"container hosting the resource",
      "range": "schema:Thing",
      "domain": "schema:CreativeWork", //TODO fix that: if domain can be a list, should be Dataset, Code and ImageObject
      "status": "testing",
      "seeAlso": "http://www.schema.org/catalog"
    },

    {
      "@id": "ctnr:input",
      "@type": "rdf:Property",
      "label": "input",
      "comment":"List of absolute or relative URLs of data resources used in a given analysis.",
      "range": "xsd:string",
      "domain": "schema:SoftwareApplication",
      "status": "testing",
      "seeAlso": "http://schema.org/SoftwareApplication"
    },
    {
      "@id": "ctnr:output",
      "@type": "rdf:Property",
      "label": "output",
      "comment":"List of absolute or relative URLs of data resources generated in a given analysis.",
      "range": "xsd:string",
      "domain": "schema:SoftwareApplication",
      "status": "testing",
      "seeAlso": "http://schema.org/SoftwareApplication"
    },
    {
      "@id": "ctnr:filePath",
      "@type": "rdf:Property",
      "comment":"Unix-style ('/') path to a runnable file (typically a script) or binary. The path must be relative to the directory in which the Container containing this resource resides.",
      "label": "file path",
      "range": "xsd:string",
      "domain": "schema:SoftwareApplication",
      "status": "testing",
      "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
    },
    {
      "@id": "ctnr:contentData",
      "@type": "rdf:Property",
      "comment":"Inline data content of a container dataset.",
      "label": "content data",
      "range": "xsd:string",
      "domain": "schema:DataDownload",
      "status": "testing",
      "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
    },
    {
      "@id": "ctnr:contentPath",
      "@type": "rdf:Property",
      "comment":"Unix-style ('/') path to the data content of a container dataset. The path must be relative to the directory in which the Container containing this resource resides.",
      "label": "content path",
      "range": "xsd:string",
      "domain": "schema:DataDownload",
      "status": "testing",
      "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
    },

    {
      "@id": "ctnr:valueType",
      "@type": "rdf:Property",
      "label": "value type",
      "comment":"The type (typicaly xsd) of a value",
      "range": "xsd:string",
      "domain": "schema:Thing",
      "status": "testing",
      "seeAlso": "http://www.w3.org/2001/XMLSchema"
    },

    {
      "@id": "ctnr:Container",
      "@type": "rdfs:Class",
      "label": "Container",
      "comment": "A collection of resources associated with structured metadata describing their content and relationships", //TODO improve definition
      "seeAlso": "http://schema.org/DataCatalog",
      "subClassOf": [
        "schema:CreativeWork"
      ],
      "status": "testing"
    },

    {
      "@id": "ctnr:Prior",
      "@type": "rdfs:Class",
      "label": "Statistical Prior",
      "comment": "A body of structured information describing a statistical prior",
      "seeAlso": "http://en.wikipedia.org/wiki/Prior",
      "subClassOf": [
        "schema:Dataset"
      ],
      "status": "testing"
    },

    {
      "@id": "ctnr:Analytics",
      "@type": "rdfs:Class",
      "label": "Analytics",
      "comment": "A body of structured information describing the discovery of meaningful patterns in data",
      "seeAlso": "http://en.wikipedia.org/wiki/Analytics",
      "subClassOf": [
        "schema:Dataset"
      ],
      "status": "testing"
    },

    {
      "@id": "ctnr:EmpiricalDataset",
      "@type": "rdfs:Class",
      "label": "empirical data",
      "comment": "Data acquired by means of observation or experimentation.",
      "seeAlso": "http://en.wikipedia.org/wiki/Empirical_evidence",
      "subClassOf": [
        "schema:Dataset"
      ],
      "status": "testing"
    },

    {
      "@id": "ctnr:SimulatedDataset",
      "@type": "rdfs:Class",
      "label": "simulated data",
      "comment": "Data acquired by means of computer simulation",
      "seeAlso": "http://en.wikipedia.org/wiki/Computer_simulation",
      "subClassOf": [
        "schema:Dataset"
      ],
      "status": "testing"
    },

    {
      "@id": "ctnr:Configuration",
      "@type": "rdfs:Class",
      "label": "Configuration file",
      "comment": "Configuration file configure the initial settings for some computer programs",
      "seeAlso": "http://en.wikipedia.org/wiki/Configuration_file",
      "subClassOf": [
        "schema:Dataset"
      ],
      "status": "testing"
    }

  ],
  "@type": "owl:Ontology",
  "comment": "A lightweight vocabulary for terms of the data package spec",
  "label": "The data package Vocabulary"
};


exports.context = {
  "@context": {
    "@base": BASE,

    "ctnr": "http://standardanalytics.io/container/",
    "sch":  "http://schema.org/",
    "nfo":  "http://www.semanticdesktop.org/ontologies/nfo/#",
    "dc":   "http://purl.org/dc/terms/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",

    "Container":  { "@id": "ctnr:Container", "@type": "@id" },

    "container":  { "@id": "ctnr:container",                 "@container": "@list" },
    "repository": { "@id": "ctnr:repository",                "@container": "@list" },
    "dataset"   : { "@id": "ctnr:dataset",                   "@container": "@list" },
    "code":       { "@id": "ctnr:code",                      "@container": "@list" },
    "figure":     { "@id": "ctnr:figure",                    "@container": "@list" },
    "input":      { "@id": "ctnr:input",     "@type": "@id", "@container": "@set"  },
    "output":     { "@id": "ctnr:output",    "@type": "@id", "@container": "@set"  },
    "valueType":  { "@id": "ctnr:valueType", "@type": "@id" },
    "path": "ctnr:path",
    "contentPath": "ctnr:contentPath",
    "contentData": "ctnr:contentData",
    "filePath":    "ctnr:filePath",
    "registry":    "ctnr:registry",

    "license": "dc:license",

    "hashAlgorithm": "nfo:hashAlgorithm",
    "hashValue": "nfo:hashValue",

    "keywords":       { "@id": "sch:keywords",                       "@container": "@list" },
    "about":          { "@id": "sch:about",                          "@container": "@list" },
    "requirements":   { "@id": "sch:requirements",   "@type": "@id", "@container": "@list" },
    "isBasedOnUrl":   { "@id": "sch:isBasedOnUrl",   "@type": "@id", "@container": "@list" }, //dataDependencies
    "citation":       { "@id": "sch:citation",                       "@container": "@list" },
    "contributor":    { "@id": "sch:contributor",                    "@container": "@list" },
    "codeRepository": { "@id": "sch:codeRepository", "@type": "@id" },
    "discussionUrl":  { "@id": "sch:discussionUrl",  "@type": "@id" },
    "targetProduct":  { "@id": "sch:targetProduct",  "@type": "@id" },
    "url":            { "@id": "sch:url",            "@type": "@id" },
    "contentUrl":     { "@id": "sch:contentUrl",     "@type": "@id" },
    "downloadUrl":    { "@id": "sch:downloadUrl",    "@type": "@id" },

    "name":                  "sch:name",
    "email":                 "sch:email",
    "version":               "sch:version",
    "description":           "sch:description",
    "distribution":          "sch:distribution",
    "author":                "sch:author",
    "encoding":              "sch:encoding",
    "runtime":               "sch:runtime",
    "programmingLanguage":   "sch:programmingLanguage",
    "operatingSystem":       "sch:operatingSystem",
    "sampleType":            "sch:sampleType", //executable script ready to be run
    "contentSize":           "sch:contentSize",
    "encodingFormat":        "sch:encodingFormat",
    "datePublished":         "sch:datePublished",
    "uploadDate":            "sch:uploadDate",
    "caption":               "sch:caption",
    "thumbnail":             "sch:thumbnail",
    "exifData":              "sch:exifData",
    "height":                "sch:height",
    "width":                 "sch:width",
    "fileFormat":            "sch:fileFormat",
    "fileSize":              "sch:fileSize",
    "memoryRequirements":    "sch:memoryRequirements",
    "processorRequirements": "sch:processorRequirements",
    "storageRequirements":   "sch:storageRequirements",
    "softwareVersion":       "sch:softwareVersion",

    "MediaObject":         { "@id": "sch:MediaObject",         "@type": "@id" },
    "ImageObject":         { "@id": "sch:ImageObject",         "@type": "@id" },
    "Person":              { "@id": "sch:Person",              "@type": "@id" },
    "Organization":        { "@id": "sch:Person",              "@type": "@id" },
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
    citation: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' }
        }
      }
    },
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
    discussionUrl: { type: 'string' },
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

    registry: {
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
          discussionUrl: { type: 'string' },
          '@context': { type: 'object' },
          about: { type: ['object', 'array'] },
          distribution: {
            type: 'object',
            properties: {              
              contentUrl: { type: 'string' },
              contentPath: { type: 'string' },
              contentData: { type: ['string', 'object', 'array', 'number', 'boolean'] },
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
          container: {
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

    code: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string'},
          description: { type: 'string'},
          about: { type: 'object' },
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
              operatingSystem: { type: 'string' },
              requirements:  { type: 'array', items: { type: 'string'} },
              memoryRequirements: { type: 'string' },
              processorRequirements: { type: 'string' },
              storageRequirements: { type: 'string' },
              filePath: { type: 'string' },
              downloadUrl: { type: 'string' },
              fileSize: { type: 'integer' },
              fileFormat: { type: 'string' },
              hashAlgorithm: { type: 'string' },
              hashValue: { type: 'string' },
              input:  { type: 'array', items: { type: 'string'} },
              output: { type: 'array', items: { type: 'string'} },
              encoding: { //in case resource can be further compressed
                type: 'object',
                properties: {
                  contentSize: { type: 'integer' },
                  encodingFormat: { type: 'string' },
                }
              },
              softwareVersion: { type: 'string' }
            }
          },
          sampleType: { type: 'string'},
          codeRepository: { type: 'string'},
          discussionUrl:  { type: 'string' },
          isBasedOnUrl:   { type: 'array', items: { type: 'string' } },
          container: {
            type: 'object',
            properties: {
              name:    { type: 'string' },
              version: { type: 'string' },
              url:     { type: 'string' }
            }
          }
        },
        required: [ 'name' ]
      }
    },

    figure: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:           { type: 'string' },
          description:    { type: 'string' },
          about:          { type: 'object' },
          caption:        { type: 'string' },
          exifData:       { type: 'string' },
          width:          { type: 'string' }, //e.g "100px" ??
          height:         { type: 'string' },
          thumbnail:      { type: 'object' }, 
          contentUrl:     { type: 'string' },
          contentPath:    { type: 'string' },
          contentSize:    { type: 'integer' },           
          hashAlgorithm:  { type: 'string' },
          hashValue:      { type: 'string' },
          encodingFormat: { type: 'string' },        
          uploadDate:     { type: 'string' },
          isBasedOnUrl:   { type: 'array', items: { type: 'string' } },
          container: {
            type: 'object',
            properties: {
              name:    { type: 'string' },
              version: { type: 'string' },
              url:     { type: 'string' }
            }
          }
        }
      }
    }

  },
  required: ['name', 'version']
};


/**
 * add @type to an obj if possible
 */
function _addType(x, type, onlyIfEmpty){

  if( (typeof x !== 'object') || Array.isArray(x) ){
    return;
  }
   
  //x is an obj
  if( !('@type' in x) || !x['@type'] ){
    x['@type'] = type;
  } else if(!onlyIfEmpty && Array.isArray(x['@type'])){
    if(x['@type'].indexOf(type) === -1){
      x['@type'].push(type);
    }
  } else if(!onlyIfEmpty && typeof x['@type'] === 'string'){
    if(x['@type'] !== type){
      x['@type'] = [x['@type'], type];
    }
  }

  return x;
};


/**
 * modifies container in place to add @id, @type and optionaly @context
 */
exports.linkContainer = function(ctnr, options){  
  options = options || {addCtx: true};
  if(! ('addCtx' in options)){
    options.addCtx = true;
  }
  
  if(options.addCtx){
    var ctx = options.ctx || URL;
    ctnr["@context"] = ctx;
  }

  ctnr['@id'] = ctnr.name + '/' + ctnr.version;
  ctnr['@type'] = 'Container';

  if( 'author' in ctnr && !('@type' in ctnr.author) ){ //pre-existing type might be Organization
    _addType(ctnr.author, 'Person');
  }

  if('repository' in ctnr){
    ctnr.repository.forEach(function(c){
      _addType(c, 'Code');
    });
  }

  if('contributor' in ctnr){
    ctnr.contributor.forEach(function(c){
      if ( !('@type' in c) ) { //pre-existing type might be Organization
        _addType(c, 'Person');
      }
    });
  }

  if('dataset' in ctnr){
    ctnr.dataset.forEach(function(r){
      linkDataset(r, ctnr.name, ctnr.version);
    });
  }

  if('code' in ctnr){
    ctnr.code.forEach(function(r){
      linkCode(r, ctnr.name, ctnr.version);
    });
  }

  if('figure' in ctnr){
    ctnr.figure.forEach(function(r){
      linkFigure(r, ctnr.name, ctnr.version);
    });
  }

  ctnr.registry = { name: "Standard Analytics IO", url: BASE };

  return ctnr;
};

/**
 * modifies dataset in place to add @id, @type
 */
function linkDataset(dataset, name, version){
  if('name' in dataset){
    dataset['@id'] = name + '/' + version + '/dataset/' + dataset.name;
  }

  _addType(dataset, 'Dataset', true); //add default type only if empty (to avoid accumulating subClasses of Dataset).
  _addType(dataset.distribution, 'DataDownload');

  dataset.container = { name: name, version: version, url: name + '/' + version };  
  
  return dataset;
};
exports.linkDataset = linkDataset;


/**
 * modifies code in place to add @id, @type
 */
function linkCode(code, name, version){
  if('name' in code){
    code['@id'] = name + '/' + version + '/code/' + code.name;
  }

  _addType(code, 'Code');
  _addType(code.targetProduct, 'SoftwareApplication');

  code.container = { name: name, version: version, url: name + '/' + version };  
  
  return code;
};
exports.linkCode = linkCode;


/**
 * modifies code in place to add @id, @type
 */
function linkFigure(figure, name, version){
  if('name' in figure){
    figure['@id'] = name + '/' + version + '/figure/' + figure.name;
  }

  _addType(figure, 'ImageObject');

  figure.container = { name: name, version: version, url: name + '/' + version };  
  
  return figure;
};
exports.linkFigure = linkFigure;



/**
 * return parsed URL if the uri if from this registry
 */
function _parseUrl(uri){

  var absUrl = (isUrl(uri)) ? uri : url.resolve(BASE, uri);
  var urlObj = url.parse(absUrl, true);

  if(urlObj.hostname === url.parse(BASE).hostname){ //it's a ctnr of this registry
    var pathname = urlObj.pathname.replace(/^\//, '');
    var splt = pathname.split('/'); //name, version, ...

    if(splt.length < 2){
      throw new Error('invalid URI: '+ uri);
    }

    return {
      urlObj: urlObj,
      splt: splt,
      pathname: pathname
    };

  }

};


/**
 * validate isBasedOnUrl and returns a dataDependencies hash
 */
exports.dataDependencies = function(isBasedOnUrl){

  if(!isBasedOnUrl) return undefined;

  var dataDependencies = {};

  isBasedOnUrl.forEach(function(uri){
    var parsed = _parseUrl(uri);
    if(!parsed) return;

    var name = parsed.splt[0];
    var version = parsed.splt[1];
    if(version === 'latest'){
      version = (parsed.urlObj.query && parsed.urlObj.query.range) || '*';
    }

    if(!semver.validRange(version)){
      throw new Error('invalid version/range '+ version);        
    }

    if(name in dataDependencies){
      throw new Error(name + ' is already listed as dependencies');
    }
    dataDependencies[name] = version;

  });

  return dataDependencies;
};

/**
 * make sure that link to ctnr hosted on the registry respect the
 * versioning scheme used
 *
 * return parsed uri if within ctnr link
 */
function validateRequiredUri(uri, name, version, dataDependencies){

  var dataDependencies = dataDependencies || {};

  var parsed = _parseUrl(uri);
  if(!parsed) return;

  if (parsed.splt[0] === name){ //whithin ctnr link
    if (parsed.splt[1] !== version){
      throw new Error('version mismatch for :' + uri);
    } else {
      return parsed;
    };
  } else { //link to another ctnr on this registry: does it satisfies the data dependencies constraints ?

    if(!(parsed.splt[0] in dataDependencies)){
      throw new Error( parsed.splt[0] + '/' + parsed.splt[1] + ' is not listed in isBasedOnUrl (required in ' + uri  + ')');
    } else {        
      //check version match
      if(!semver.satisfies(parsed.splt[1], dataDependencies[parsed.splt[0]])){
        throw new Error( uri + ' does not respect semver requirement of isBasedOnUrl (' + dataDependencies[parsed.splt[0]] + ')');
      };
    }

  }
};

/**
 * suppose that ctnr schema has been validated
 */
exports.validateRequiredUri = validateRequiredUri;


/**
 * validate uri and in case it's an uri pointing to the current doc,
 * check that the resource pointed to exists and if it does return it.
 * If a resource points to code, check that the code list it as it inputs
 */
function _validateLink(uri, ctnr, dataDependencies){

  var parsed = validateRequiredUri(uri, ctnr.name, ctnr.version, dataDependencies);
  if(parsed){ //uri from this doc, validate that there is a matching resource
    var type = parsed.splt[2];

    if(['code', 'dataset', 'figure'].indexOf(type) === -1){
      throw new Error(  uri + ' should contain /dataset/, /code/ or /figure/');      
    } else {
      var array = ctnr[type] || [];
    }

    var name = parsed.splt[3];
    var matched;
    if(name){
      matched = array.filter(function(x){return x.name === name;})[0];              
    }
    
    if(matched){

      return {resource: matched, type:type};

    } else {

      throw new Error( 'input: ' + uri + ' does not have a matching resource within this container');

    }

  }
  
};

/**
 * validateRequire AND name
 */ 
exports.validateRequire = function(ctnr, dataDependencies){

  var dataDependencies = dataDependencies || exports.dataDependencies(ctnr.isBasedOnUrl);

  ['dataset', 'figure'].forEach(function(t){

    var resource = ctnr[t] || [];
    resource.forEach(function(r){
      validateName(r.name);

      if(r.contentUrl){
        _validateLink(r.contentUrl, ctnr, dataDependencies);
      }

      if('distribution' in r && r.distribution.contentUrl) {
        _validateLink(r.distribution.contentUrl, ctnr, dataDependencies);
      }

      if('isBasedOnUrl' in r){
        r.isBasedOnUrl.forEach(function(uri){
          var matched = _validateLink(uri, ctnr, dataDependencies);
          
          if(matched.type === 'code'){ //check that the matched code resource list the uri as it inputs
            if(! ('targetProduct' in matched.resource && matched.resource.targetProduct.output) ){
              throw new Error( t + ': ' + r.name  + ' points to code (' + uri + ") that does not list it as it's outputs");
            }
            
            var output = matched.resource.targetProduct.output
              .map(_parseUrl)
              .filter(function(x){return x;})
              .map(function(x) {return x.pathname;});
            
            if(output.indexOf( [ctnr.name, ctnr.version, t, r.name].join('/') ) === -1){
              throw new Error(  t + ': ' + r.name  + ' points to code (' + uri + ") that does not list it as it's outputs");
            }
          }

        });
      }
    });

  });

  var code = ctnr.code || [];
  code.forEach(function(r){
    validateName(r.name);

    if ('targetProduct' in r) {

      if('input' in r.targetProduct){
        r.targetProduct.input.forEach(function(uri){
          _validateLink(uri, ctnr, dataDependencies);
        });
      }

      if('output' in r.targetProduct){
        r.targetProduct.output.forEach(function(uri){
          var matched = _validateLink(uri, ctnr, dataDependencies);
          if(matched){ //check that isBasedOnUrl points to the code
            var isBasedOnUrl = matched.resource.isBasedOnUrl || [];
            isBasedOnUrl = isBasedOnUrl
              .map(_parseUrl)
              .filter(function(x){return x;})
              .map(function(x) {return x.pathname;});

            if(isBasedOnUrl.indexOf( [ctnr.name, ctnr.version, 'code', r.name].join('/') ) === -1){
              throw new Error( 'resource: ' + uri + ' should list ' + [ctnr.name, ctnr.version, 'code', r.name ].join('/') + ' in isBasedOnUrl');
            }
          } else {
            throw new Error( 'output: ' + uri + ' does not have a matching resource within this container');
          }
        });
      }
    }
  });
  
};


/**
 * inspired by npm name validation
 */
function validateName(name){

  if (!name) throw new Error('no name');

  var n = name.trim();

  if ( !n || n.charAt(0) === "."
       || !n.match(/^[a-zA-Z0-9]/)
       || n.match(/[\/\(\)&\?#\|<>@:%\s\\\*'"!~`]/)
       || ['auth', 'rmuser', 'adduser', 'owner', 'search', 'container.jsonld', 'dataset', 'code', 'figure', 'about', 'containers', 'favicon.ico'].indexOf(n.toLowerCase()) !== -1
       || n !== encodeURIComponent(n) ) {

    throw new Error('invalid name');
  }

};
exports.validateName = validateName;
