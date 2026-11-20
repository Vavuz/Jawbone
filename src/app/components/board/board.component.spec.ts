import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { BoardComponent } from './board.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Renderer2, Component, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

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
      'nodeHtmlLabel'
    ]);
    mockCytoscapeInstance.container = document.createElement('div');
    mockCytoscapeInstance.on.and.returnValue(mockCytoscapeInstance);
    mockCytoscapeInstance.add.and.returnValue(mockCytoscapeInstance);
    mockCytoscapeInstance.elements.and.returnValue({
      jsons: () => []
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
      imports: [BoardComponent],
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

  xit('should clear the board', () => {
    //
  });

  xit('should create a new node via onAddNode', fakeAsync(() => {
    //
  }));
});