import cytoscape from 'cytoscape';

declare module 'cytoscape' {
  interface Core {
    nodeHtmlLabel: (labels: any[]) => void;
  }
}