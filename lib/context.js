module.exports = function(){
  return  {
    "@context": [
      "http://schema.org",
      {
        //base
        "@base": 'https://registry.standardanalytics.io/',

        //prefix
        "sa": 'https://standardanalytics.io/ns/',
        "schema": "http://schema.org/",
        "nfo":  "http://www.semanticdesktop.org/ontologies/nfo/#",
        "dc":   "http://purl.org/dc/terms/",
        "dctypes": "http://purl.org/dc/dcmitype/",
        "xsd": "http://www.w3.org/2001/XMLSchema#",
        "bibo": "http://purl.org/ontology/bibo/",
        "cnt": "http://www.w3.org/2011/content#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "oa": "http://www.w3.org/ns/oa#",

        //additional terms
        "valueType":  { "@id": "sa:valueType", "@type": "@id" },
        "contentPath": "sa:contentPath",
        "contentData": "sa:contentData",
        "filePath":    "sa:filePath",

        //Cf http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works
        "volumeNumber": "bibo:volume",
        "issueNumber": "bibo:issue",
        "pagination": "bibo:pages",
        "pageStart": "bibo:pageStart",
        "pageEnd": "bibo:pageEnd",
        "issn": "bibo:issn",
        "Periodical": { "@id": "bibo:Periodical", "@type": "@id" },
        "PublicationIssue": { "@id": " bibo:Issue", "@type": "@id" },
        "PublicationVolume": { "@id": "sa:PublicationVolume", "@type": "@id" },

        "doi": "bibo:doi",
        "pmid": "bibo:pmid",

        "Abstract": { "@id": "sa:Abstract", "@type": "@id" },
        "abstract": "sa:abstract",
        "abstractBody": "sa:abstractBody",

        "hashAlgorithm": "nfo:hashAlgorithm",
        "hashValue": "nfo:hashValue",

        "Readme":   { "@id": "sa:Readme", "@type": "@id" },

        //convenience
        "sourceCode": { "@reverse": "schema:targetProduct" },

        //force list or set
        "hasPart": { "@reverse": "schema:isPartOf", "@container": "@set" }, //Also, cf http://www.w3.org/wiki/WebSchemas/Collection
        "input":  { "@id": "sa:input", "@type": "@id", "@container": "@set" },

        "encoding":           { "@id": "schema:encoding",           "@container": "@list" },
        "distribution":       { "@id": "schema:distribution",       "@container": "@list" },
        "targetProduct":      { "@id": "schema:targetProduct",      "@container": "@list" },

        "thumbnail":          { "@id": "schema:thumbnail",          "@container": "@list" },
        "dataset":            { "@id": "schema:dataset",            "@container": "@list" },
        "image":              { "@id": "schema:image",              "@container": "@list" },
        "audio":              { "@id": "schema:audio",              "@container": "@list" },
        "video":              { "@id": "schema:video",              "@container": "@list" },
        "keywords":           { "@id": "schema:keywords",           "@container": "@list" },
        "about":              { "@id": "schema:about",              "@container": "@list" },
        "requirements":       { "@id": "schema:requirements",       "@container": "@list",  "@type": "@id" },
        "isBasedOnUrl":       { "@id": "schema:isBasedOnUrl",       "@container": "@list",  "@type": "@id" },
        "citation":           { "@id": "schema:citation",           "@container": "@list" },

        "contributor":        { "@id": "schema:contributor",        "@container": "@list" },
        "editor":             { "@id": "schema:editor",             "@container": "@list" },
        "accountablePerson":  { "@id": "schema:accountablePerson",  "@container": "@list" },
        "sourceOrganization": { "@id": "schema:sourceOrganization", "@container": "@list" }
      }
    ]
  };
};
