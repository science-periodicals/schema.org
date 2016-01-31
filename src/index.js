import fs from 'fs';
import path from 'path';
import url from 'url';
import isUrl from 'is-url';

var schemaOrg = fs.readFileSync(path.join(path.dirname(__dirname), 'data', 'schema_org.jsonld'));
schemaOrg = JSON.parse(schemaOrg);

export default class SchemaOrg {

  constructor(data, prefixList = ['schema']) {
    this.graph = schemaOrg['@graph'];
    this.prefixes = new Set(prefixList);
    this.propMap = {};
    this.classMap = {};

    //init this.propMap and this.classMap
    this.graph.forEach(node => {
      const splt = node['@id'].split(':');
      if (splt.length === 2 && this.prefixes.has(splt[0])) {
        const key = splt[1];
        if (node['@type'] === 'rdf:Property' && (node.domain || node.range)) {
          this.propMap[key] = {};
          if (node.domain) {
            this.propMap[key].domain = new Set(this.unprefix(node.domain));
          };
          if (node.range) {
            this.propMap[key].range = new Set(this.unprefix(node.range));
          };
        } else if (node['@type'] === 'rdfs:Class' && node.subClassOf) {
          this.classMap[key] = {
            subClassOf: new Set(this.unprefix(node.subClassOf))
          };
        }
      }
    });

    //add subClassesChain to this.classMap
    for (let key in this.classMap) {
      let subClassOfChain = this.getParentClasses(key);
      if (subClassOfChain) {
        this.classMap[key].subClassOfChain = subClassOfChain;
      }
    }
  }

  unprefix(terms) {
    return arrayify(terms).filter(term => {
      let splt = term.split(':');
      return splt.length === 2 && this.prefixes.has(splt[0])
    }).map(term => term.split(':')[1]);
  }

  getParentClasses(className) {
    let subClassOfChain;
    if (this.classMap[className] && this.classMap[className].subClassOf) {
      subClassOfChain = new Set(this.classMap[className].subClassOf.keys());
      for (let c of this.classMap[className].subClassOf.keys()) {
        let gsubClassOfChain = this.getParentClasses(c);
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

  getSubClasses(className) {
    var subClasses = new Set();
    for (let key in this.classMap) {
      if (
        this.classMap[key].subClassOfChain &&
        this.classMap[key].subClassOfChain.has(className) &&
        ! subClasses.has(key)
      ) {
        subClasses.add(key);
      }
    }
    return subClasses;
  }

  is(type, className) {
    var typeList = arrayify(type);

    for (var type of typeList) {
      if (type === className || this.getParentClasses(type).has(className)) {
        return true;
      }
    }

    return false;
  }

  isMoreSpecific(typea, typeb) {
    if (!(this.classMap[typea] && this.classMap[typea].subClassOfChain)) return false;

    return this.classMap[typea].subClassOfChain.has(typeb);
  }


  getType(obj, moreSpecificOrEqualThan = []) {
    if (obj['@type']) return obj['@type'];

    moreSpecificOrEqualThan = arrayify(moreSpecificOrEqualThan);

    var candidates = new Set();
    Object.keys(obj).forEach(key => {
      if (this.propMap[key] && this.propMap[key].domain) {
        for (let d of this.propMap[key].domain.keys()) {
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
      scores[c] = 0;
      Object.keys(obj).forEach(p => {
        if (
          this.propMap[p] &&
          this.propMap[p].domain &&
          this.classMap[c] &&
          this.classMap[c].subClassOfChain &&
          Array.from(this.propMap[p].domain).some(d => d === c || this.classMap[c].subClassOfChain.has(d))
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
