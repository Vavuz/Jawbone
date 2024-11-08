import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { FileUploadService } from './services/file-upload/file-upload.service';
import { FormsModule } from '@angular/forms';
import { ImageExportService } from './services/image-export/image-export.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,
    BoardComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    HttpClientModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Jawbone';
  isLeftCollapsed = false;
  isRightCollapsed = false;
  newNodeDescription: string = '';
  textBlock: string = '';

  @ViewChild(BoardComponent) boardComponent!: BoardComponent;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService,
    private imageExportService: ImageExportService,
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

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    }
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  };

  private hasUnsavedChanges(): boolean {
    return this.textBlock.trim().length > 0 || this.boardComponent.nodeCounter > 0;
  }

  ngAfterViewInit(): void {
    this.imageExportService.setCytoscapeInstance(this.boardComponent.getCytoscapeInstance());
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
        this.textBlock = "";
        this.clearBoard();
      }
    });
  }

  clearBoard(): void {
    this.boardComponent.clear();
  }

  upload(event: any, fileType: 'txt' | 'jaw') {
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    if (fileType === 'txt' && fileExtension !== 'txt') {
      this.snackBar.open(
        'File not supported.', 'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    if (fileType === 'jaw' && fileExtension !== 'jaw') {
      this.snackBar.open(
        'File not supported.', 'Close',
        {
          duration: 3000,
        }
      );
      return;
    }

    this.fileUploadService.readFile(file).then((fileContent: any) => {
      if (Array.isArray(fileContent)) {
        this.boardComponent.loadFromJaw(fileContent);
      } else {
        this.textBlock = fileContent;
      }
    }).catch(error => {
      console.error(error);
      this.snackBar.open(
        'File upload error.', 'Close',
        {
          duration: 3000,
        }
      );
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
    this.http.get('assets/demo.jaw', { responseType: 'text' }).pipe(
      tap((data: string) => {
        try {
          const parsedData = JSON.parse(data);
          this.textBlock = "Alice: I believe taking out a mortgage at a young age is a sign of independence. It allows young people to be self-reliant rather than relying on their parents or public housing.\n" +
                 "Bob: However, getting into massive debt can be dangerous. Problems arise when debt spirals out of control.\n" +
                 "Alice: If managed responsibly, a mortgage is a smart investment in one's future.\n" +
                 "Bob: But many young people take on debt they can't handle, leading to financial crises.\n" +
                 "Alice: That's why financial education is crucial. Informed decisions come from proper knowledge.\n" +
                 "Bob: Even with education, unforeseen events can make debt unmanageable. It's not morally neutral if it leads to hardship.";
          this.boardComponent.loadFromJaw(parsedData, false);
        } catch (error) {
          console.error('Error parsing demo content:', error);
        }
      }),
      catchError((error) => {
        console.error('Error loading demo content:', error);
        return of(null);
      })
    ).subscribe();
  }

  exportPng(): void {
    this.imageExportService.exportDiagramAsImage('cy');
  }

  exportJaw(): void {
      const boardContent = this.boardComponent.returnBoardContent();
      const file = new Blob([boardContent], { type: 'application/json' });
    
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = 'board-content.jaw';

      link.click();
      link.remove();
  }
}