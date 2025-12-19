import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css']
})
export class AccessDeniedComponent {
  constructor(public auth: AuthService, private router: Router) {}

  async signOut() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
