import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanLoad, Router } from '@angular/router';
import { LoginService } from '../login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardGeneral implements CanActivate {
  constructor(private loginSvc: LoginService, private router: Router) {}

  canActivate(): boolean {
    return this.checkAuth();
  }

  canActivateChild(): boolean {
    return this.checkAuth();
  }

  canLoad(): boolean {
    return this.checkAuth();
  }

  private checkAuth(): boolean {
    if (this.loginSvc.isLoggedIn()) {
      return true;
    } else {
      // Redirect to the login page if the user is not authenticated
      localStorage.removeItem("userToken")
      this.router.navigate(['/login/signin']);
      return false;
    }
  }

}