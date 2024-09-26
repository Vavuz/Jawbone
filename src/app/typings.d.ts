import cytoscape from 'cytoscape';

declare module 'cytoscape' {
  interface Core {
    nodeHtmlLabel: (labels: any[]) => void;
  }
}

declare module 'cytoscape-node-html-label' {
  const ext: (cytoscape: typeof cytoscape) => void;
  export = ext;
}