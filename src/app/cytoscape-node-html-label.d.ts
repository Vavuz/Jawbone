declare module 'cytoscape-node-html-label' {
  import cytoscape = require('cytoscape');
  function nodeHtmlLabel(cy: typeof cytoscape): void;
  export = nodeHtmlLabel;
}
