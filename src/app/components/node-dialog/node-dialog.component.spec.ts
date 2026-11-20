import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NodeDialogComponent, SpeechActGroup } from './node-dialog.component';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('NodeDialogComponent', () => {
  let component: NodeDialogComponent;
  let fixture: ComponentFixture<NodeDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<NodeDialogComponent>>;
  let httpMock: HttpTestingController;

  const dialogData = {
    title: '',
    description: '',
    nodeType: 'dialogue',
    isEditMode: false
  };

  const mockSpeechActGroups: SpeechActGroup[] = [
    {
      name: 'Generic Types',
      speechActs: ['Question', 'Statement']
    },
    {
      name: 'Statements',
      speechActs: ['Ad hominem/Personal attack', 'Appeal', 'Assertion/Claim']
    },
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        NodeDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatRadioModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { ...dialogData } },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NodeDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const req = httpMock.expectOne('assets/speech-act-groups.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSpeechActGroups);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct node type', () => {
    expect(component.selectedNodeType).toBe(dialogData.nodeType);
    expect(component.data.backgroundColor).toBe('#ffffff');
  });

  it('should use the default color for the selected node type', () => {
    component.selectedNodeType = 'participant';
    component.onNodeTypeChange();

    expect(component.data.backgroundColor).toBe('#beeeb8');
  });

  it('should select a preset node color', () => {
    component.selectBackgroundColor('#fff2cc');

    expect(component.data.backgroundColor).toBe('#fff2cc');
    expect(component.isPresetColor('#fff2cc')).toBeTrue();
  });

  it('should display the correct dialog title based on edit mode', () => {
    component.data.isEditMode = true;
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleElement.textContent).toContain('Edit Node');

    component.data.isEditMode = false;
    fixture.detectChanges();
    expect(titleElement.textContent).toContain('Add New Node');
  });

  it('should filter speech act groups based on search term', () => {
    component.searchControl.setValue('appeal');
    fixture.detectChanges();

    const filteredSpeechActs = component.filteredGroups.flatMap(group => group.speechActs);
    expect(filteredSpeechActs).toContain('Appeal');
    expect(filteredSpeechActs).not.toContain('Question');
    expect(filteredSpeechActs).not.toContain('Statement');
  });

  it('should open the speech act table from its field', () => {
    const field = fixture.debugElement.query(By.css('.wide-select input'));
    (field.nativeElement as HTMLInputElement).click();
    fixture.detectChanges();

    expect(component.speechActPickerOpen).toBeTrue();
    expect(TestBed.inject(OverlayContainer).getContainerElement().querySelector('.speech-act-table')).not.toBeNull();
  });

  it('should select a speech act from the picker', () => {
    component.openSpeechActPicker();
    component.selectSpeechAct('Statement');

    expect(component.titleControl.value).toBe('Statement');
    expect(component.data.title).toBe('Statement');
    expect(component.speechActPickerOpen).toBeFalse();
  });

  it('should disable node type selection in edit mode', () => {
    component.data.isEditMode = true;
    fixture.detectChanges();

    const radioButtons = fixture.debugElement.queryAll(By.css('mat-radio-button'));

    radioButtons.forEach(rb => {
      const input = rb.query(By.css('input'))?.nativeElement as HTMLInputElement;
      expect(input.disabled).toBeTrue();
    });
  });

  it('should validate title and description for dialogue nodes', () => {
    component.selectedNodeType = 'dialogue';
    component.titleControl.setValue('');
    component.descriptionControl.setValue('');
    fixture.detectChanges();

    expect(component.titleControl.valid).toBeFalse();
    expect(component.descriptionControl.valid).toBeFalse();
  });

  it('should validate description for participant nodes', () => {
    component.selectedNodeType = 'participant';
    component.titleControl.setValue('');
    component.descriptionControl.setValue('');
    fixture.detectChanges();

    expect(component.descriptionControl.valid).toBeFalse();
  });

  it('should close dialog with result on Save for valid input', () => {
    component.selectedNodeType = 'dialogue';
    component.titleControl.setValue('Question');
    component.descriptionControl.setValue('Why do we argue?');
    component.data.backgroundColor = '#123abc';
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      ...dialogData,
      nodeType: 'dialogue',
      backgroundColor: '#123abc',
      title: 'Question',
      description: 'Why do we argue?'
    });
  });

  it('should not close dialog on Save for invalid input', () => {
    component.selectedNodeType = 'dialogue';
    component.titleControl.setValue('');
    component.descriptionControl.setValue('This is a description');
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog without data on Cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });
});