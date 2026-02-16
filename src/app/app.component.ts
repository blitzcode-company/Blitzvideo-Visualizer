import { Component } from '@angular/core';
import { ThemeService } from './servicios/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontendVisualizer';

  constructor(private themeService: ThemeService) {
  }
}
