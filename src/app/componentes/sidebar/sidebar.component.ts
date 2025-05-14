import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() status: any;
  @Input() usuarioConCanal: any;
  @Input() idCanal: number | undefined;
  @Input() canales: any[] = [];

}
