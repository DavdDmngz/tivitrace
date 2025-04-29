// main-layout.component.ts
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
export class MainLayoutComponent {}
