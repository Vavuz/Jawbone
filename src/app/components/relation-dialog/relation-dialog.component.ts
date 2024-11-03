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
    'Support', 'Contradict', 'Attack', 'Lead to', 'Assume', 'Rely on', 'Prove',
    'Disprove', 'Highlight', 'Challenge', 'Explain', 'Clarify', 'Justify',
    'Question', 'Strengthen', 'Weaken', 'Infer', 'Conclude', 'Summarise',
    'Acknowledge', 'Counter', 'Extend', 'Refute', 'Rephrase',
    'Therefore', 'Because', 'Despite', 'Analogy', 'Contrast'
  ];

  matcher = new MyErrorStateMatcher();
  relationControl = new FormControl('', [Validators.required]);
  
  constructor(
    public dialogRef: MatDialogRef<RelationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  

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