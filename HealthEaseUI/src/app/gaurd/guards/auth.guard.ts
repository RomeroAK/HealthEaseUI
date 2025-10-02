import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../../services/authService/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Check if route requires specific role
      const expectedRole = route.data?.role;
      const currentUserRole = this.authService.getUserType();
      if (expectedRole && currentUserRole?.toLowerCase() !== expectedRole.toLowerCase()) {
        // Redirect to appropriate dashboard
        this.redirectToDashboard();
        return false;
      }
      return true;
    }

    // Not logged in, redirect to login page
    // tslint:disable-next-line:no-debugger
    console.log('login redirect 4');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  private redirectToDashboard(): void {
    const userType = this.authService.getUserType();
    switch (userType?.toLowerCase()) {
      case 'patient':
        console.log('login redirect 1');
        this.router.navigate(['/patient-dashboard']);
        break;
      case 'doctor':
        console.log('login redirect 2');
        this.router.navigate(['/doctor-dashboard']);
        break;
      default:
        // tslint:disable-next-line:no-debugger
        debugger;
        console.log('login redirect 3');
        this.router.navigate(['/login']);
    }
  }
}
