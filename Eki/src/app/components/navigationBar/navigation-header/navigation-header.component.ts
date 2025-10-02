import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import {AuthService} from '../../../services/authService/auth.service';
import {PatientServiceService} from '../../../services/patientProfileService/patient-service.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation-header',
  templateUrl: './navigation-header.component.html',
  styleUrls: ['./navigation-header.component.css'],
  standalone: false
})
export class NavigationHeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  unreadNotifications = 0;
  mobileMenuOpen = false;
  userMenuOpen = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private patientService: PatientServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNotifications();

    // Subscribe to user changes
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCurrentUser(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUser = user;

      // Load user profile data to get profile picture
      this.subscriptions.add(
        this.patientService.getProfile().subscribe({
          next: (response): void => {
            if ( response) {
              this.currentUser = {
                ...this.currentUser,
                firstName: response.firstName,
                lastName: response.lastName
              };
            }
          },
          error: (error): void => {
            console.error('Error loading user profile:', error);
          }
        })
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadNotifications(): void {
    // TODO: Implement notification loading
    // For now, set a placeholder count
    this.unreadNotifications = 3;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  toggleNotifications(): void {
    // TODO: Implement notifications panel
    console.log('Toggle notifications');
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
        // Force logout even if server request fails
  }

  // Close menus when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Close user menu if clicking outside
    if (this.userMenuOpen && !target.closest('.user-menu-dropdown')) {
      this.userMenuOpen = false;
    }

    // Close mobile menu if clicking outside
    if (this.mobileMenuOpen && !target.closest('.nav-menu') && !target.closest('.mobile-menu-toggle')) {
      this.mobileMenuOpen = false;
    }
  }

  // Close mobile menu on window resize
  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 768 && this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }
  // Navigation helpers
  navigateToProfile(): void {
    this.router.navigate(['/patient/profile']);
    this.closeUserMenu();
    this.mobileMenuOpen = false;
  }

  navigateToEditProfile(): void {
    this.router.navigate(['/patient/profile-setup']);
    this.closeUserMenu();
    this.mobileMenuOpen = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/patient/settings']);
    this.closeUserMenu();
    this.mobileMenuOpen = false;
  }

  // Check if user has a complete profile
  get hasCompleteProfile(): boolean {
    return this.currentUser?.firstName &&
      this.currentUser?.lastName &&
      this.currentUser?.email;
  }

  // Get user initials for avatar
  get userInitials(): string {
    if (!this.currentUser) { return ''; }

    const firstInitial = this.currentUser.firstName?.charAt(0) || '';
    const lastInitial = this.currentUser.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  // Check if current route is active
  isRouteActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}

// Update your Angular routing module to include the profile route
// app-routing.module.ts additions:
/*
const routes: Routes = [
  // ... existing routes

  // Patient routes
  {
    path: 'patient',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: PatientDashboardComponent
      },
      {
        path: 'profile',
        component: PatientProfileViewComponent
      },
      {
        path: 'profile-setup',
        component: PatientProfileSetupComponent
      },
      {
        path: 'appointments',
        component: PatientAppointmentsComponent
      },
      {
        path: 'doctors',
        component: FindDoctorsComponent
      },
      {
        path: 'medical-records',
        component: MedicalRecordsComponent
      },
      {
        path: 'prescriptions',
        component: PrescriptionsComponent
      },
      {
        path: 'settings',
        component: PatientSettingsComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // ... other routes
];
*/

// Update your PatientService to include profile download method
// Add this method to PatientService:
/*
downloadProfilePDF(userId: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/patients/${userId}/documents/profile/pdf`, {
    responseType: 'blob'
  });
}
*/

// Update your AuthService to include proper user management
// Add these methods to AuthService:
/*
private currentUserSubject = new BehaviorSubject<any>(null);
public currentUser$ = this.currentUserSubject.asObservable();

getCurrentUser(): any {
  const token = this.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId,
        email: payload.sub,
        userType: payload.userType,
        firstName: payload.firstName,
        lastName: payload.lastName
      };
    } catch (error) {
      return null;
    }
  }
  return null;
}

logout(): Observable<any> {
  return new Observable(observer => {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    observer.next(true);
    observer.complete();
  });
}
*/
