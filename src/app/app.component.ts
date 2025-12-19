import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  isAdmin(uid: string | undefined | null): boolean {
    return !!uid && uid === environment.adminUid;
  }

  async login() {
    await this.auth.loginWithGoogle();
    // after login, go to submit
    await this.router.navigateByUrl('/submit');
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  async goHome() {
    const user = await firstValueFrom(this.auth.user$);
    await this.router.navigateByUrl(user ? '/submit' : '/login');
  }
}
