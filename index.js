//NOTE: this module has to be written so that it can be used from within CouchDb => keep deps minimal

var fs = require('fs')
  , path = require('path')
  , url = require('url')
  , semver = require('semver')
  , isUrl = require('is-url')
  , schemaOrg = JSON.parse(fs.readFileSync(path.join(path.dirname(__filename), 'data', 'schema_org.jsonld')))
  , saTerms = require('./lib/terms')
  , saContext = require('./lib/context');

module.exports = Packager;

Packager.context = saContext;
Packager.terms = saTerms;
Packager.contextUrl = 'https://registry.standardanalytics.io/context.jsonld';
Packager.contextLink = '<https://registry.standardanalytics.io/context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"';

function Packager(graph, prefixList) {

  var _saCtx = saContext()['@context'][1];

  this.validIdPrefix = Object.keys(_saCtx).filter(function(key){
    return key.charAt(0) !== '@' &&
      typeof _saCtx[key] === 'string' &&
      isUrl(_saCtx[key]);
  });

  //defined as @reverse in context, but we put them here to help with type inference...
  var saTermsFaked = [
    {
      "@id": "saterms:hasPart",
      "@type": "rdf:Property",
      "range": "schema:CreativeWork",
      "domain": "schema:CreativeWork"
    },
    {
      "@id": "saterms:sourceCode",
      "@type": "rdf:Property",
      "range": "schema:Code",
      "domain": "schema:SoftwareApplication"
    }
  ];

  this.graph = schemaOrg['@graph'].concat(saTerms().defines, saTermsFaked);
  this.prefixList = ['schema', 'saterms'];
  this.propMap = {};
  this.classMap = {};

  //init this.propMap and this.classMap
  this.graph.forEach(function(node) {
    var key;
    var keysplt = node['@id'].split(':');
    if (keysplt.length !== 2 && this.prefixList.indexOf(keysplt[0]) === -1 ) {
      return;
    } else {
      key = keysplt[1];
    }

    if (node['@type'] === 'rdf:Property') {

      var domains;
      if (node['domainIncludes'] || node['domain']) {
        var nodeDomain = node['domainIncludes'] || node['domain'];
        domains = Array.isArray(nodeDomain)? nodeDomain : [ nodeDomain ];
        domains = domains.map(function(x) {
          var xsplt = x.split(':');
          if (xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])) {
            return xsplt[1];
          } else {
            return x;
          }
        }, this);
      }

      var ranges;
      if (node['rangeIncludes'] || node['range']) {
        var nodeRange = node['rangeIncludes'] || node['range'];
        ranges = Array.isArray(nodeRange)? nodeRange : [ nodeRange ];
        ranges = ranges.map(function(x) {
          var xsplt = x.split(':');
          if (xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])) {
            return xsplt[1];
          } else {
            return x;
          }
        }, this);
      }

      if ( (domains && domains.length) || (ranges && ranges.length) ) {
        this.propMap[key] = {};
        if (domains && domains.length) { this.propMap[key].domains = domains };
        if (domains && domains.length) { this.propMap[key].ranges = ranges };
      }

    } else if (node['@type'] === 'rdfs:Class') {

      if (node['subClassOf']) {
        var subClasses = Array.isArray(node['subClassOf'])? node['subClassOf']: [node['subClassOf']];
        subClasses = subClasses.map(function(x) {
          var xsplt = x.split(':');
          if (xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])) {
            return xsplt[1];
          } else {
            return x;
          }
        }, this);

        if (subClasses && subClasses.length) {
          this.classMap[key] = { subClasses: subClasses };
        }
      }

    }

  }, this);

  //add subClassesChain to this.classMap
  Object.keys(this.classMap).forEach(function(key) {
    var subClassesChain = this._getParentClasses(key);
    if (subClassesChain) {
      this.classMap[key].subClassesChain = subClassesChain;
    }
  }, this);

};

Packager.prototype._getParentClasses = function(className) {

  var subClassesChain;
  if (this.classMap[className] && this.classMap[className].subClasses) {
    subClassesChain = this.classMap[className].subClasses.slice();
    this.classMap[className].subClasses.forEach(function(c) {
      var gsubClassesChain = this._getParentClasses(c);
      if (gsubClassesChain) {
        gsubClassesChain.forEach(function(p) {
          if (!~subClassesChain.indexOf(p)) {
            subClassesChain.push(p);
          }
        }, this);
      }
    }, this);
  }

  return subClassesChain;

};

