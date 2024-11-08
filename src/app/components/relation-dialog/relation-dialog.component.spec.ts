import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RelationDialogComponent } from './relation-dialog.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RelationDialogComponent', () => {
  let component: RelationDialogComponent;
  let fixture: ComponentFixture<RelationDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<RelationDialogComponent>>;
  let httpMock: HttpTestingController;

  const dialogData = {
    relationType: '',
    directConnection: false,
    isEditMode: false,
    isConnectionToRelationNode: false
  };

  const mockRelationTypes: string[] = [
    'Support', 'Contradict', 'Attack', 'Lead to', 'Assume', 'Rely on', 'Prove',
    'Disprove', 'Highlight', 'Challenge', 'Explain', 'Clarify', 'Justify',
    'Question', 'Strengthen', 'Weaken', 'Infer', 'Conclude', 'Summarise',
    'Acknowledge', 'Counter', 'Extend', 'Refute', 'Rephrase',
    'Therefore', 'Because', 'Despite', 'Analogy', 'Contrast'
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        RelationDialogComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatCheckboxModule,
        MatSelectModule,
        MatFormFieldModule,
        MatButtonModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RelationDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const req = httpMock.expectOne('assets/relation-types.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockRelationTypes);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct dialog title based on edit mode', () => {
    component.data.isEditMode = true;
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleElement.textContent).toContain('Select New Relation Type');

    component.data.isEditMode = false;
    fixture.detectChanges();
    expect(titleElement.textContent).toContain('Select Relation Type');
  });

  it('should require a relation type if direct connection is not checked', () => {
    component.relationForm.patchValue({
      directConnection: false,
      relationType: ''
    });
    fixture.detectChanges();

    expect(component.isValid()).toBeFalse();
    expect(component.relationControl.hasError('required')).toBeTrue();
  });

  it('should not require a relation type if direct connection is checked', () => {
    component.relationForm.patchValue({
      directConnection: true,
      relationType: ''
    });
    fixture.detectChanges();

    expect(component.isValid()).toBeTrue();
    expect(component.relationControl.hasError('required')).toBeFalse();
  });

  it('should filter relations based on search term', () => {
    component.searchControl.setValue('Attack');
    fixture.detectChanges();

    const filteredRelations = component.filteredRelations(component.searchControl.value!);

    expect(filteredRelations).toContain('Attack');
    expect(filteredRelations).not.toContain('Support');
    expect(filteredRelations).not.toContain('Therefore');
  });

  it('should disable the relation type selection if connected to a relation node', () => {
    component.data.isConnectionToRelationNode = true;
    fixture.detectChanges();

    const formField = fixture.debugElement.query(By.css('.wide-select'));
    expect(formField).toBeNull();
  });

  it('should close dialog with data on Save if form is valid', () => {
    component.relationForm.patchValue({
      directConnection: false,
      relationType: 'Support'
    });
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      ...dialogData,
      relationType: 'Support',
      directConnection: false
    });
  });

  it('should not close dialog on Save if form is invalid', () => {
    component.relationForm.patchValue({
      directConnection: false,
      relationType: ''
    });
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog without data on Cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should toggle the direct connection checkbox', () => {
    const checkboxDebug = fixture.debugElement.query(By.css('mat-checkbox'));
    const checkbox = checkboxDebug.componentInstance as any;

    checkbox.toggle();
    fixture.detectChanges();

    expect(component.directConnectionControl.value).toBeTrue();
  });
});