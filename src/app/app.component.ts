import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { isPlatformBrowser } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet,
    BoardComponent,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Jawbone';
  isLeftCollapsed = false;
  isRightCollapsed = true;
  newNodeDescription: string = '';

  @ViewChild(BoardComponent) boardComponent!: BoardComponent;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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
    // Implement reset functionality
    console.log('Reset clicked');
  }

  upload(): void {
    // Implement upload functionality
    console.log('Upload clicked');
  }

  loadDemo(): void {
    // Implement load demo functionality
    console.log('Load demo clicked');
  }

  exportPng(): void {
    // Implement export functionality
    console.log('Export PNG clicked');
  }

  exportJson(): void {
    // Implement export functionality
    console.log('Export JSON clicked');
  }
}
