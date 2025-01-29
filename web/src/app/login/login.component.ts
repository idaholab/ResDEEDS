import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  async onSubmit() {
    const loginSuccess = await this.authService.login(this.email, this.password);
    console.log('loginSuccess', loginSuccess);
    if (loginSuccess) {
      this.router.navigate(['/hello-world']);
    } else {
      this.errorMessage = 'Login failed';
    }
  }
}