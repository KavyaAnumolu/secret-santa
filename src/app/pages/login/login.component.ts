import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loading = false;

  constructor(public auth: AuthService) {}

  async signIn() {
    try {
      this.loading = true;
      await this.auth.loginWithGoogle();
    } finally {
      this.loading = false;
    }
  }
}
