import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.user$.pipe(
      map(user => {
        if (!user) return this.router.parseUrl('/login');
        return user.uid === environment.adminUid ? true : this.router.parseUrl('/submit');
      })
    );
  }
}
