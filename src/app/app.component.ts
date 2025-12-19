import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})


export class AppComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    // ✅ completes redirect sign-in on iOS / web
    await this.auth.initRedirectResult();

    // Optional: auto-route based on auth state after redirect completes
    const user = await firstValueFrom(this.auth.user$);
    if (user && this.router.url === '/login') {
      await this.router.navigateByUrl('/submit');
    }
  }

  isAdmin(uid: string | undefined | null): boolean {
    return !!uid && uid === environment.adminUid;
  }

  async login() {
  try {
    await this.auth.loginWithGoogle();
    const user = await firstValueFrom(this.auth.user$);
    if (user) await this.router.navigateByUrl('/submit');
  } catch (e: any) {
    alert(e?.message || 'Login failed');
  }
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
