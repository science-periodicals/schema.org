module.exports = function(){

  return {
    "@context": {
      "saterms": "https://standardanalytics.io/ns/",
      "schema": "http://schema.org/",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "oa": "http://www.w3.org/ns/oa#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "vs": "http://www.w3.org/2003/06/sw-vocab-status/ns#",
      "dc": "http://purl.org/dc/terms/",
      "dctypes": "http://purl.org/dc/dcmitype/",
      "foaf": "http://xmlns.com/foaf/0.1/",
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
      "source": {
        "@id": "dc:source",
        "@type": "@id"
      },
      "status": "vs:term_status",
    },

    "@id": "https://standardanalytics.io/ns",
    "defines": [

      //schema:SoftwareApplication extension proposal
      {
        "@id": "saterms:input",
        "@type": "rdf:Property",
        "label": "input",
        "comment":"List of absolute or relative URLs of data resources used in a given analysis.",
        "range": "xsd:string",
        "domain": "schema:SoftwareApplication",
        "status": "testing",
        "seeAlso": "http://schema.org/SoftwareApplication"
      },
      {
        "@id": "saterms:filePath",
        "@type": "rdf:Property",
        "comment":"Unix-style ('/') path to a runnable file (typically a script) or binary. The path must be relative to the directory in which the Package containing this resource resides.",
        "label": "file path",
        "range": "xsd:string",
        "domain": "schema:SoftwareApplication",
        "status": "testing",
        "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
      },

      //schema:DataDownload extension proposal
      {
        "@id": "saterms:contentData",
        "@type": "rdf:Property",
        "comment":"Inline data content of a package dataset.",
        "label": "content data",
        "range": "xsd:string",
        "domain": "schema:DataDownload",
        "status": "testing",
        "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
      },

      {
        "@id": "saterms:contentPath",
        "@type": "rdf:Property",
        "comment":"Unix-style ('/') path to the data content of a package dataset. The path must be relative to the directory in which the Package containing this resource resides.",
        "label": "content path",
        "range": "xsd:string",
        "domain": "schema:MediaObject",
        "status": "testing",
        "seeAlso": "http://dataprotocols.org/data-packages/#resource-information"
      },

      //schema:StructuredValue extension proposal
      {
        "@id": "saterms:valueType",
        "@type": "rdf:Property",
        "label": "value type",
        "comment":"The type (typicaly xsd) of a value",
        "range": "xsd:string",
        "domain": "schema:StructuredValue",
        "status": "testing",
        "seeAlso": "http://www.w3.org/2001/XMLSchema"
      },

      //schema:CreativeWork extension proposal: adding Readme
      {
        "@id": "saterms:Readme",
        "@type": "rdfs:Class",
        "label": "Readme",
        "comment": "A README.",
        "subClassOf": [
          "schema:CreativeWork"
        ],
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/README",
      },

      //schema:CreativeWork extension proposal: adding Abstract
      {
        "@id": "saterms:Abstract",
        "@type": "rdfs:Class",
        "label": "Abstract",
        "comment": "A summary of the resource.",
        "subClassOf": [
          "schema:CreativeWork"
        ],
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Abstract_(summary)",
      },

      {
        "@id": "saterms:abstract",
        "@type": "rdf:Property",
        "label": "abstract",
        "comment":"A brief summary of an article",
        "range": "saterms:Abstract",
        "domain": "schema:Article",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Abstract_(summary)"
      },
      {
        "@id": "saterms:abstractBody",
        "@type": "rdf:Property",
        "label": "abstract body",
        "comment":"The actual body of the abstract",
        "range": "xsd:string",
        "domain": "saterms:Abstract",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Abstract_(summary)"
      },

      //waiting for http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works proposal to be accespted
      {
        "@id": "saterms:PublicationVolume",
        "@type": "rdf:Property",
        "label": "Publication Volume",
        "comment":"A part of a successively published publication such as a periodical or multi-volume work, often numbered. It may represent a time span, such as a year.",
        "range": "schema:CreativeWork",
        "domain": "schema:CreativeWork",
        "status": "testing",
        "seeAlso": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works"
      }

    ],

    "@type": "owl:Ontology",
    "comment": "A lightweight vocabulary for terms of the linked data package spec",
    "label": "The linked data package Vocabulary"
  };

};
