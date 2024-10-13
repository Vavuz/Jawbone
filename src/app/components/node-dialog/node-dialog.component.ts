import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
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
  argumentGroups = [
    {
      name: 'Deductive Arguments',
      arguments: [
        'Categorical Syllogism',
        'Disjunctive Syllogism',
        'Hypothetical Syllogism',
        'Modus Ponens',
        'Modus Tollens',
      ]
    },
    {
      name: 'Inductive Arguments',
      arguments: [
        'Inductive Generalization',
        'Statistical Syllogism',
        'Argument from Analogy',
        'Causal Inference',
        'Prediction',
      ]
    },
    {
      name: 'Presumptive Arguments',
      arguments: [
        'Argument from Authority',
        'Argument from Ignorance (Ad Ignorantiam)',
        'Presumptive Defeasible Generalization',
      ]
    },
    {
      name: 'Fallacious Arguments',
      arguments: [
        'Ad Hominem',
        'Straw Man',
        'False Dichotomy (False Dilemma)',
        'Begging the Question',
        'Slippery Slope',
      ]
    },
    {
      name: 'Other Speech Acts',
      arguments: [
        'Argument from Sign',
        'Existential Statement',
        'Argument by Example',
        'Argument from Consequences',
        'Argument from Silence',
        // -----
        'Rhetorical Question',
        'Similarity',
        'Counter example',
        'Assertion',
        'Question',
        'Directive',
        'Counter-Example',
        'Rebuttal',
        'Existential Statement',
        'Threat',
      ]
    },
    {
      name: 'Specialized Argument Types',
      arguments: [
        'Tu Quoque (You Too)',
        'Appeal to Tradition',
        'Appeal to Novelty',
        'Appeal to Popularity (Ad Populum)',
        'Gambler\'s Fallacy',
      ]
    },
    {
      name: 'Other Argument Types',
      arguments: [
        'Appeal to Expert Opinion',
        'Position to Know',
      ]
    }
  ];

  matcher = new MyErrorStateMatcher();
  titleControl = new FormControl('', [Validators.required]);
  descriptionControl = new FormControl('', [Validators.required]);
  selectedNodeType: 'dialogue' | 'argument' | 'participant' = 'dialogue';

  constructor(
    public dialogRef: MatDialogRef<NodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.descriptionControl.valid && this.titleControl.valid) {
      const result = {
        ...this.data,
        nodeType: this.selectedNodeType
      };
      this.dialogRef.close(result);
    }
  }
}