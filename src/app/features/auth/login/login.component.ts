import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    FloatLabelModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loginForm!: FormGroup;
  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup;

  isLoginMode = true;
  isForgotPassword = false;
  isResetPassword = false;
  showSuccessMessage = false;
  isLoading = false;
  currentYear = new Date().getFullYear();
  
  successTitle = '';
  successMessage = '';

  ngOnInit() {
    this.initializeForms();
  }

  private initializeForms() {
    // Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Forgot Password Form
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Reset Password Form
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom Validators
  private passwordStrengthValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const isValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    return isValid ? null : { passwordStrength: true };
  }

  private passwordMatchValidator(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Form Validation Helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isForgotFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isResetFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  getForgotErrorMessage(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Email is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    return 'Invalid email';
  }

  getResetErrorMessage(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) return 'Password must be at least 8 characters';
    if (field.errors['passwordStrength']) return 'Password must contain uppercase, lowercase, number and special character';
    if (field.errors['passwordMismatch']) return 'Passwords do not match';
    return 'Invalid value';
  }

  // Form Submissions
  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      try {
        // Simulate API call
        await this.delay(2000);
        
        const { email, password, rememberMe } = this.loginForm.value;
        
        // Here you would typically call your authentication service
        console.log('Login attempt:', { email, password, rememberMe });
        
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'Welcome back!'
        });

        // Navigate to dashboard or intended route
        // this.router.navigate(['/dashboard']);
        
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Invalid credentials. Please try again.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      
      try {
        // Simulate API call
        await this.delay(2000);
        
        const { email } = this.forgotPasswordForm.value;
        console.log('Forgot password request:', { email });
        
        this.successTitle = 'Reset Link Sent';
        this.successMessage = `We've sent a password reset link to ${email}. Please check your inbox and follow the instructions.`;
        this.showSuccessMessage = true;
        this.isLoginMode = false;
        this.isForgotPassword = false;
        
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send reset link. Please try again.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onResetPasswordSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      
      try {
        // Simulate API call
        await this.delay(2000);
        
        const { newPassword } = this.resetPasswordForm.value;
        console.log('Password reset:', { newPassword });
        
        this.successTitle = 'Password Reset Successfully';
        this.successMessage = 'Your password has been reset successfully. You can now sign in with your new password.';
        this.showSuccessMessage = true;
        this.isLoginMode = false;
        this.isResetPassword = false;
        
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset password. Please try again.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }

  // Navigation Methods
  toggleForgotPassword() {
    this.isLoginMode = false;
    this.isForgotPassword = true;
    this.isResetPassword = false;
    this.showSuccessMessage = false;
    this.forgotPasswordForm.reset();
  }

  showResetPassword() {
    this.isLoginMode = false;
    this.isForgotPassword = false;
    this.isResetPassword = true;
    this.showSuccessMessage = false;
    this.resetPasswordForm.reset();
  }

  backToLogin() {
    this.isLoginMode = true;
    this.isForgotPassword = false;
    this.isResetPassword = false;
    this.showSuccessMessage = false;
    this.loginForm.reset();
  }

  // Social Login Methods
  async signInWithGoogle() {
    try {
      this.messageService.add({
        severity: 'info',
        summary: 'Google Sign In',
        detail: 'Google authentication would be implemented here'
      });
      // Implement Google OAuth
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'Failed to sign in with Google'
      });
    }
  }

  async signInWithMicrosoft() {
    try {
      this.messageService.add({
        severity: 'info',
        summary: 'Microsoft Sign In',
        detail: 'Microsoft authentication would be implemented here'
      });
      // Implement Microsoft OAuth
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Authentication Error',
        detail: 'Failed to sign in with Microsoft'
      });
    }
  }

  // Utility Methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