Packager.prototype.getRanges = function(prop) {
  return this.propMap[prop] && this.propMap[prop].ranges.slice();
};

/**
 * return the ranges of prop combined with the subClassesChain of all
 * the ranges of ```prop``, itself combined with ```type``` and the
 * subClassesChain of ```type```.
 */
Packager.prototype.getClassesChain = function(prop, type) {
  var ranges = this.getRanges(prop) || [];
  var classesChain = ranges.slice();

  if (type) {
    ranges.push(type);
    if (!~classesChain.indexOf(type)) {
      classesChain.push(type);
    }
  }

  ranges.forEach(function(range){
    var subClassesChain = (this.classMap[range] && this.classMap[range].subClassesChain) || [];
    subClassesChain.forEach(function(className){
      if (!~classesChain.indexOf(className)) {
        classesChain.push(className);
      }
    }, this);
  }, this);

  return classesChain;
};



/**
 * we don't inferr if ranges is not present
 * TODO relax ?
 */
Packager.prototype._type = function(obj, ranges) {

  if (!ranges) return;

  var domains = [];
  for (var key in obj) {
    if (this.propMap[key] && this.propMap[key].domains) {
      this.propMap[key].domains.forEach(function(d) {
        if (domains.indexOf(d) === -1) {
          domains.push(d);
        }
      });
    }
  }

  var canditates = [];
  //filter domains to keep only the one more specific or equal to the ranges
  domains.forEach(function(d) {
    for (var i=0; i<ranges.length; i++) {
      var r = ranges[i];
      if (this._isMoreSpecific(d, r)) {
        canditates.push(d);
      }
    }
  }, this);

  ranges.forEach(function(r) {
    if (! ~canditates.indexOf(r)) {
      canditates.push(r);
    }
  });

  if (!canditates.length) {
    return;
  }

  if (canditates.length === 1) {
    return canditates[0];
  }

  //at least 2 canditates...
  //for each canditates, compute number of matches with the props of obj, if clear winner -> return it, if  equality, return undefined
  var scores = {};
  canditates.forEach(function(canditate) {
    scores[canditate] = 0;
    for (var p in obj) {
      if ( this.propMap[p] &&
           this.propMap[p].domains &&
           this.classMap[canditate] &&
           this.classMap[canditate].subClassesChain &&
           _intersect(this.propMap[p].domains, this.classMap[canditate].subClassesChain.concat(canditate))
         ) {
        scores[canditate]++;
      }
    }
  }, this);

  var sortedScores = Object.keys(scores)
    .map(function(x) {
      return {type: x, score: scores[x]};
    }).sort(function(a, b) {
      return b.score - a.score;
    });

  if (sortedScores[0].score === sortedScores[1].score) { //can't identify unambiguously'
    return;
  }

  return sortedScores[0].type;
};


Packager.prototype.type = function(cdoc, ranges) {

  var type = this._type(cdoc, ranges);
  if(!cdoc['@type'] && type){
    cdoc['@type'] = type;
  }

  _forEachNode(cdoc, function(prop, node){
    var type = this._type(node, this.getRanges(prop));
    if(!node['@type'] && type){
      node['@type'] = type;
    }
  }, this);

  return cdoc;
};


Packager.prototype._isMoreSpecific = function(typea, typeb) {
  if (!(this.classMap[typea] && this.classMap[typea].subClassesChain)) return false;

  return !! ~this.classMap[typea].subClassesChain.indexOf(typeb);
};


