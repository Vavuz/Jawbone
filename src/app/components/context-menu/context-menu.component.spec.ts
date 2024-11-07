import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './context-menu.component';
import { By } from '@angular/platform-browser';

describe('ContextMenuComponent', () => {
  let component: ContextMenuComponent;
  let fixture: ComponentFixture<ContextMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContextMenuComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit editNode event when Edit Node button is clicked', () => {
    spyOn(component.editNode, 'emit');

    const editButton = fixture.debugElement.query(By.css('button:first-child')).nativeElement;
    editButton.click();

    expect(component.editNode.emit).toHaveBeenCalled();
  });

  it('should emit deleteNode event when Delete Node button is clicked', () => {
    spyOn(component.deleteNode, 'emit');

    const deleteButton = fixture.debugElement.query(By.css('button:last-child')).nativeElement;
    deleteButton.click();

    expect(component.deleteNode.emit).toHaveBeenCalled();
  });
});