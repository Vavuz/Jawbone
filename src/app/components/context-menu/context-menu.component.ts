import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {
  @Output() editNode = new EventEmitter<void>();

  onEditNode() {
    this.editNode.emit();
  }
}