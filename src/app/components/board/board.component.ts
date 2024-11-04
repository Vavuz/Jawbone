import { Component, Renderer2, ViewChild, ViewContainerRef, ComponentRef, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import cytoscape from 'cytoscape';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { RelationDialogComponent } from '../relation-dialog/relation-dialog.component';
import { NodeDialogComponent } from '../node-dialog/node-dialog.component';

import nodeHtmlLabel from 'cytoscape-node-html-label';
nodeHtmlLabel(cytoscape);

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  private cy: cytoscape.Core | undefined;
  showModal: boolean = false;
  nodeCounter: number = 0;
  edgeCounter: number = 0;
  selectedNode?: cytoscape.NodeSingular | null = null;
  connectionToRelationNode: boolean = false;

  @ViewChild('contextMenuContainer', { read: ViewContainerRef })
  contextMenuContainer!: ViewContainerRef;
  private contextMenuRef: ComponentRef<ContextMenuComponent> | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCytoscape();
      this.setupEventListeners();
    }
  }

  private initializeCytoscape() {
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [],
      style: this.getCytoscapeStyles(),
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      autoungrabify: false,
    });
  }
  
  private getCytoscapeStyles(): cytoscape.Stylesheet[] {
    return [
      {
        selector: 'node[nodeType="relation"]',
        style: {
          shape: 'diamond',
          'background-color': '#f6ad4b',
          'border-color': '#a9531f',
          'border-width': '2px',
          'font-size': '12px',
          'text-valign': 'center',
          'text-halign': 'center',
          width: '90px',
          height: '40px',
          'text-max-width': '100px',
          content: 'data(title)',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 3,
          'line-color': '#666',
          'line-style': 'solid',
          'curve-style': 'bezier',
          'line-fill': 'linear-gradient',
          'target-arrow-color': '#333',
          'target-arrow-shape': 'triangle',
          'mid-target-arrow-color': '#333',
          'mid-target-arrow-shape': 'triangle',
          'arrow-scale': 1.5,
        }
      },
    ];
  }

  private setupEventListeners() {
    if (!this.cy) return;

    this.cy.on('dblclick', 'node', (event) => this.onNodeDoubleClick(event.target));
    this.cy.on('cxttap', 'node', (event) => this.showContextMenu(event.target, event.originalEvent));
    this.cy.on('tap', (event) => this.onBackgroundClick(event));

    const container = this.cy!.container();
    if (!container) return;

    // Pointing cursor on nodes
    this.cy.on('mouseover', 'node', (event) => {
      container.style.cursor = 'pointer';
    });
    this.cy.on('mouseout', 'node', (event) => {
      container.style.cursor = 'default';
    });

    this.renderer.listen('document', 'contextmenu', (event) => {
      event.preventDefault();
    });
  }

  getCytoscapeInstance() {
    return this.cy;
  }
  
  private onBackgroundClick(event: any) {
    if (event.target === this.cy) {
      this.hideContextMenu();
      this.selectedNode = null;
    }
  }

  private showContextMenu(node: cytoscape.NodeSingular, event: MouseEvent) {
    this.hideContextMenu();
  
    const contextMenuRef = this.contextMenuContainer.createComponent(
      ContextMenuComponent
    );
    
    contextMenuRef.instance.editNode.subscribe(() => {
      this.hideContextMenu();
      this.editNode(node);
    });

    contextMenuRef.instance.deleteNode.subscribe(() => {
      this.hideContextMenu();
      this.deleteNode(node);
    });
  
    const domElem = (contextMenuRef.hostView as any).rootNodes[0] as HTMLElement;
    domElem.style.position = 'fixed';
  
    const containerRect = this.cy!.container()!.getBoundingClientRect();
  
    const pan = this.cy!.pan();
    const zoom = this.cy!.zoom();
    const modelPosition = node.position();

    const nodeRenderedPosition = {
      x: modelPosition.x * zoom + pan.x,
      y: modelPosition.y * zoom + pan.y,
    };
  
    const contextMenuX = containerRect.left + nodeRenderedPosition.x;
    const contextMenuY = containerRect.top + nodeRenderedPosition.y;
  
    domElem.style.left = `${contextMenuX}px`;
    domElem.style.top = `${contextMenuY}px`;
    domElem.style.zIndex = '1000';
  
    this.contextMenuRef = contextMenuRef;
  }  

  private hideContextMenu() {
    if (this.contextMenuRef) {
      this.contextMenuRef.destroy();
      this.contextMenuRef = null;
    }
  }

  loadFromJaw(jsonData: any[], useGridLayout: boolean = false): void {
    if (!this.cy) return;
    console.log(jsonData);
    this.clear();
  
    const nodes = jsonData.filter(element => element.group === 'nodes');
    const edges = jsonData.filter(element => element.group === 'edges');
  
    this.cy.add(nodes);
    this.cy.add(edges);
  
    nodes.forEach(node => {
      if (node.data.nodeType !== 'relation') {
        this.addHtmlLabelToNode(node.data.id);
      }
    });
  
    // Increment counters
    this.nodeCounter = nodes.length;
    this.edgeCounter = edges.reduce((maxIndex, edge) => {
      const baseEdgeId = edge.data.id.split('-')[0].substring(1);
      const numericBaseId = parseInt(baseEdgeId, 10);
      return Math.max(maxIndex, numericBaseId);
    }, 0) + 1;
  
    // Apply layout
    const layout = useGridLayout ? { name: 'grid' } : { name: 'preset' };
    this.cy.layout(layout).run();
  
    this.snackBar.open('Diagram loaded', 'Close', {
      duration: 3000,
    });
  }  

  private updateCounters(nodes: any[], edges: any[]): void {
    if (nodes.length > 0) {
      const lastNodeId = nodes[nodes.length - 1].data.id;
      const matches = lastNodeId.match(/\d+$/);
      this.nodeCounter = matches ? parseInt(matches[0], 10) + 1 : 0;
    } else {
      this.nodeCounter = 0;
    }

    this.edgeCounter =
      edges.reduce((maxIndex, edge) => {
        const baseEdgeId = edge.data.id.split('-')[0].substring(1);
        const numericBaseId = parseInt(baseEdgeId, 10);
        return Math.max(maxIndex, numericBaseId);
      }, 0) + 1;
  }

  private editNode(node: NodeSingular): void {
    const isRelationNode = node.data('nodeType') === 'relation';
    let dialogRef;
  
    if (isRelationNode) {
      dialogRef = this.dialog.open(RelationDialogComponent, {
        width: '300px',
        data: { title: node.data('title'), isEditMode: true },
      });
    } else {
      dialogRef = this.dialog.open(NodeDialogComponent, {
        width: '300px',
        data: {
          title: node.data('title'),
          description: node.data('description'),
          isEditMode: true,
          nodeType: node.data('nodeType'),
        },
      });
    }
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (isRelationNode) {
          node.data('title', result.relationType);
        } else {
          node.data('title', result.title);
          node.data('description', result.description);
        }
      }
    });
  }

  private deleteNode(node: cytoscape.NodeSingular) {
    if (!this.cy || !node) return;
  
    // Relation node removal
    if (node.data('nodeType') === 'relation') {
      node.connectedEdges().remove();
      node.remove();
      return;
    }
  
    // Other nodes removal
    const connectedEdges = node.connectedEdges();
    const connectedRelationNodes = node.neighborhood().filter(connected => connected.data('nodeType') === 'relation');

    connectedEdges.remove();
    node.remove();

    connectedRelationNodes.forEach(element => {
      const ingoers = element.connectedEdges().filter(edge => edge.data('target') === element.data('id'));
      const outgoers = element.connectedEdges().filter(edge => edge.data('source') === element.data('id'));
      if (!outgoers.nonempty() || !ingoers.nonempty()) {
        element.connectedEdges().remove();
        element.remove();
      }
    });
  }   

  onAddNode(description: string): void {
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      width: '300px',
      data: { title: "", description: description || "Default" },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createNewNode(result);
      }
    });
  }

  private createNewNode(result: any) {
    const newNode = {
      data: {
        id: `${this.nodeCounter}`,
        title: result.title,
        description: result.description,
        nodeType: result.nodeType,
      },
      position: { x: 100, y: 100 },
    };

    this.nodeCounter++;
    const addedNode = this.cy?.add(newNode);

    this.addHtmlLabelToNode(newNode.data.id);
    this.makeNodeGrabbable(addedNode);
  }

  private addHtmlLabelToNode(nodeId: string) {
    this.cy?.nodeHtmlLabel([
      {
        query: `node[id="${nodeId}"]`,
        halign: 'center',
        valign: 'center',
        halignBox: 'center',
        valignBox: 'center',
        cssClass: 'cy-title',
        tpl: (data: any) => {
          const borderColor = data.nodeType === 'participant' ? 'green' : '#000';
          const backgroundColor = data.nodeType === 'participant' ? '#beeeb8' : '#d8eefd';
          const textStyle = data.nodeType === 'participant' ? 'font-weight: bold;' : '';
  
          if (data.nodeType === 'argument' || data.nodeType === 'participant') {
            return `
              <div style="
                border: 3px solid ${borderColor};
                border-radius: 5px;
                padding: 10px;
                background-color: ${backgroundColor};
                max-width: 250px;
                overflow-wrap: break-word;">
                <div style="text-align: left; ${textStyle}">
                  ${data.description}
                </div>
              </div>`;
          }
  
          return `
            <div style="
              border: 3px solid #000;
              border-radius: 5px;
              padding: 10px;
              background-color: #fff;
              max-width: 250px;
              overflow-wrap: break-word;">
              <div style="font-weight: bold; text-align: center;">
                ${data.title}
              </div>
              <hr style="margin: 4px 0;">
              <div style="text-align: left;">
                ${data.description}
              </div>
            </div>`;
        },
      },
    ]);
  }  

  private makeNodeGrabbable(node: cytoscape.NodeCollection | undefined) {
    node?.forEach((n) => {
      n.grabify();
      n.on('grab', () => {
        n.grabify();
      });
    });
  }

  private onNodeDoubleClick(node: cytoscape.NodeSingular) {
    if (this.isInvalidConnectionStart(node)) return;

    if (!this.selectedNode) {
      this.selectedNode = node;
      return;
    }

    if (this.areNodesConnected(this.selectedNode, node)) {
      this.snackBar.open('This connection already exists', 'Close', {
        duration: 3000,
      });
      this.selectedNode = null;
      this.connectionToRelationNode = false;
      return;
    }

    this.createConnection(node);
  }

  private isInvalidConnectionStart(node: cytoscape.NodeSingular) {
    if (node.data('nodeType') === 'relation') {
      if (!this.selectedNode) {
        this.snackBar.open(
          'Connections cannot start from a relation node', 'Close',
          {
            duration: 3000,
          }
        );
        return true;
      }
      this.connectionToRelationNode = true;
    }
    return false;
  }

  private areNodesConnected(firstNode: cytoscape.NodeSingular, secondNode: cytoscape.NodeSingular): boolean {
    const connectedFinalDestinations = this.getConnectedFinalDestinations(firstNode);
    return this.checkExistingConnection(connectedFinalDestinations, secondNode);
  }

  private getConnectedFinalDestinations(node: cytoscape.NodeSingular): Set<string> {
    const connectedFinalDestinations = new Set<string>();
    const sourceId = node.id();
    const outgoingEdges = this.cy?.$(`#${sourceId}`).outgoers('edge');

    outgoingEdges?.forEach((edge) => {
      const target = edge.target();
      if (target.data('nodeType') === 'relation') {
        target.outgoers('edge').forEach((relationEdge) => {
          connectedFinalDestinations.add(relationEdge.target().id());
        });
      } else {
        connectedFinalDestinations.add(target.id());
      }
    });

    return connectedFinalDestinations;
  }

  private checkExistingConnection(connectedFinalDestinations: Set<string>, node: cytoscape.NodeSingular): boolean {
    if (connectedFinalDestinations.has(node.id())) {
      return true;
    }

    if (node.data('nodeType') === 'relation') {
      const relationOutgoingEdges = node.outgoers('edge');
      for (let relationEdge of relationOutgoingEdges) {
        if (connectedFinalDestinations.has(relationEdge.target().id())) {
          return true;
        }
      }
    }
    return false;
  }

  private createConnection(targetNode: cytoscape.NodeSingular) {
    const dialogRef = this.dialog.open(RelationDialogComponent, {
      width: '300px',
      data: {
        relationType: '',
        directConnection: this.connectionToRelationNode,
        isEditMode: false,
        isConnectionToRelationNode: this.connectionToRelationNode,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addConnection(result, targetNode);
      }
      this.selectedNode = null;
    });
    
    this.connectionToRelationNode = false;
  }

  private addConnection(result: any, targetNode: cytoscape.NodeSingular) {
    if (result.directConnection) {
      this.cy?.add({
        group: 'edges',
        data: {
          id: `e${this.edgeCounter}`,
          source: this.selectedNode!.id(),
          target: targetNode.id(),
          label: result.relationType,
        },
      });
    } else {
      this.addRelationNodeConnection(result, targetNode);
      this.nodeCounter++;
    }
    this.edgeCounter++;
  }

  private addRelationNodeConnection(result: any, targetNode: cytoscape.NodeSingular) {
    const midPoint = this.calculateMidpoint(
      this.selectedNode!.position(),
      targetNode.position()
    );

    const relationNode = {
      data: {
        id: `r${this.nodeCounter}`,
        title: result.relationType,
        description: '',
        nodeType: 'relation',
        'background-color': '#f0cd7e',
      },
      position: { x: midPoint.x, y: midPoint.y },
    };

    this.cy?.add(relationNode);

    this.cy?.add([
      {
        group: 'edges',
        data: {
          id: `e${this.edgeCounter}-1`,
          source: this.selectedNode!.id(),
          target: `r${this.nodeCounter}`,
          label: result.relationType,
        },
      },
      {
        group: 'edges',
        data: {
          id: `e${this.edgeCounter}-2`,
          source: `r${this.nodeCounter}`,
          target: targetNode.id(),
          label: result.relationType,
        },
      },
    ]);
  }

  private calculateMidpoint(sourcePosition: cytoscape.Position, targetPosition: cytoscape.Position) {
    let midX, midY;

    if (sourcePosition.x === targetPosition.x) {
      midX = sourcePosition.x + 150;
      midY = sourcePosition.y;
    } else {
      midX = (sourcePosition.x + targetPosition.x) / 2;
      midY = (sourcePosition.y + targetPosition.y) / 2;
    }

    return { x: midX, y: midY };
  }

  clear(): void {
    this.nodeCounter = 0;
    this.edgeCounter = 0;
    this.cy?.elements().remove();

    this.snackBar.open('The board has been cleared', 'Close', {
      duration: 3000,
    });
  }

  returnBoardContent(): string {
    const elements = this.cy?.elements();
    return elements? JSON.stringify(elements.jsons()) : "";
  }
  
  saveNode() {
    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}