export function getParts(root, nodeMap) {
  if (nodeMap) {
    if ('@graph' in nodeMap) {
      nodeMap = nodeMap['@graph'].reduce((nodeMap, node) => {
        nodeMap[node['@id']] = node;
        return nodeMap;
      }, {});
    }

    if (typeof root === 'string') {
      root = nodeMap[root];
    }
  }

  if (!root || !root.hasPart || !root.hasPart.length) {
    return [];
  }

  return root.hasPart.reduce(function(prev, curr) {
    return prev.concat(curr, getParts(curr, nodeMap));
  }, []);
}
