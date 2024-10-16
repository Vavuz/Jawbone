import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { FileUploadService } from './services/file-upload/file-upload.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,
    BoardComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Jawbone';
  isLeftCollapsed = false;
  isRightCollapsed = false;
  newNodeDescription: string = '';
  textBlock: string = '';

  @ViewChild(BoardComponent) boardComponent!: BoardComponent;
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog,
    private fileUploadService: FileUploadService
  ) {
    this.initializeSelectionListener();
  }

  private initializeSelectionListener() {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('selectionchange', () => {
        this.newNodeDescription = window.getSelection()!.toString();
      });
    }
  }

  addNode(): void {
    this.boardComponent?.onAddNode(this.newNodeDescription);
  }

  toggleLeftSidebar(): void {
    this.isLeftCollapsed = !this.isLeftCollapsed;
  }

  toggleRightSidebar(): void {
    this.isRightCollapsed = !this.isRightCollapsed;
  }

  reset(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Reset Board',
        message: 'Are you sure you want to reset the board? This cannot be undone.',
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.clearBoard();
      }
    });
  }

  clearBoard(): void {
    this.boardComponent.clear();
  }

  upload(event: any) {
    const file: File = event.target.files[0];
    this.fileUploadService.readFile(file).then((fileContent: string) => {
      this.textBlock = fileContent;
    }).catch(error => {
      console.error(error);
    });
  }  

  loadDemo(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Load Demo',
        message: 'Are you sure you want to load the demo? This will override the current board and cannot be undone.',
      },
      autoFocus: false
    });
  
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.loadDemoContent();
      }
    });
  }

  loadDemoContent(): void {
    const demoNodes = [
      { data: { id: '1', title: 'Assertion', description: 'This is node 1', nodeType: 'node' }, position: { x: 100, y: 100 } },
      { data: { id: '2', title: 'Contradiction', description: 'This is node 2', nodeType: 'node' }, position: { x: 250, y: 300 } },
      { data: { id: '3', title: 'Assertion', description: 'This is node 3', nodeType: 'node' }, position: { x: 400, y: 100 } },
      { data: { id: 'r1', title: 'Supports', nodeType: 'relation' }, position: { x: 150, y: 200 } },
      { data: { id: 'r2', title: 'Contradicts', nodeType: 'relation' }, position: { x: 350, y: 200 } },
    ];
  
    const demoEdges = [
      { data: { id: 'e1', source: '1', target: 'r1', label: 'supports' } },
      { data: { id: 'e2', source: 'r1', target: '2', label: 'supports' } },
      { data: { id: 'e3', source: '2', target: 'r2', label: 'contradicts' } },
      { data: { id: 'e4', source: 'r2', target: '3', label: 'contradicts' } },
    ];
  
    this.boardComponent.loadDemo(demoNodes, demoEdges);
  }

  exportPng(): void {
    console.log('Export PNG clicked');
  }

  exportJson(): void {
      const boardContent = this.boardComponent.returnBoardContent();
      const file = new Blob([boardContent], { type: 'application/json' });
    
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = 'board-content.json';

      link.click();
      link.remove();
  }
}
