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
  elements: any[] = [];
  newNodeTitle: string = '';
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
      elements: this.elements,
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
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'mid-target-arrow-color': '#ccc',
          'mid-target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'control-point-step-size': 75,
        },
      },
    ];
  }

  private setupEventListeners() {
    if (!this.cy) return;

    this.cy.on('dblclick', 'node', (event) => this.onNodeDoubleClick(event.target));
    this.cy.on('cxttap', 'node', (event) =>
      this.showContextMenu(event.target, event.originalEvent)
    );
    this.cy.on('tap', (event) => this.onBackgroundClick(event));

    this.renderer.listen('document', 'contextmenu', (event) => {
      event.preventDefault();
    });
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

  loadDemo(demoNodes: any[], demoEdges: any[]) {
    if (this.cy) {
      this.cy.elements().remove();
  
      demoNodes.forEach((node) => {
        this.cy?.add(node);
        if (node.data.nodeType === 'node') {
          this.addHtmlLabelToNode(node.data.id);
        }
      });
  
      demoEdges.forEach((edge) => {
        this.cy?.add(edge);
      });
  
      this.snackBar.open('Demo loaded', 'Close', {
        duration: 3000,
      });
    }
  }
  

  private editNode(node: cytoscape.NodeSingular) {
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

  onAddNode(description: string): void {
    const dialogRef = this.dialog.open(NodeDialogComponent, {
      width: '300px',
      data: { title: this.newNodeTitle, description: description || "Default" },
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
        nodeType: 'node',    // result.nodeType
      },
      position: { x: 100, y: 100 },
    };

    this.nodeCounter++;
    this.elements.push(newNode);
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
        tpl: (data: any) => `
          <div style="border: 1px solid #000; border-radius: 5px; padding: 10px; background-color: #fff; max-width: 250px; overflow-wrap: break-word;">
            <div style="font-weight: bold; text-align: center;">${data.title}</div>
            <hr style="margin: 5px 0;">
            <div style="text-align: left;">${data.description}</div>
          </div>`,
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

  private areNodesConnected(
    firstNode: cytoscape.NodeSingular,
    secondNode: cytoscape.NodeSingular
  ): boolean {
    const connectedFinalDestinations = this.getConnectedFinalDestinations(
      firstNode
    );
    return this.checkExistingConnection(
      connectedFinalDestinations,
      secondNode
    );
  }

  private getConnectedFinalDestinations(
    node: cytoscape.NodeSingular
  ): Set<string> {
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

  private checkExistingConnection(
    connectedFinalDestinations: Set<string>,
    secondNode: cytoscape.NodeSingular
  ): boolean {
    if (connectedFinalDestinations.has(secondNode.id())) {
      return true;
    }

    if (secondNode.data('nodeType') === 'relation') {
      const relationOutgoingEdges = secondNode.outgoers('edge');
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
        this.connectionToRelationNode = false;
      }
      this.selectedNode = null;
    });
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
        id: `r${this.edgeCounter}`,
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
          target: `r${this.edgeCounter}`,
          label: result.relationType,
        },
      },
      {
        group: 'edges',
        data: {
          id: `e${this.edgeCounter}-2`,
          source: `r${this.edgeCounter}`,
          target: targetNode.id(),
          label: result.relationType,
        },
      },
    ]);
  }

  private calculateMidpoint(
    sourcePosition: cytoscape.Position,
    targetPosition: cytoscape.Position
  ) {
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
    this.cy?.elements().remove();
    this.snackBar.open('The board has been cleared', 'Close', {
      duration: 3000,
    });
  }

  saveNode() {
    this.showModal = false;
  }

  cancelNode() {
    this.showModal = false;
  }
}
