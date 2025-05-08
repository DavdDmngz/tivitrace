import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Importación de tus componentes standalone
import { TopbarComponent } from '../layout/topbar/topbar.component';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    TopbarComponent,
    SidebarComponent,
  ],
  templateUrl: './layout.component.html',
})
export class MainLayoutComponent {
  sidebarToggled = false;

  // Método para alternar el estado del sidebar
  toggleSidebar(): void {
    this.sidebarToggled = !this.sidebarToggled;
  }
}
