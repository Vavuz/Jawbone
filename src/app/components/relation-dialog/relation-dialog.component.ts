import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-relation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    OverlayModule,
  ],
  templateUrl: './relation-dialog.component.html',
  styleUrls: ['./relation-dialog.component.scss'],
})
export class RelationDialogComponent implements OnInit {
  relationTypes: string[] = [];
  filteredRelationTypes: string[] = [];
  searchControl = new FormControl('');
  relationPickerOpen = false;
  readonly pickerPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  relationForm: FormGroup;
  relationControl: FormControl;
  directConnectionControl: FormControl;

  constructor(
    private http: HttpClient,
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
    this.loadRelationTypes().subscribe((data: string[]) => {
      this.relationTypes = data;
      this.filteredRelationTypes = this.filteredRelations('');
    });

    this.directConnectionControl.valueChanges.subscribe(() => {
      this.updateValidators();
    });

    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredRelationTypes = this.filteredRelations(searchTerm || '');
    });
  }

  loadRelationTypes(): Observable<string[]> {
    return this.http.get<string[]>('assets/relation-types.json');
  }

  filteredRelations(searchTerm: string): string[] {
    const term = searchTerm.toLowerCase();
    return this.relationTypes
      .filter(relation => relation.toLowerCase().includes(term))
      .sort((first, second) => first.localeCompare(second));
  }

  selectRelationType(relationType: string): void {
    this.relationControl.setValue(relationType);
    this.closeRelationPicker();
  }

  openRelationPicker(): void {
    this.searchControl.setValue('');
    this.relationPickerOpen = true;
  }

  closeRelationPicker(): void {
    this.relationPickerOpen = false;
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