import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');

        if (token) {
            console.log(this.authService.isTokenExpired(token))
            // Check if the token is expired using the manual decode logic
            if (this.authService.isTokenExpired(token)) {
                this.authService.logout();
                return throwError(() => new Error('Token expired.'));
            }
            // Clone the request to add the Authorization header
            req = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            });
        }

        return next.handle(req).pipe(
            catchError((err: HttpErrorResponse) => {
                // In case of a 401 error response, perform logout
                if (err.status === 401) {
                    this.authService.logout();
                }
                return throwError(() => err);
            })
        );
    }
}