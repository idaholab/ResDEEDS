import { ApplicationConfig, provideZoneChangeDetection, PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { LOCAL_STORAGE } from './tokens';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ConfigService } from './services/config-service';
import { DashService } from './services/dashboard-service';
import { AuthService } from './services/auth-service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import { LoginService } from './services/login.service';

export const appConfig: ApplicationConfig = {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }), 
      provideRouter(routes),
      provideClientHydration(),
      provideAnimations(),
      ConfigService,
      AuthService,      
      DashService,
      LoginService,
      provideHttpClient(withFetch()),
      ReactiveFormsModule,
      {
        provide: LOCAL_STORAGE,
        useFactory: (platformId: object) => {
        if (isPlatformServer(platformId)) {
          return {}; // Return an empty object on the server
        }
        return localStorage; // Use the browser's localStorage
        },
        deps: [PLATFORM_ID],
      },
    ]
};
