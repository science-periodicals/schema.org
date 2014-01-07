exports.context = {
  "@context": {
    "@base": "https://registry.standardanalytics.io/",

    "spec": "http://schema.standardanalytics.io/spec/",
    "sch":  "http://schema.org/",
    "nfo":  "http://www.semanticdesktop.org/ontologies/nfo/#",
    "dc":   "http://purl.org/dc/terms/"

    "repository": { "@id": "spec:code",                      "@container": "@set" },
    "analytics":  { "@id": "spec:analytics",                 "@container": "@list" },
    "input":      { "@id": "spec:input",     "@type": "@id", "@container": "@list" },
    "output":     { "@id": "spec:output",    "@type": "@id", "@container": "@list" },
    "path": "spec:path",
    //"data": "spec:data", commented out on purpose: we don't want the data object from a semantic perspective'

    "license": "dc:license",

    "email": { "@id": "http://xmlns.com/foaf/0.1/mbox", "@type": "@id" },

    "hashAlgorithm": "nfo:hashAlgorithm",
    "hashValue": "nfo:hashValue",

    "keywords":       { "@id": "sch:keywords",                       "@container": "@list" },
    "isBasedOnUrl":   { "@id": "sch:isBasedOnUrl",   "@type": "@id", "@container": "@list" }, //dataDependencies
    "citation":       { "@id": "sch:citation",       "@type": "@id", "@container": "@list" },
    "contributor":    { "sch:contributor",                           "@container": "@list" },
    "dataset":        { "sch:dataset",                               "@container": "@list" },
    "codeRepository": { "@id": "sch:codeRepository", "@type": "@id" },
    "targetProduct":  { "@id": "sch:targetProduct",  "@type": "@id" },
    "url":            { "@id": "sch:url",            "@type": "@id" },
    "contentUrl":     { "@id": "sch:contentUrl",     "@type": "@id" },

    "name":                "sch:name",
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

    "MediaObject"          { "@id": "sch:MediaObject",         "@type": "@id" },
    "Person":              { "@id": "sch:Person",              "@type": "@id" },
    "Organization":        { "@id": "sch:Person",              "@type": "@id" },
    "DataCatalog":         { "@id": "sch:DataCatalog",         "@type": "@id" },
    "DataDownload":        { "@id": "sch:DataDownload",        "@type": "@id" },
    "DataSet":             { "@id": "sch:DataSet",             "@type": "@id" },
    "Code":                { "@id": "sch:Code",                "@type": "@id" },
    "SoftwareApplication": { "@id": "sch:SoftwareApplication", "@type": "@id" }
  }
};

var URL = 'https://registry.standardanalytics.io/contexts/datapackage.jsonld';

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

  if('repository' in dpkg){
    dpkg.repository.forEach(function(c){
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
