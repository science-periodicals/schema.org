//NOTE: this module has to be written so that it can be used from within CouchDb => keep deps minimal

exports.CONTEXT_URL = 'https://registry.standardanalytics.io/context.jsonld'
exports.CONTEXT_LINK = '<' + exports.CONTEXT_URL + '>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';
exports.context = require('./lib/context');
exports.terms = require('./lib/terms');
exports.TypeInferrer = require('./lib/typeinferrer');
