import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AllowlistService } from '../services/allowList.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AllowlistGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private allowlist: AllowlistService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const user = await firstValueFrom(this.auth.user$);
    if (!user) return this.router.parseUrl('/login');

    const ok = await this.allowlist.isAllowedUser();
    return ok ? true : this.router.parseUrl('/denied');
  }
}
