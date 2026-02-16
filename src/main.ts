/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

console.log('🚀 APLICACIÓN INICIANDO - main.ts');

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => console.log('✅ APLICACIÓN INICIADA CORRECTAMENTE'))
  .catch(err => console.error('❌ ERROR AL INICIAR APLICACIÓN:', err));
