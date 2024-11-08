import { Component, Inject } from '@angular/core';
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

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
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
export class NodeDialogComponent {

  speechActGroups = [
    {
      name: 'Generic Types',
      speechActs: [
        'Question',
        'Statement'
      ]
    },
    {
      name: 'Statements',
      speechActs: [
        'Ad hominem/Personal attack',
        'Appeal',
        'Assertion/Claim',
        'Assumption',
        'Categorical statement',
        'Conclusion',
        'Conditional statement',
        'Counter example/Rebuttal',
        'Directive',
        'Existential statement',
        'Generalisation',
        'Premise',
        'Singular statement',
        'Similarity',
        'Threat'
      ]
    },
    {
      name: 'Questions',
      speechActs: [
        'Ad hominem question',
        'Complex question',
        'Conditional question',
        'Deliberative question',
        'Loaded question',
        'Rhetorical question',
        'Tricky question',
        'What question',
        'Where question',
        'Which question',
        'Who question',
        'Why question',
        'How question',
        'Whether question',
        'Yes-no question'
      ]
    },
    {
      name: 'Generalisations',
      speechActs: [
        'Absolute/Universal generalisation',
        'Inductive generalisation',
        'Presumptive defeasible generalisation'
      ]
    },
    {
      name: 'Appeals',
      speechActs: [
        'Appeal to authority',
        'Appeal to common knowledge',
        'Appeal to emotions',
        'Appeal to expert',
        'Appeal to fear',
        'Appeal to pity',
        'Appeal to popular opinion',
        'Appeal to witness testimony'
      ]
    },
    {
      name: 'Appeal to Expert Questions',
      speechActs: [
        'Backup Evidence Question',
        'Consistency Question',
        'Expertise Question',
        'Field Question',
        'Opinion Question',
        'Trustworthiness Question'
      ]
    },
    {
      name: 'Premises',
      speechActs: [
        'Bad outcome premise',
        'Base premise',
        'Character attack premise',
        'Classification premise',
        'Commitment premise',
        'Conditional premise',
        'Correlation premise',
        'Credibility questioning premise',
        'Fearful situation premise',
        'General acceptance premise',
        'General premise',
        'Implicit-Unstated premise',
        'Inconsistent commitment premise',
        'Individual premise',
        'Linkage of commitments premise',
        'Major premise',
        'Minor premise',
        'Opposed commitment premise',
        'Position to know premise',
        'Presumption premise',
        'Recursive premise',
        'Similarity premise',
        'Specific premise'
      ]
    }
  ];

  filteredGroups = [...this.speechActGroups];
  searchControl = new FormControl('');
  titleControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  matcher = new MyErrorStateMatcher();
  selectedNodeType: 'dialogue' | 'argument' | 'participant' = 'dialogue';

  constructor(
    public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedNodeType = data.nodeType || 'dialogue';
  }

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((searchTerm) => {
      this.filteredGroups = this.filteredSpeechActGroups(searchTerm || '');
    });
  }

  filteredSpeechActGroups(searchTerm: string = '') {
    const term = searchTerm?.toLowerCase() || '';
    return this.speechActGroups.map(group => ({
      ...group,
      speechActs: group.speechActs.filter(speechAct => speechAct.toLowerCase().includes(term))
    })).filter(group => group.speechActs.length > 0);
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