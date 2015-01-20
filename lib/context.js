var fs = require('fs')
  , path = require('path')
  , schemaOrgContext = JSON.parse(fs.readFileSync(path.join(path.dirname(path.dirname(__filename)), 'data', 'schema_org_context.jsonld')));


module.exports = function(proxyUrl){
  proxyUrl = (proxyUrl && proxyUrl.replace(/\/$/, '')) || 'https://dcat.io';

  return {
    "@context": [
      schemaOrgContext['@context'],
      {
        //base
        "@base": proxyUrl + '/',

        //prefix
        "ldr": proxyUrl + '/',
        "sa": 'https://standardanalytics.io/',
        "ldrterms": "https://dcat.io/ns/",
        "schema": "http://schema.org/",
        "nfo":  "http://www.semanticdesktop.org/ontologies/nfo/#",
        "dc":   "http://purl.org/dc/terms/",
        "dctypes": "http://purl.org/dc/dcmitype/",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "bibo": "http://purl.org/ontology/bibo/",
        "cnt": "http://www.w3.org/2011/content#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "hydra": "http://www.w3.org/ns/hydra/core#",
        "oa": "http://www.w3.org/ns/oa#",
        "github": "https://github.com/",

        //hydra
        "Error": { "@id": "hydra:Error", "@type": "@id" },

        //additional terms
        "valueType":  { "@id": "ldrterms:valueType", "@type": "@id" },
        "filePath":    "ldrterms:filePath",

        "doi": "bibo:doi",
        "pmid": "bibo:pmid",

        "Abstract": { "@id": "ldrterms:Abstract", "@type": "@id" },
        "abstract": "ldrterms:abstract",
        "abstractBody": "ldrterms:abstractBody",

        "hashAlgorithm": "nfo:hashAlgorithm",
        "hashValue": "nfo:hashValue",

        "Readme":   { "@id": "ldrterms:Readme", "@type": "@id" },

        //convenience
        "sourceCode": { "@reverse": "schema:targetProduct", "@type": "@id" },

        //synonyms
        "associatedMedia": "schema:encoding",

        //force list or set
        "hasPart": { "@reverse": "schema:isPartOf", "@container": "@set", "@type": "@id" }, //Also, cf http://www.w3.org/wiki/WebSchemas/Collection

        "encoding":           { "@id": "schema:encoding",           "@container": "@list", "@type": "@id" },
        "distribution":       { "@id": "schema:distribution",       "@container": "@list", "@type": "@id" },
        "targetProduct":      { "@id": "schema:targetProduct",      "@container": "@list", "@type": "@id" },

        "thumbnail":          { "@id": "schema:thumbnail",          "@container": "@list", "@type": "@id" },
        "dataset":            { "@id": "schema:dataset",            "@container": "@list", "@type": "@id" },
        "image":              { "@id": "schema:image",              "@container": "@list", "@type": "@id" },
        "audio":              { "@id": "schema:audio",              "@container": "@list", "@type": "@id" },
        "video":              { "@id": "schema:video",              "@container": "@list", "@type": "@id" },
        "keywords":           { "@id": "schema:keywords",           "@container": "@list" },
        "about":              { "@id": "schema:about",              "@container": "@list", "@type": "@id" },
        "requirements":       { "@id": "schema:requirements",       "@container": "@list", "@type": "@id" },
        "isBasedOnUrl":       { "@id": "schema:isBasedOnUrl",       "@container": "@list", "@type": "@id" },
        "citation":           { "@id": "schema:citation",           "@container": "@list", "@type": "@id" },

        "author":             { "@id": "schema:author",             "@container": "@list", "@type": "@id" },
        "contributor":        { "@id": "schema:contributor",        "@container": "@list", "@type": "@id" },
        "editor":             { "@id": "schema:editor",             "@container": "@list", "@type": "@id" },
        "accountablePerson":  { "@id": "schema:accountablePerson",  "@container": "@list", "@type": "@id" },
        "sourceOrganization": { "@id": "schema:sourceOrganization", "@container": "@list", "@type": "@id" }
      }
    ]
  };

};
