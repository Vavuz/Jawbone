import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;
  
  const dialogData = { title: 'Confirm Action', message: 'Are you sure you want to proceed?' };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    
    await TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct title and message', () => {
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    const messageElement = fixture.debugElement.query(By.css('p')).nativeElement;

    expect(titleElement.textContent).toContain(dialogData.title);
    expect(messageElement.textContent).toContain(dialogData.message);
  });

  it('should close the dialog with true when Confirm is clicked', () => {
    const confirmButton = fixture.debugElement.query(By.css('button:last-child')).nativeElement;
    confirmButton.click();
    
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close the dialog with false when Cancel is clicked', () => {
    const cancelButton = fixture.debugElement.query(By.css('button:first-child')).nativeElement;
    cancelButton.click();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  it('should call onConfirm when Confirm button is clicked', () => {
    spyOn(component, 'onConfirm').and.callThrough();
    const confirmButton = fixture.debugElement.query(By.css('button:last-child')).nativeElement;
    confirmButton.click();
    
    expect(component.onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    spyOn(component, 'onCancel').and.callThrough();
    const cancelButton = fixture.debugElement.query(By.css('button:first-child')).nativeElement;
    cancelButton.click();
    
    expect(component.onCancel).toHaveBeenCalled();
  });
});