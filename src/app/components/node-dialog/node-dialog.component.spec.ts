import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NodeDialogComponent } from './node-dialog.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule, MatRadioGroup } from '@angular/material/radio';

describe('NodeDialogComponent', () => {
  let component: NodeDialogComponent;
  let fixture: ComponentFixture<NodeDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<NodeDialogComponent>>;

  let dialogData = {
    title: '',
    description: '',
    nodeType: 'dialogue',
    isEditMode: false
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
  
    await TestBed.configureTestingModule({
      imports: [NodeDialogComponent, ReactiveFormsModule, NoopAnimationsModule, MatRadioModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();
  
    fixture = TestBed.createComponent(NodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });  

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with the correct node type', () => {
    expect(component.selectedNodeType).toBe(dialogData.nodeType);
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

  it('should filter argument groups based on search term', () => {
    component.searchControl.setValue('appeal');
    fixture.detectChanges();

    const filteredArguments = component.filteredGroups.flatMap(group => group.arguments);
    expect(filteredArguments).toContain('Appeal to authority');
    expect(filteredArguments).toContain('Appeal to emotions');
    expect(filteredArguments).not.toContain('Statement');
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
    fixture.detectChanges();

    component.onSave();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      ...dialogData,
      nodeType: 'dialogue',
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