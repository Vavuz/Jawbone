import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  constructor(public dialogRef: MatDialogRef<ResetDialogComponent>) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}