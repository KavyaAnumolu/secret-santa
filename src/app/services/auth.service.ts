import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  User,
  authState,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  /** Call once on app start to finish redirect sign-in (important for iOS). */
  async initRedirectResult(): Promise<void> {
    try {
      await getRedirectResult(this.auth);
      // If a redirect sign-in happened, user is now signed in.
    } catch (e) {
      // Don’t crash the app; just log
      console.error('getRedirectResult error:', e);
    }
  }

  /** iOS webviews/in-app browsers often break redirect state */
  isIosInAppBrowser(): boolean {
    const ua = window.navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    return isIOS && !isSafari;
  }

  async loginWithGoogle(): Promise<void> {
    // ✅ Helps iOS keep auth stable across refresh
    await setPersistence(this.auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // ✅ Try popup first (best success rate)
    try {
      await signInWithPopup(this.auth, provider);
      return;
    } catch (err: any) {
      const code = err?.code || '';
      console.warn('Popup sign-in failed:', code, err);

      // If user is in an iOS in-app browser, redirect is likely to fail too.
      if (code === 'auth/missing-initial-state' || this.isIosInAppBrowser()) {
        throw new Error(
          'Google login is blocked in this in-app browser on iPhone. Please open this link in Safari (or Chrome) and try again.'
        );
      }

      // Popup blocked/cancelled => fallback to redirect
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/popup-closed-by-user'
      ) {
        await signInWithRedirect(this.auth, provider);
        return;
      }

      // Unknown error -> rethrow
      throw err;
    }
  }

  async logout(): Promise<void> {
    await this.auth.signOut();
  }
}
