import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

export interface SpeechActGroup {
  name: string;
  speechActs: string[];
}

@Component({
  selector: 'app-node-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatDialogModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './node-dialog.component.html',
  styleUrls: ['./node-dialog.component.scss']
})
export class NodeDialogComponent implements OnInit {
  speechActGroups: SpeechActGroup[] = [];
  filteredGroups: SpeechActGroup[] = [];
  searchControl = new FormControl('');
  titleControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  selectedNodeType: 'dialogue' | 'argument' | 'participant' = 'dialogue';

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedNodeType = data.nodeType || 'dialogue';
  }

  ngOnInit() {
    this.loadSpeechActGroups().subscribe((data: SpeechActGroup[]) => {
      this.speechActGroups = data;
      this.filteredGroups = [...this.speechActGroups];
    });

    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredGroups = this.filteredSpeechActGroups(searchTerm || '');
    });
  }

  loadSpeechActGroups(): Observable<SpeechActGroup[]> {
    return this.http.get<SpeechActGroup[]>('assets/speech-act-groups.json');
  }

  filteredSpeechActGroups(searchTerm: string = ''): SpeechActGroup[] {
    const term = searchTerm.toLowerCase();
    return this.speechActGroups
      .map(group => ({
        ...group,
        speechActs: group.speechActs.filter((speechAct: string) =>
          speechAct.toLowerCase().includes(term)
        )
      }))
      .filter(group => group.speechActs.length > 0);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const isDialogue = this.selectedNodeType === 'dialogue';
    const validData = isDialogue
      ? this.descriptionControl.valid && this.titleControl.valid
      : this.descriptionControl.valid;
  
    if (validData) {
      const result = {
        ...this.data,
        nodeType: this.selectedNodeType
      };
      this.dialogRef.close(result);
    }
  }
}