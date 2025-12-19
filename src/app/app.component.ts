import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {
    this.auth.user$.subscribe(u => console.log('SIGNED IN AS:', u?.email, 'UID:', u?.uid));

  }

  async login() {
    await this.auth.loginWithGoogle();
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
