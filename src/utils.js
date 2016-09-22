import urlTemplate from 'url-template';

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
};

export function getRootPart(object) {
  let root;
  if (object && object.isPartOf) {
    root = object;
    while (root && root.isPartOf) {
      root = root.isPartOf
    }
  }
  return root;
};

export function getRootPartId(object) {
  const root = getRootPart(object);
  if (root) {
    return (typeof root === 'string') ? root : root['@id'];
  }
};

export function getCreativeWorkTypeFromMime(mimeType = '') {
  const dataset = new Set([
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/tab-separated-values',
    'application/json',
    'application/ld+json',
    'application/x-ldjson',
    'application/xml',
    'application/rdf+xml',
    'text/n3',
    'text/turtle'
  ]);

  const scholarlyArticle = new Set([
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    'application/x-latex'
  ]);

  const languageMimeSuffixes = [
    'javascript',
    'ecmascript',
    'x-asm',
    'x-c',
    'x-c++',
    'x-fortran',
    'x-java',
    'x-java-source',
    'x-pascal',
    'x-clojure',
    'x-coffeescript',
    'x-go',
    'x-ocaml',
    'x-scala',
    'x-python',
    'x-r',
    'x-rust',
    'x-erlang',
    'x-julia',
    'x-perl'
  ];
  const softwareSourceCode = new Set(
    languageMimeSuffixes.map(l => `text/${l}`).concat(
      languageMimeSuffixes.map(l => `application/${l}`)
    )
  );

  mimeType = mimeType.split(';')[0].trim();
  const type = mimeType.split('/')[0];

  if (type === 'image' ) {
    return 'Image';
  } else if (type === 'video') {
    return 'Video';
  } else if (type === 'audio') {
    return 'Audio';
  } else if (dataset.has(mimeType)) {
    return 'Dataset';
  } else if (scholarlyArticle.has(mimeType)) {
    return 'ScholarlyArticle';
  } else if (softwareSourceCode.has(mimeType)) {
    return 'SoftwareSourceCode';
  } else {
    return 'CreativeWork';
  }

};

export function getEncodingTypeFromMime(mimeType = '') {
  const contentType = mimeType.split(';')[0].trim();
  const type = contentType.split('/')[0];

  if (type === 'image' ) {
    return 'ImageObject';
  } else if (type === 'video') {
    return 'VideoObject';
  } else if (type === 'audio') {
    return 'AudioObject';
  } else if (~['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/tab-separated-values', 'application/json', 'application/ld+json', 'application/x-ldjson', 'application/xml', 'application/rdf+xml', 'text/n3', 'text/turtle'].indexOf(contentType)) {
    return 'DataDownload';
  } else if (~['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.oasis.opendocument.text', 'application/x-latex', 'text/html'].indexOf(contentType)) {
    return 'DocumentObject';
  } else if (~['application/javascript', 'application/ecmascript', 'text/javascript', 'text/ecmascript'].indexOf(contentType)) {
    return 'SoftwareSourceCodeObject';
  } else {
    return 'MediaObject';
  }
};

export function getAgent(agent) {
  const personOrOrganization = (
    (
      agent && (
        agent.agent ||
        agent.recipient ||
        agent.participant ||
        agent.creator ||
        agent.author ||
        agent.contributor ||
        agent.producer ||
        agent.editor ||
        agent.sender ||
        agent.accountablePerson ||
        agent.copyrightHolder ||
        agent.director ||
        agent.illustrator ||
        agent.knows ||
        agent.publishedBy ||
        agent.reviewedBy ||
        agent.sibling ||
        agent.spouse ||
        agent.translator
      )
    ) ||
    agent
  );

  // Due to the context, personOrOrganization could be a list (for instance author could be defined as @container: @list)
  return Array.isArray(personOrOrganization) ? personOrOrganization[0] : personOrOrganization;
};

export function getAgentId(agent) {
  const personOrOrganization = getAgent(agent);
  if (personOrOrganization) {
    return (typeof personOrOrganization === 'string') ? personOrOrganization : personOrOrganization['@id'];
  }
};

export function renderUrlTemplate(action, params, target) {
  target = target || action.target;

  if (target && Array.isArray(target) && target.length === 1) {
    target = target[0];
  }

  if (!target || !target.urlTemplate) {
    return '';
  }

  return urlTemplate
          .parse(target.urlTemplate)
          .expand(getUrlTemplateCtx(action, params));
};

export function getUrlTemplateCtx(action, params) {
  action = action || {};
  params = params || {};
  let ctx = {};

  _traverse(action, function(key, value) {
    if (/-input$|-output$/.test(key)) {
      if ('valueName' in value && (('defaultValue' in value) || (value.valueName in params))) {
        ctx[value.valueName] = params[value.valueName] || value.defaultValue;
      }
    }
  }, this);

  return ctx;
};

function _traverse(obj, func, ctx) {
  for (var i in obj) {
    func.apply(ctx || this, [i, obj[i]] );
    if (obj[i] !== null && typeof obj[i] == 'object') {
      _traverse(obj[i], func, ctx);
    }
  }
}
