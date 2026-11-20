import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Renderer2, Component, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-context-menu',
  template: ''
})
class MockContextMenuComponent {
  editNode = of(null);
  deleteNode = of(null);
}

@Component({
  selector: 'app-relation-dialog',
  template: ''
})
class MockRelationDialogComponent {}

@Component({
  selector: 'app-node-dialog',
  template: ''
})
class MockNodeDialogComponent {}

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockMatSnackBar: jasmine.SpyObj<MatSnackBar>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;
  let mockCytoscapeInstance: any;

  beforeEach(async () => {
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    mockRenderer = jasmine.createSpyObj('Renderer2', ['listen']);
  
    mockCytoscapeInstance = jasmine.createSpyObj('Core', [
      'on',
      'add',
      'destroy',
      'elements',
      'layout',
      'nodeHtmlLabel',
      'getElementById'
    ]);
    mockCytoscapeInstance.container = document.createElement('div');
    mockCytoscapeInstance.on.and.returnValue(mockCytoscapeInstance);
    mockCytoscapeInstance.add.and.returnValue(mockCytoscapeInstance);
    mockCytoscapeInstance.elements.and.returnValue({
      jsons: () => [],
      remove: () => {}
    });
    mockCytoscapeInstance.layout.and.returnValue({
      run: () => {}
    });
    mockCytoscapeInstance.nodeHtmlLabel.and.returnValue(mockCytoscapeInstance);

    (window as any).cytoscape = jasmine.createSpy('cytoscape').and.returnValue(mockCytoscapeInstance);
  
    const cyDiv = document.createElement('div');
    cyDiv.id = 'cy';
    document.body.appendChild(cyDiv);
  
    await TestBed.configureTestingModule({
      imports: [BoardComponent, NoopAnimationsModule],
      declarations: [
        MockContextMenuComponent,
        MockRelationDialogComponent,
        MockNodeDialogComponent
      ],
      providers: [
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: MatSnackBar, useValue: mockMatSnackBar },
        { provide: Renderer2, useValue: mockRenderer },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should initialize cytoscape on ngOnInit', () => {
    //
  });

  xit('should add nodes and edges in loadFromJaw', fakeAsync(() => {
    //
  }));

  it('should default imported JAW node colors and preserve custom colors', () => {
    const nodes = [
      {
        group: 'nodes',
        data: { id: '1', nodeType: 'participant' },
        position: { x: 0, y: 0 }
      },
      {
        group: 'nodes',
        data: { id: '2', nodeType: 'argument', backgroundColor: '#123abc' },
        position: { x: 1, y: 1 }
      }
    ];
    Object.defineProperty(component, 'cy', { value: mockCytoscapeInstance, writable: true });

    component.loadFromJaw(nodes);

    expect(mockCytoscapeInstance.add).toHaveBeenCalledWith([
      jasmine.objectContaining({
        data: jasmine.objectContaining({ backgroundColor: '#beeeb8' })
      }),
      jasmine.objectContaining({
        data: jasmine.objectContaining({ backgroundColor: '#123abc' })
      })
    ]);
  });

  it('should include node colors in exported JAW content', () => {
    const exportedNodes = [{
      group: 'nodes',
      data: { id: '1', nodeType: 'argument', backgroundColor: '#123abc' }
    }];
    mockCytoscapeInstance.elements.and.returnValue({
      jsons: () => exportedNodes,
      remove: () => {}
    });
    Object.defineProperty(component, 'cy', { value: mockCytoscapeInstance, writable: true });

    const jawContent = JSON.parse(component.returnBoardContent());

    expect(jawContent[0].data.backgroundColor).toBe('#123abc');
  });

  it('should pass a relation node title as its selected relation type when editing', () => {
    mockMatDialog.open.and.returnValue({
      afterClosed: () => of(null)
    } as any);
    const relationNode = {
      data: (key: string) => ({ nodeType: 'relation', title: 'Support' })[key as 'nodeType' | 'title']
    };

    component['editNode'](relationNode as any);

    expect(mockMatDialog.open.calls.mostRecent().args[1]?.data).toEqual({
      relationType: 'Support',
      isEditMode: true
    });
  });

  it('should size node hit areas to their HTML labels', () => {
    const node = jasmine.createSpyObj('Node', ['isNode', 'width', 'height', 'style']);
    node.isNode.and.returnValue(true);
    node.width.and.returnValue(30);
    node.height.and.returnValue(30);
    mockCytoscapeInstance.getElementById.and.returnValue(node);
    Object.defineProperty(component, 'cy', { value: mockCytoscapeInstance, writable: true });

    const container = document.createElement('div');
    const label = document.createElement('div');
    label.setAttribute('data-node-id', 'node-1');
    label.style.width = '120px';
    label.style.height = '80px';
    container.appendChild(label);
    document.body.appendChild(container);

    component['updateNodeHitAreas'](container);

    expect(node.style).toHaveBeenCalledWith({ width: '120px', height: '80px' });
    container.remove();
  });

  xit('should clear the board', () => {
    //
  });

  xit('should create a new node via onAddNode', fakeAsync(() => {
    //
  }));
});