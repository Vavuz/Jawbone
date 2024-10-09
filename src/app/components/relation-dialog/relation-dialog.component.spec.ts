import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationDialogComponent } from './relation-dialog.component';

describe('RelationDialogComponent', () => {
  let component: RelationDialogComponent;
  let fixture: ComponentFixture<RelationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RelationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});