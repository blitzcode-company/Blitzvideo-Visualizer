import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  temaActual = signal<'light' | 'dark' | 'auto'>('auto');

  private readonly STORAGE_KEY = 'tema';

  constructor() {
    this.cargarTemaGuardado();

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', this.onSystemThemeChange.bind(this));
    }

    effect(() => {
      this.aplicarTema();
    });
  }

  private cargarTemaGuardado() {
    const guardado = localStorage.getItem(this.STORAGE_KEY);

    if (guardado === 'light' || guardado === 'dark' || guardado === 'auto') {
      this.temaActual.set(guardado as 'light' | 'dark' | 'auto');
    } else {
      this.temaActual.set('auto');
    }

    this.aplicarTema();
  }

  setTema(tema: 'light' | 'dark' | 'auto') {
    this.temaActual.set(tema);
    localStorage.setItem(this.STORAGE_KEY, tema);
  }

  getTema() {
    return this.temaActual();
  }

  private onSystemThemeChange = (e: MediaQueryListEvent) => {
    if (this.temaActual() === 'auto') {
      this.aplicarTema();
    }
  };

  private aplicarTema() {
    const tema = this.temaActual();
    const isDark = tema === 'dark' || 
                   (tema === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const root = document.documentElement;

    root.classList.remove('light-theme', 'dark-theme');

    root.classList.add(isDark ? 'dark-theme' : 'light-theme');

    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  // Bonus: método para toggle rápido (útil en botones simples)
  toggle() {
    const nuevo = this.temaActual() === 'dark' ? 'light' : 'dark';
    this.setTema(nuevo);
  }
}