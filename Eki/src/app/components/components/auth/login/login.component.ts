import {Component, OnInit} from '@angular/core';
import {error} from 'protractor';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../../services/authService/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectToDashboard();
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.redirectTo) {
          // Use the redirectTo from backend response
          console.log('Routing to:', [response.user?.role, response.redirectTo].join('/'));
          this.router.navigate([
            response.user?.role?.toLowerCase(),
            response.redirectTo
          ]);
        } else if (response.success) {
          // Fallback redirect if no redirectTo specified
          this.redirectBasedOnUser();
        } else {
          this.error = response.message || 'Login failed';
        }
      },
      error: (error): void => {
        this.loading = false;
        this.error = error.error?.message || 'An error occurred during login';
        console.error('Login error:', error);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/patient/patient-profile-setup']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  private redirectToDashboard(): void {
    const userType = this.authService.getUserType()?.toLowerCase();
    switch (userType) {
      case 'patient':
        this.router.navigate([userType,'/patient-dashboard']);
        break;
      case 'doctor':
        this.router.navigate([userType,'/doctor-dashboard']);
        break;
      case 'admin':
        this.router.navigate([userType,'/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private redirectBasedOnUser(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if profile is completed
    if (!currentUser.profileCompleted) {
      // Redirect to profile setup
      if (currentUser.role === 'patient') {
        this.router.navigate(['/patient-profile-setup']);
      } else if (currentUser.role === 'doctor') {
        this.router.navigate(['/doctor-profile-setup']);
      }
    } else {
      // Profile completed, go to dashboard
      if (currentUser.role === 'patient') {
        this.router.navigate(['/patient-dashboard']);
      } else if (currentUser.role === 'doctor') {
        this.router.navigate(['/doctor-dashboard']);
      } else {
        this.router.navigate(['/admin-dashboard']);
      }
    }
  }
}
