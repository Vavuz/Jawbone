import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HTML2CANVAS } from './services/image-export/html2canvas.token';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadService } from './services/file-upload/file-upload.service';
import { Component } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImageExportService } from './services/image-export/image-export.service';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-board',
  standalone: true,
  template: ''
})
class MockBoardComponent {
  getCytoscapeInstance() {
    return {} as any;
  }

  onAddNode(description: string) {}
  
  clear() {}
  
  loadFromJaw(parsedData: any, flag?: boolean) {}
  
  returnBoardContent() {
    return 'mockBoardContent';
  }
}

@Component({
  selector: 'app-confirmation-dialog',
  template: ''
})
class MockConfirmationDialogComponent {}

describe('AppComponent', () => {
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockFileUploadService: jasmine.SpyObj<FileUploadService>;
  let mockHtml2canvas: jasmine.Spy;
  let fixture: any;
  let component: AppComponent;
  let httpTestingController: HttpTestingController;
  
  beforeEach(async () => {
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockFileUploadService = jasmine.createSpyObj('FileUploadService', ['readFile']);
    mockHtml2canvas = jasmine.createSpy('html2canvas').and.returnValue(Promise.resolve(document.createElement('canvas')));
    
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        MockBoardComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      declarations: [
        MockConfirmationDialogComponent
      ],
      providers: [
        { provide: HTML2CANVAS, useValue: mockHtml2canvas },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: FileUploadService, useValue: mockFileUploadService },
        { provide: ConfirmationDialogComponent, useClass: MockConfirmationDialogComponent },
      ],
    }).compileComponents();
    
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    
    fixture.detectChanges();
  });
  
  afterEach(() => {
    httpTestingController.verify();
  });
  
  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
  
  it('should call boardComponent.onAddNode with newNodeDescription when addNode is called', () => {
    const mockBoardComponent = component.boardComponent as MockBoardComponent;
    spyOn(mockBoardComponent, 'onAddNode');
    
    component.newNodeDescription = 'Test Node';
    component.addNode();
    
    expect(mockBoardComponent.onAddNode).toHaveBeenCalledWith('Test Node');
  });
  
  it('should toggle isLeftCollapsed when toggleLeftSidebar is called', () => {
    const initialState = component.isLeftCollapsed;
    component.toggleLeftSidebar();
    expect(component.isLeftCollapsed).toBe(!initialState);
  });

  it('should toggle isRightCollapsed when toggleRightSidebar is called', () => {
    const initialState = component.isRightCollapsed;
    component.toggleRightSidebar();
    
    expect(component.isRightCollapsed).toBe(!initialState);
  }); 
  
  it('should call fileUploadService.readFile with the uploaded file and load content as Jaw if array', fakeAsync(async () => {
    const mockBoardComponent = component.boardComponent as MockBoardComponent;
    spyOn(mockBoardComponent, 'loadFromJaw');
    
    const mockFile = new File(['content'], 'test.jaw', { type: 'text/plain' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };
    
    const mockContent = ['node1', 'node2'];
    mockFileUploadService.readFile.and.returnValue(Promise.resolve(mockContent));
    
    await component.upload(mockEvent, 'jaw');
    
    tick();
    fixture.detectChanges();
    
    expect(mockFileUploadService.readFile).toHaveBeenCalledWith(mockFile);
    expect(mockBoardComponent.loadFromJaw).toHaveBeenCalledWith(mockContent);
    expect(component.textBlock).toBe('');
  }));
  
  it('should call fileUploadService.readFile with the uploaded file and set textBlock if not array', fakeAsync(async () => {
    const mockBoardComponent = component.boardComponent as MockBoardComponent;
    spyOn(mockBoardComponent, 'loadFromJaw');
    
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };
    
    const mockContent = 'some text';
    mockFileUploadService.readFile.and.returnValue(Promise.resolve(mockContent));
    
    await component.upload(mockEvent, 'txt');
    
    tick();
    fixture.detectChanges();
    
    expect(mockFileUploadService.readFile).toHaveBeenCalledWith(mockFile);
    expect(mockBoardComponent.loadFromJaw).not.toHaveBeenCalled();
    expect(component.textBlock).toBe('some text');
  }));
  
  it('should call imageExportService.exportDiagramAsImage with "cy" when exportPng is called', () => {
    const imageExportService = TestBed.inject(ImageExportService);
    spyOn(imageExportService, 'exportDiagramAsImage');
    
    component.exportPng();
    
    expect(imageExportService.exportDiagramAsImage).toHaveBeenCalledWith('cy');
  });
 
  it('should export Jaw content correctly', () => {
    const mockBoardContent = 'mockBoardContent';
    const mockBoardComponent = component.boardComponent as MockBoardComponent;
    spyOn(mockBoardComponent, 'returnBoardContent').and.returnValue(mockBoardContent);
    
    const mockLink = jasmine.createSpyObj('a', ['click', 'remove']);
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return {} as any;
    });

    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
    
    component.exportJaw();
    
    expect(mockBoardComponent.returnBoardContent).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(window.URL.createObjectURL).toHaveBeenCalledWith(jasmine.any(Blob));
    expect(mockLink.href).toBe('blob:url');
    expect(mockLink.download).toBe('board-content.jaw');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.remove).toHaveBeenCalled();
  });
});