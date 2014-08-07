module.exports = TypeInferrer;

function TypeInferrer(graph, prefixList){

  this.graph = graph;
  this.prefixList = prefixList;
  this.propMap = {};
  this.classMap = {};

  this.graph.forEach(function(node) {
    var key;
    var keysplt = node['@id'].split(':');
    if(keysplt.length !== 2 && this.prefixList.indexOf(keysplt[0]) === -1 ){
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
          if(xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])){
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
          if(xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])){
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
          if(xsplt.length === 2 && ~this.prefixList.indexOf(keysplt[0])){
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

  //add parents to this.class Mao
  Object.keys(this.classMap).forEach(function(key){
    var parents = this._getParentClasses(key);
    if (parents) {
      this.classMap[key].parents = parents;
    }
  }, this);

};

TypeInferrer.prototype._getParentClasses = function(className){

  var parents;
  if(this.classMap[className] && this.classMap[className].subClasses){
    parents = this.classMap[className].subClasses.slice();
    this.classMap[className].subClasses.forEach(function(c){
      var gparents = this._getParentClasses(c);
      if (gparents) {
        gparents.forEach(function(p){
          if(!~parents.indexOf(p)){
            parents.push(p);
          }
        }, this);
      }
    }, this);
  }

  return parents;

};

TypeInferrer.prototype.getRanges = function(prop){
  return this.propMap[prop] && this.propMap[prop].ranges;
};

/**
 * we don't inferr if ranges is not present
 * TODO relax ?
 */
TypeInferrer.prototype.type = function(obj, ranges){

  if(!ranges) return;

  var domains = [];
  for (var key in obj) {
    if (this.propMap[key] && this.propMap[key].domains) {
      this.propMap[key].domains.forEach(function(d){
        if (domains.indexOf(d) === -1) {
          domains.push(d);
        }
      });
    }
  }

  var canditates = [];
  //filter domains to keep only the one more specific or equal to the ranges
  domains.forEach(function(d){
    for (var i=0; i<ranges.length; i++) {
      var r = ranges[i];
      if (this._isMoreSpecific(d, r)) {
        canditates.push(d);
      }
    }
  }, this);

  ranges.forEach(function(r){
    if(! ~canditates.indexOf(r)){
      canditates.push(r);
    }
  });

  if(!canditates.length){
    return;
  }

  if(canditates.length === 1){
    return canditates[0];
  }

  //at least 2 canditates...
  //for each canditates, compute number of matches with the props of obj, if clear winner -> return it, if  equality, return undefined
  var scores = {};
  canditates.forEach(function(canditate){
    scores[canditate] = 0;
    for (var p in obj){
      if ( this.propMap[p] &&
           this.propMap[p].domains &&
           this.classMap[canditate] &&
           this.classMap[canditate].parents &&
           _intersect(this.propMap[p].domains, this.classMap[canditate].parents.concat(canditate))
         ) {
        scores[canditate]++;
      }
    }
  }, this);

  var sortedScores = Object.keys(scores)
    .map(function(x){
      return {type: x, score: scores[x]};
    }).sort(function(a, b){
      return b.score - a.score;
    });

  if(sortedScores[0].score === sortedScores[1].score){ //can't identify unambiguously'
    return;
  }

  return sortedScores[0].type;
};

TypeInferrer.prototype._isMoreSpecific = function(typea, typeb){
  if (!(this.classMap[typea] && this.classMap[typea].parents)) return false;

  return !! ~this.classMap[typea].parents.indexOf(typeb);
};

function _intersect(arrA, arrB){
  for(var i=0; i<arrA.length; i++){
    for(var j=0; j<arrB.length; j++){
      if(arrA[i] === arrB[j]){
        return true;
      }
    }
  }
  return false;
};


//var graph = JSON.parse(require('fs').readFileSync('../data/schema_org.jsonld'))['@graph'];
//
//var typeInferrer = new TypeInferrer(graph, ['schema']);
//
//var obj = {
//  "name": "enc",
//  "videoQuality": "bad",
//  "transcript": "no string"
//};
//
//console.log(typeInferrer.type(obj, typeInferrer.getRanges('encoding')));
