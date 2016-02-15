import fs from 'fs';
import path from 'path';
import url from 'url';
import isUrl from 'is-url';
import schemaOrg  from '../data/schema_org';

const reProperty = /^rdf:Property$|^http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#Property$/;
const reClass = /^rdfs:Class$|^http:\/\/www.w3.org\/2000\/01\/rdf-schema#Class$/;

export default class SchemaOrg {

  constructor(data = []) {
    this.graph = schemaOrg['@graph'].concat(data.map(d => d['@graph'])).filter(node => !isUrl(node['@id']));
    this.prefixes = new Set(this.graph.map(node => node['@id'].split(':')[0]));
    this.nodeMap = this.graph.reduce((nodeMap, node) => {
      nodeMap[node['@id'].split(':')[1]] = node;
      return nodeMap;
    }, {});


    // memoize
    this._cache = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).reduce((cache, key) => {
      cache[key] = {};
      return cache;
    }, {});

    // TODO generalize
    this.is = function() {
      if (arguments[0] in this._cache.is && arguments[1] in this._cache.is[arguments[0]]) {
        return this._cache.is[arguments[0]][arguments[1]];
      }
      const value = SchemaOrg.prototype.is.apply(this, arguments);
      if (! (arguments[0] in this._cache.is)) {
        this._cache.is[arguments[0]] = {};
      }
      this._cache.is[arguments[0]][[arguments[1]]] = value;
      return value;
    }.bind(this);

  }

  getParents(className) {
    let subClassOfChain;
    if (this.nodeMap[className] && this.nodeMap[className].subClassOf) {
      let unprefixed = this.unprefix(this.nodeMap[className].subClassOf);
      subClassOfChain = new Set(unprefixed);
      for (let c of unprefixed) {
        let gsubClassOfChain = this.getParents(c);
        if (gsubClassOfChain) {
          for (let p of gsubClassOfChain.keys()) {
            if (!subClassOfChain.has(p)) {
              subClassOfChain.add(p);
            }
          };
        }
      }
    }
    return subClassOfChain;
  }

  get(term) {
    return this.nodeMap[term];
  }

  is(type, className) {
    var typeList = arrayify(type);

    for (var type of typeList) {
      if (type === className || this.getParents(type).has(className)) {
        return true;
      }
    }

    return false;
  }

  unprefix(terms) {
    return arrayify(terms).filter(term => {
      let splt = term.split(':');
      return splt.length === 2 && this.prefixes.has(splt[0])
    }).map(term => term.split(':')[1]);
  }

  getSubClasses(className, recursive = true) {
    var subClasses = new Set();
    for (let key in this.nodeMap) {
      if (reClass.test(this.nodeMap[key]['@type'])) {
        if (recursive) {
          let parents = this.getParents(key);
          if (parents && parents.size && parents.has(className) && !subClasses.has(key)) {
            subClasses.add(key);
          }
        } else {
          if (this.nodeMap[key].subClassOf && ~this.unprefix(this.nodeMap[key].subClassOf).indexOf(className)) {
            subClasses.add(key);
          }
        }
      }
    }
    return subClasses;
  }

  isMoreSpecific(typea, typeb) {
    let parents = this.getParents(typea);

    if (!(parents && parents.size)) return false;
    return parents.has(typeb);
  }

  getType(obj, moreSpecificOrEqualThan = []) {
    if (obj['@type']) return obj['@type'];

    moreSpecificOrEqualThan = arrayify(moreSpecificOrEqualThan);

    var candidates = new Set();
    Object.keys(obj).forEach(key => {
      if (this.nodeMap[key] && this.nodeMap[key].domain) {
        for (let d of this.unprefix(this.nodeMap[key].domain)) {
          if (!candidates.has(d) && moreSpecificOrEqualThan.every(t => this.isMoreSpecific(d, t))) {
            candidates.add(d);
          }
        }
      }
    });

    moreSpecificOrEqualThan.forEach(t => {
      if (! candidates.has(t)) {
        candidates.add(t);
      }
    });

    if (!candidates.size) {
      return;
    }

    if (candidates.size === 1) {
      return Array.from(candidates)[0];
    }

    //at least 2 candidates...
    //for each candidate, compute number of matches with the props of obj, if clear winner -> return it, if  equality, return undefined

    var scores = {};
    for (let c of candidates.keys()) {
      let parents = this.getParents(c);
      scores[c] = 0;
      Object.keys(obj).forEach(p => {

        if (
          this.nodeMap[p] &&
          this.nodeMap[p].domain &&
          parents &&
          parents.size &&
          this.unprefix(this.nodeMap[p].domain).some(d => d === c || parents.has(d))
        ) {
          scores[c]++;
        }
      });
    }

    var sortedScores = Object.keys(scores)
                             .map(x => {
                               return {type: x, score: scores[x]};
                             }).sort((a, b) => {
                               return b.score - a.score;
                             });

    if (sortedScores[0].score === sortedScores[1].score) {
      return; //cannot identify unambiguously
    }

    return sortedScores[0].type;
  }

}


function arrayify(x) {
  return Array.isArray(x) ? x : [x];
}
