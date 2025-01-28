import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5050';
    private isLoggedInSignal = signal(false);

    constructor(private http: HttpClient, private router: Router) { }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    get isLoggedInSignalValue() {
        return this.isLoggedInSignal;
    }

    login(email: string, password: string) {
        return this.http.post(`${this.apiUrl}/api/auth/login/`, { email, password });
    }

    signup(email: string, password: string) {
        return this.http.post(`${this.apiUrl}api/auth/register/`, { email, password });
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/']);
        return this.isLoggedInSignal();
    }
}