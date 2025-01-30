import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;
    private isLoggedInSignal = signal(false);
    private loggedInState: boolean;

    constructor(private router: Router) {
        this.loggedInState = !!localStorage.getItem('token');
        console.log("API URL: ", this.apiUrl)
    }

    get isLoggedInSignalValue() {
        return this.isLoggedInSignal;
    }

    isAuthenticated(): boolean {
        return this.loggedInState || !!localStorage.getItem('token');
    }

    async login(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.access_token) {
                localStorage.setItem('token', data.access_token); // Store the token
                this.isLoggedInSignal.set(true); // Update the logged-in state
                return true; // Login successful
            }
        } catch (error) {
            console.error('Login failed', error);
        }
        return false; // Login failed
    }

    async signup(email: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data) {
                this.router.navigate(['/']);
                return true; // Signup successful
            }
        } catch (error) {
            console.error('Signup failed:', error);
        }
        return false; // Signup failed
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/']);
        this.isLoggedInSignal.set(false);
        this.loggedInState = false;
        return this.isLoggedInSignal();
    }
}