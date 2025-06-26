import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm: FormGroup;

  constructor() {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      verifyPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const verifyPassword = form.get('verifyPassword')?.value;
    return password === verifyPassword ? null : { mismatch: true };
  }

  async onSubmit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;

      try {
        const signupSuccess = await this.authService.signup(email, password);

        if (signupSuccess) {
          this.router.navigate(['/login']);
        } else {
          console.error('Signup failed');
        }
      } catch (error) {
        console.error('Signup failed', error);
      }
    }
  }
}