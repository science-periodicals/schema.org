/**
 * convert schema.org raw RDFa data into compacted JSON-LD
 */

var fs = require('fs');
var path = require('path');
var jsonldRdfaParser = require('jsonld-rdfa-parser');
var jsonld = require('jsonld');
var request = require('request');

// register the parser for content type text/html
jsonld.registerRDFParser('text/html', jsonldRdfaParser);

var context = {
  '@context': {
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    owl: 'http://www.w3.org/2002/07/owl#',
    vs: 'http://www.w3.org/2003/06/sw-vocab-status/ns#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    bibo: 'http://purl.org/ontology/bibo/',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    dc: 'http://purl.org/dc/terms/',
    schema: 'http://schema.org/',
    oa: 'http://www.w3.org/ns/oa#',

    sameAs: {
      '@id': 'owl:sameAs',
      '@type': '@id'
    },
    seeAlso: {
      '@id': 'rdfs:seeAlso',
      '@type': '@id'
    },
    equivalentClass: {
      '@id': 'owl:equivalentClass',
      '@type': '@id'
    },
    equivalentProperty: {
      '@id': 'owl:equivalentProperty',
      '@type': '@id'
    },

    // remap custom schema.org terms to RDFS
    domain: {
      '@id': 'schema:domainIncludes',
      '@type': '@id',
      '@container': '@set'
    },
    range: {
      '@id': 'schema:rangeIncludes',
      '@type': '@id',
      '@container': '@set'
    },

    subClassOf: {
      '@id': 'rdfs:subClassOf',
      '@type': '@id',
      '@container': '@set'
    },
    disjointWith: {
      '@id': 'owl:disjointWith',
      '@type': '@id',
      '@container': '@set'
    },
    unionOf: {
      '@id': 'owl:unionOf',
      '@type': '@id',
      '@container': '@set'
    },
    comment: 'rdfs:comment',
    label: 'rdfs:label',
    altLabel: 'skos:altLabel',
    status: 'vs:term_status',
    subPropertyOf: {
      '@id': 'rdfs:subPropertyOf',
      '@type': '@id'
    },
    source: {
      '@id': 'dc:source',
      '@type': '@id'
    },
    defines: { '@reverse': 'rdfs:isDefinedBy' }
  }
};

jsonld.fromRDF(
  'http://schema.org/docs/schema_org_rdfa.html',
  { format: 'text/html' },
  function(err, data) {
    if (err) throw err;
    jsonld.compact(data, context, function(err, data) {
      if (err) throw err;
      fs.writeFile(
        path.resolve(path.dirname(__dirname), 'src', 'schema_org.json'),
        JSON.stringify(data, null, 2),
        function(err) {
          if (err) throw err;

          // grab schema.org context
          request.get(
            {
              url: 'http://schema.org',
              headers: { Accept: 'application/ld+json' }
            },
            (err, resp, context) => {
              if (err) throw err;
              if (resp.statusCode >= 400) {
                throw new Error(resp.statusCode);
              }

              fs.writeFile(
                path.resolve(
                  path.dirname(__dirname),
                  'src',
                  'schema_org_context.json'
                ),
                JSON.stringify(JSON.parse(context), null, 2),
                function(err) {
                  if (err) throw err;
                }
              );
            }
          );
        }
      );
    });
  }
);
