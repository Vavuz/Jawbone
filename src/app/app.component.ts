import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ResetDialogComponent } from './components/reset-dialog/reset-dialog.component';
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
  isRightCollapsed = true;
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
    const dialogRef = this.dialog.open(ResetDialogComponent, {autoFocus: false});

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
    console.log('Load demo clicked');
  }

  exportPng(): void {
    console.log('Export PNG clicked');
  }

  exportJson(): void {
    console.log('Export JSON clicked');
  }
}
