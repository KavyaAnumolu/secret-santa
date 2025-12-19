import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AllowlistService {
  constructor(private fs: Firestore, private authService: AuthService) {}

  async isAllowedUser(): Promise<boolean> {
    try {
      const user = await firstValueFrom(this.authService.user$);
      if (!user) return false;

      // ✅ Admin override always allowed
      if (user.uid === environment.adminUid) return true;

      const email = (user.email || '').trim().toLowerCase();
      if (!email) return false;

      const ref = doc(this.fs, 'allowedUsers', email);
      const snap = await getDoc(ref);
      return snap.exists();
    } catch (e) {
      console.warn('Allowlist check failed:', e);
      return false;
    }
  }
}
