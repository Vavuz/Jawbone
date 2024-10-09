import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MyErrorStateMatcher } from '../node-dialog/node-dialog.component';import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-relation-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
    CommonModule,
  ],
  templateUrl: './relation-dialog.component.html',
  styleUrls: ['./relation-dialog.component.scss'],
})
export class RelationDialogComponent {
  relationTypes: string[] = [
    'Supports', 'Contradicts', 'Leads to', 'Therefore', 'Because', 'Despite', 'Assumes', 'Relies on',
    'Proves', 'Disproves', 'Highlights', 'Challenges', 'Explains', 'Illustrates', 'Clarifies', 'Justifies',
    'Questions', 'Strengthens', 'Weakens', 'Restates', 'Infers', 'Concludes', 'Summarizes', 'Contrasts',
    'Analogizes', 'Qualifies', 'Acknowledges', 'Counters', 'Extends', 'Refutes',
  ];

  isEditMode: boolean = false;
  isConnectionToRelationNode: boolean = false;
  matcher = new MyErrorStateMatcher();
  relationControl = new FormControl('', [Validators.required]);
  
  constructor(
    public dialogRef: MatDialogRef<RelationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = data.isEditMode || false;
    this.isConnectionToRelationNode = data.isConnectionToRelationNode || false;
  }
  

  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSave(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.data);
    }
  }
  
  isValid(): boolean {
    return this.data.directConnection || this.relationControl.valid;
  }
}