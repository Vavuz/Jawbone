import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reset-dialog',
  standalone: true,
  imports: [MatDialogModule,
    MatButtonModule,
    CommonModule],
  templateUrl: './reset-dialog.component.html',
  styleUrl: './reset-dialog.component.scss'
})
export class ResetDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}