Packager.prototype.validateId = function validateId(id, opts) {
  opts = opts || {};

  if (!id) throw new Error('invalid @id'); // '' cannot be a valid @id for SA.

  var splt = id.split(':');

  var saPathname;
  if (isUrl(id)) {
    var purl = url.parse(id);
    if (purl.hostname !== 'registry.standardanalytics.io') {
      return;
    }

    saPathname = purl.pathname;
  } else if (splt.length === 2 && ~this.validIdPrefix.indexOf(splt[0])) { //invalid blank nodes and make sure the doc was compacted with SA @context

    if(splt[0] === 'sa'){
      saPathname = splt[1];
    }

  } else {
    throw new Error('invalid @id');
  }

  if (saPathname) { //SA specific rules

    var parts = saPathname.replace(/^\//, '').replace(/\/$/, '').split('/');

    if (!parts.length) {

      throw new Error('invalid @id');

    } else {

      if(opts.isNameSpace && (parts.length !== 1) ){
        throw new Error('invalid @id for a namespace');
      }

      for (var i=0; i<parts.length; i++) {
        var part = parts[i];

        if ( !part ||
             part.trim().toLowerCase() !== part ||
             !part.match(/^[a-zA-Z0-9]/) ||
             part.match(/[\/\(\)&\?#\|<>@:%\s\\\*'"!~`]/) ||
             part !== encodeURIComponent(part)
           ) {

          throw new Error('invalid @id');
        }

        if (i === 0 && ['auth', 'rmuser', 'adduser', 'owner', 'maintainer', 'search', 'context.jsonld', 'ld_packages', 'favicon.ico', 'r'].indexOf(part) !== -1) {
          throw new Error('invalid @id: invalid namespace');
        }
      }

    }

    return 'sa:' + parts.join('/'); //always return a CURIE (simplifies this.setIds)

  }

  return id;

};

/**
 * !! cdoc is a compacted doc, compacted with SA @context.
 * return a hash of @id (useful for automatic unique @id generation)
 */
Packager.prototype.validate = function(cdoc){
  var ids = {};

  if (cdoc['@context'] !== Packager.contextUrl) {
    throw new Error('document must have a @context set to ' + Packager.contextUrl);
  }

  if (!semver.valid(cdoc.version)) {
    throw new Error('document must have a version property following Semantic Visioning (see http://semver.org)');
  }

  if (! ('@id' in cdoc)) {
    throw new Error('document must have an @id');
  } else {
    ids[cdoc['@id']] = this.validateId(cdoc['@id'], {isNameSpace: true});
  }

  //validate (and collect) all the @id.
  _forEachNode(cdoc, function(key, node){
    if ('@id' in node) {
      ids[node['@id']] = this.validateId(node['@id']);
    }
  }, this);

  return ids;
};


/**
 * set a unique @id (if not present already) to all the object whose
 * properties are different from filterOutProps and have range
 * encompassing filterClasses.  Mimate
 * http://www.w3.org/TR/json-ld-api/#generate-blank-node-identifier
 */

Packager.prototype.setIds = function(cdoc, opts, env) {
  opts = opts || {};
  env = env || {};

  if (!opts.nameSpace) { opts.nameSpace = (isUrl(cdoc['@id'])) ? url.parse(cdoc['@id']).pathname.replace(/^\//, '').replace(/\/$/, '') : cdoc['@id'].split(':')[1].replace(/\/$/, ''); }
  if (!opts.ignoredProps) { opts.ignoredProps = []; }
  if (!opts.restrictToClasses) { opts.restrictToClasses = [ 'Thing' ]; }
  if (!opts.preExistingIds) { opts.preExistingIds = this.validate(cdoc); }

  if (!env.counter) { env.counter = 0; }
  if (!env.classesChain) { env.classesChain = []; }

  //set @id and increment counter if not blankId
  if (!('@id' in cdoc) && _intersect(env.classesChain, opts.restrictToClasses)) {
    var id = 'sa:' + opts.nameSpace + '/n' + env.counter++;
    while(id in opts.preExistingIds){
      id = 'sa:' + opts.nameSpace + '/n' + env.counter++;
    }
    cdoc['@id'] = id;
  }

  //traverse
  _forEachNode(cdoc, function(prop, node){
    if(~opts.ignoredProps.indexOf(prop)) return;
    env.classesChain = this.getClassesChain(prop, node['@type']);
    this.setIds(node, opts, env);
  }, this);

  return cdoc;
};


function _intersect(arrA, arrB) {
  for (var i=0; i<arrA.length; i++) {
    for (var j=0; j<arrB.length; j++) {
      if (arrA[i] === arrB[j]) {
        return true;
      }
    }
  }
  return false;
};

function _forEachNode(doc, callback, _this){
  for (var prop in doc) {
    if (prop === '@context' || !doc.hasOwnProperty(prop)) continue;

    if (Array.isArray(doc[prop])) {
      for (var i=0; i<doc[prop].length; i++) {
        if (typeof doc[prop][i] === 'object') {
          callback.call(_this || this, prop, doc[prop][i]);
        }
      }
    } else if (typeof doc[prop] === 'object') {
      callback.call(_this || this, prop, doc[prop]);
    }
  }
};
