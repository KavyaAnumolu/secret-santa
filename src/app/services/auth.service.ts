import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
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
    } catch (e) {
      console.error('getRedirectResult error:', e);
    }
  }

  /** iOS in-app browsers (Instagram/WhatsApp/Gmail webview) often break auth redirect state */
  isIosInAppBrowser(): boolean {
    const ua = window.navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
    return isIOS && !isSafari;
  }

  async loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // ✅ On iPhone/iPad: ALWAYS use popup only
  if (isIOS) {
    await signInWithPopup(this.auth, provider);
    return;
  }

  // ✅ Non-iOS: try popup, fallback to redirect
  try {
    await signInWithPopup(this.auth, provider);
    return;
  } catch (err: any) {
    const code = err?.code || '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      code === 'auth/popup-closed-by-user'
    ) {
      await signInWithRedirect(this.auth, provider);
      return;
    }
    throw err;
  }
}


  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
