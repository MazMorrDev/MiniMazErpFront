import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { tokenInterceptor } from './interceptors/token-interceptor';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideHttpClient(
      withFetch(),
      withInterceptors([tokenInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
