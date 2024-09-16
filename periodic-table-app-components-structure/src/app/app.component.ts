import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { PeriodicTableComponent } from './components/periodic-table/periodic-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, PeriodicTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'periodic-table-app-components-structure';
}
