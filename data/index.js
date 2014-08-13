/**
 * convert schema.org raw RDFa data into compacted JSON-LD
 */

var fs = require('fs')
  , saTerms = require('../lib/terms')
  , request = require('request')
  , jsonld = require('jsonld')();

jsonld.use('request'); //needed to parse RDFa

//get context from SA ontologie
var ctx = saTerms()['@context'];

//patch for schema.org specific conventions
ctx["domainIncludes"] = {
  "@id": "schema:domainIncludes",
  "@type": "@id"
};

ctx["rangeIncludes"] = {
  "@id": "schema:rangeIncludes",
  "@type": "@id"
};

//jsonld.request will convert RDFa into a graph
jsonld.request("http://schema.org/docs/schema_org_rdfa.html", function(err, res, dataRdfa) {
  jsonld.compact(dataRdfa, ctx, function(err, dataJsonld) {
    fs.writeFileSync('schema_org.jsonld', JSON.stringify(dataJsonld, null, 2));
  });
});


//cache schema.org context
request({url:'http://schema.org', headers: {'Accept': 'application/ld+json'}}, function(err, resp, body){
  fs.writeFileSync('schema_org_context.jsonld', body);
});
