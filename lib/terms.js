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
      "equivalentClass": { "@id": "owl:equivalentClass", "@type": "@id" },
      "equivalentProperty": { "@id": "owl:equivalentProperty", "@type": "@id" },
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
        "comment":"The actual value of the hash in base64 if no datatype are present.",
        "label": "hash value",
        "range": "xsd:string",
        "domain": "saterms:FileHash",
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Checksum",
        "sameAs": "http://www.semanticdesktop.org/ontologies/nfo/#hashValue"
      },


      //schema:MediaObject / SoftwareApplication extension proposal
      {
        "@id": "saterms:filePath",
        "@type": "rdf:Property",
        "comment":"Unix-style ('/') relative path to a file in a filesystem.",
        "label": "file path",
        "range": "xsd:string",
        "domain": ["schema:MediaObject", "schema:SoftwareApplication"],
        "status": "testing",
        "seeAlso": "http://en.wikipedia.org/wiki/Path_(computing)",
        "source": "https://github.com/standard-analytics/ldpm/issues/18"
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
        "sameAs": "http://salt.semanticauthoring.org/ontologies/sro#Abstract",
        "source": "https://github.com/standard-analytics/package-jsonld/issues/15"
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
