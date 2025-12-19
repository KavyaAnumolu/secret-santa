import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnDestroy {
  loading = false;
  private sub: Subscription;

  constructor(public auth: AuthService, private router: Router) {
    // ✅ If already signed in, go straight to app
    this.sub = this.auth.user$.subscribe((u) => {
      if (u) this.router.navigateByUrl('/submit');
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  async signIn() {
    try {
      this.loading = true;
      await this.auth.loginWithGoogle();
      // redirect will happen via subscription
    } finally {
      this.loading = false;
    }
  }
}
