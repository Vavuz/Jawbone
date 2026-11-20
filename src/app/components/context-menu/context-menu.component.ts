import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {
  @Output() editNode = new EventEmitter<void>();
  @Output() addConnection = new EventEmitter<void>();
  @Output() deleteNode = new EventEmitter<void>();
  @Input() canAddConnection = true;

  onEditNode() {
    this.editNode.emit();
  }
  onAddConnection() {
    this.addConnection.emit();
  }
  onDeleteNode() {
    this.deleteNode.emit();
  }
}