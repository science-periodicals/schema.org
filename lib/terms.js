module.exports = function(){

  return {
    "@context": {
      "saterms": "https://standardanalytics.io/ns/",
      "schema": "http://schema.org/",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "vs": "http://www.w3.org/2003/06/sw-vocab-status/ns#",
      "dc": "http://purl.org/dc/terms/",
      "dctypes": "http://purl.org/dc/dcmitype/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "owl": "http://www.w3.org/2002/07/owl#",

      "defines": { "@reverse": "rdfs:isDefinedBy" },

      "comment": "rdfs:comment",
      "label": "rdfs:label",
      "domain": { "@id": "rdfs:domain", "@type": "@id" },
      "range": { "@id": "rdfs:range", "@type": "@id" },
      "subClassOf": { "@id": "rdfs:subClassOf", "@type": "@id", "@container": "@set" },
      "subPropertyOf": { "@id": "rdfs:subPropertyOf", "@type": "@id", "@container": "@set" },
      "seeAlso": { "@id": "rdfs:seeAlso", "@type": "@id" },
      "source": { "@id": "dc:source", "@type": "@id" },
      "sameAs": { "@id": "owl:sameAs", "@type": "@id" },
      "inverseOf": { "@id": "owl:inverseOf", "@type": "@id" },
      "status": "vs:term_status"
    },

    "@id": "https://standardanalytics.io/ns",

    "defines": [
      //schema:CreativeWork extension proposal (will be better in MediaObject _but_ this is useful too for SoftwareApplication)
      {
        "@id": "saterms:Checksum",
        "@type": "rdfs:Class",
        "subClassOf": "schema:Intangible",
        "label": "checksum",
        "comment": "A small-size datum from an arbitrary block of digital data for the purpose of detecting errors which may have been introduced during its transmission or storage.",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Checksum",
        "sameAs": "http://www.semanticdesktop.org/ontologies/nfo/#FileHash"
      },
      {
        "@id": "saterms:hasChecksum",
        "@type": "rdf:Property",
        "comment":"The checksum of the resource.",
        "label": "checksum",
        "range": "saterms:Checksum",
        "domain": "schema:CreativeWork",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Checksum",
        "sameAs": "http://www.semanticdesktop.org/ontologies/nfo/#hasHash"
      },
      {
        "@id": "saterms:checksumAlgorithm",
        "@type": "rdf:Property",
        "comment":"Name of the algorithm used to compute the checksum value. Examples might include MD5, SHA-1 etc.",
        "label": "checksum algorithm",
        "range": "xsd:string",
        "domain": "saterms:Checksum",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Checksum",
        "sameAs": "http://www.semanticdesktop.org/ontologies/nfo/#hashAlgorithm"
      },
      {
        "@id": "saterms:checksumValue",
        "@type": "rdf:Property",
        "comment":"The actual value of the hash.",
        "label": "hash value",
        "range": "xsd:string",
        "domain": "saterms:FileHash",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Checksum",
        "sameAs": "http://www.semanticdesktop.org/ontologies/nfo/#hashValue"
      },


      //schema:SoftwareApplication extension proposal
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
        "subClassOf": "schema:CreativeWork",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/README"
      },

      //schema:CreativeWork extension proposal: adding Abstract
      {
        "@id": "saterms:Abstract",
        "@type": "rdfs:Class",
        "label": "Abstract",
        "comment": "A summary of a resource.",
        "subClassOf": "schema:CreativeWork",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Abstract_(summary)",
        "sameAs": "http://salt.semanticauthoring.org/ontologies/sro#Abstract"
      },
      {
        "@id": "saterms:abstract",
        "@type": "rdf:Property",
        "label": "abstract",
        "comment":"A summary of the resource",
        "range": "saterms:Abstract",
        "domain": "schema:Article",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Abstract_(summary)",
        "sameAs": "http://purl.org/ontology/bibo/abstract"
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

      //waiting for http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works proposal to be accespted, all the rest can be defined at the @context level with bibo mapping
      {
        "@id": "saterms:Periodical",
        "@type": "rdfs:Class",
        "label": "Periodical",
        "comment": "A publication in any medium issued in successive parts bearing numerical or chronological designations and intended, such as a magazine, scholarly journal, or newspaper to continue indefinitely.",
        "subClassOf": "schema:CreativeWork",
        "sameAs": "http://purl.org/ontology/bibo/Periodical",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works"
      },
      {
        "@id": "saterms:issn",
        "@type": "rdf:Property",
        "label": "issn",
        "comment": "The International Standard Serial Number (ISSN) that identifies this periodical.",
        "range": "xsd:string",
        "domain": "saterms:Periodical",
        "sameAs": "http://purl.org/ontology/bibo/issn",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works",
      },
      {
        "@id": "saterms: PublicationVolume",
        "@type": "rdfs:Class",
        "label": "publication volume",
        "comment": "A part of a successively published publication such as a periodical or multi-volume work, often numbered. It may represent a time span, such as a year.",
        "subClassOf": "schema:CreativeWork",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works"
      },
      {
        "@id": "saterms: PublicationIssue",
        "@type": "rdfs:Class",
        "label": "publication issue",
        "comment": "A part of a successively published publication such as a periodical or publication volume, often numbered, usually containing a grouping of works such as articles.",
        "subClassOf": "schema:CreativeWork",
        "sameAs": "http://purl.org/ontology/bibo/Issue",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works"
      },
      {
        "@id": "saterms:pageStart",
        "@type": "rdf:Property",
        "label": "page start",
        "comment": "The page on which the work starts; for example \"135\" or \"xiii\".",
        "domain": ["schema:Article", "saterms:Periodical", "saterms:PublicationVolume", "saterms:PublicationIssue"],
        "range": "xsd:string",
        "sameAs": "http://purl.org/ontology/bibo/pageStart",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works",
      },
      {
        "@id": "saterms:pageEnd",
        "@type": "rdf:Property",
        "label": "page end",
        "comment": "The page on which the work ends; for example \"138\" or \"xvi\".",
        "domain": ["schema:Article", "saterms:Periodical", "saterms:PublicationVolume", "saterms:PublicationIssue"],
        "range": "xsd:string",
        "sameAs": "http://purl.org/ontology/bibo/pageEnd",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works",
      },
      {
        "@id": "saterms:pagination",
        "@type": "rdf:Property",
        "label": "pagination",
        "comment": "Any description of pages that is not separated into pageStart & pageEnd; for example, \"1-6, 9, 55\" or \"10-12, 46-49\"",
        "domain": ["schema:Article", "saterms:Periodical", "saterms:PublicationVolume", "saterms:PublicationIssue"],
        "range": "xsd:string",
        "sameAs": "http://purl.org/ontology/bibo/pages",
        "status": "testing",
        "source": "http://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works",
      },

      //define @reverse props
      {
        "@id": "saterms:hasPart",
        "@type": "rdf:Property",
        "label": "has part",
        "comment": "A related CreativeWork that is included either logically or physically in this CreativeWork; for example, things in a collection, parts in a multi-part work, or articles in a periodical or publication issue.",
        "range": "schema:CreativeWork",
        "domain": "schema:CreativeWork",
        "inverseOf": "schema:isPartOf",
        "sameAs": "http://purl.org/dc/terms/hasPart",
        "source": "https://www.w3.org/wiki/WebSchemas/Periodicals,_Articles_and_Multi-volume_Works"
      },
      {
        "@id": "saterms:sourceCode",
        "@type": "rdf:Property",
        "label": "source code",
        "comment": "The computer programming source code of the Software Application",
        "range": "schema:Code",
        "domain": "schema:SoftwareApplication",
        "inverseOf": "schema:targetProduct",
        "seeAlso": "http://en.wikipedia.org/wiki/Source_code"
      }

    ],

    "@type": "owl:Ontology",
    "comment": "A lightweight vocabulary for terms of the linked data package spec",
    "label": "The linked data package Vocabulary"
  };

};
