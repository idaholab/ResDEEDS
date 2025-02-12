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
    private tokenKey = "";

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
            const response = await fetch(`${this.apiUrl}/auth/login/`, {
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
            const response = await fetch(`${this.apiUrl}/auth/register/`, {
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

    private decodeToken(token: string): any | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('JWT token format is invalid.');
            }
            const payload = parts[1];
            // The JWT payload is base64url encoded, so convert it to base64 format
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            // Decode the base64 string
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    // Check if the token is expired by decoding it manually
    public isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.expires) {
            // Consider token expired if it cannot be decoded or doesn't have an exp property
            return true;
        }
        // exp is in seconds, so convert to milliseconds
        const expirationDate = new Date(decoded.expires * 1000);
        return expirationDate < new Date();
    }
}