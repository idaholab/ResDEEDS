import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ProjectService } from './services/project.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()), 
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    ProjectService,
  ]
};
