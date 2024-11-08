import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MyErrorStateMatcher } from '../node-dialog/node-dialog.component';

@Component({
  selector: 'app-relation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './relation-dialog.component.html',
  styleUrls: ['./relation-dialog.component.scss'],
})
export class RelationDialogComponent implements OnInit {
  relationTypes: string[] = [
    'Support', 'Contradict', 'Attack', 'Lead to', 'Assume', 'Rely on', 'Prove',
    'Disprove', 'Highlight', 'Challenge', 'Explain', 'Clarify', 'Justify',
    'Question', 'Strengthen', 'Weaken', 'Infer', 'Conclude', 'Summarise',
    'Acknowledge', 'Counter', 'Extend', 'Refute', 'Rephrase',
    'Therefore', 'Because', 'Despite', 'Analogy', 'Contrast'
  ];

  filteredRelationTypes: string[] = [...this.relationTypes];
  searchControl = new FormControl('');
  matcher = new MyErrorStateMatcher();

  relationForm: FormGroup;
  relationControl: FormControl;
  directConnectionControl: FormControl;

  constructor(
    public dialogRef: MatDialogRef<RelationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.relationControl = new FormControl(
      this.data.relationType || '',
      Validators.required
    );
    this.directConnectionControl = new FormControl(
      this.data.directConnection || false
    );

    this.relationForm = new FormGroup({
      relationType: this.relationControl,
      directConnection: this.directConnectionControl
    });
  }

  ngOnInit() {
    this.directConnectionControl.valueChanges.subscribe(() => {
      this.updateValidators();
    });

    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredRelationTypes = this.filterRelations(searchTerm || '');
    });
  }

  filterRelations(searchTerm: string): string[] {
    const term = searchTerm.toLowerCase();
    return this.relationTypes.filter(relation =>
      relation.toLowerCase().includes(term)
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isValid()) {
      const result = {
        ...this.data,
        relationType: this.relationControl.value,
        directConnection: this.directConnectionControl.value
      };
      this.dialogRef.close(result);
    }
  }

  isValid(): boolean {
    return this.directConnectionControl.value || this.relationControl.valid;
  }

  updateValidators(): void {
    if (this.directConnectionControl.value) {
      this.relationControl.clearValidators();
    } else {
      this.relationControl.setValidators([Validators.required]);
    }
    this.relationControl.updateValueAndValidity();
  }
}