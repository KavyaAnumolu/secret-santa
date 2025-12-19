import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

export type Participant = {
  name?: string;
  email?: string;
  nameLower?: string;
  updatedAt?: number;
  [key: string]: any;
};

@Injectable({ providedIn: 'root' })
export class ParticipantsService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  /** Wait until Firebase Auth has a user (or confirmed no user). */
  private waitForUser(): Promise<User> {
    return new Promise((resolve, reject) => {
      const existing = this.auth.currentUser;
      if (existing) return resolve(existing);

      const unsub = onAuthStateChanged(
        this.auth,
        (u) => {
          unsub();
          if (!u) return reject(new Error('Not authenticated'));
          resolve(u);
        },
        (err) => {
          unsub();
          reject(err);
        }
      );
    });
  }

  /** current user's email (lowercase). Document ID = email. */
  private async getEmail(): Promise<string> {
    const user = await this.waitForUser();
    const email = user.email;
    if (!email) throw new Error('Authenticated user has no email');
    return email.toLowerCase();
  }

  // -------------------------
  // SUBMIT (doc id = email)
  // -------------------------

  async getMyParticipant(): Promise<Participant | null> {
    const email = await this.getEmail();
    const ref = doc(this.firestore, 'participants', email);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as Participant) : null;
  }

  /** Save/update current user's participant (merge). ALWAYS writes nameLower. */
  async saveMyParticipant(data: any): Promise<void> {
    const email = await this.getEmail();
    const ref = doc(this.firestore, 'participants', email);

    const name = (data?.name ?? '').toString().trim();
    const nameLower = name.toLowerCase();

    await setDoc(
      ref,
      {
        ...data,
        email,
        name,
        nameLower,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }

  // -------------------------
  // ANSWERS SEARCH (case-insensitive)
  // -------------------------

  async getParticipantByName(name: string): Promise<Participant | null> {
    const n = (name || '').toString().trim();
    if (!n) return null;

    const nameLower = n.toLowerCase();

    // ✅ Primary: case-insensitive search via nameLower
    const q1 = query(
      collection(this.firestore, 'participants'),
      where('nameLower', '==', nameLower),
      limit(1)
    );
    const snap1 = await getDocs(q1);
    if (!snap1.empty) {
      return snap1.docs[0].data() as Participant;
    }

    // ⚠️ Fallback: exact match on name (old docs only)
    const q2 = query(
      collection(this.firestore, 'participants'),
      where('name', '==', n),
      limit(1)
    );
    const snap2 = await getDocs(q2);
    if (!snap2.empty) {
      const docSnap = snap2.docs[0];
      const data = docSnap.data() as Participant;

      // Optional auto-fix: add nameLower if missing (ignore failures)
      try {
        if (!data?.['nameLower'] && data?.['name']) {
          await updateDoc(docSnap.ref, {
            nameLower: (data['name'] || '').toString().trim().toLowerCase(),
          });
        }
      } catch {}

      return data;
    }

    return null;
  }

  // -------------------------
  // VIEW LOGGING
  // -------------------------

  async logView(viewedName: string): Promise<void> {
    const user = await this.waitForUser();
    const viewerEmail = (user.email || '').toLowerCase();
    const viewerUid = user.uid;

    await addDoc(collection(this.firestore, 'viewLogs'), {
      viewerEmail,
      viewerUid,
      viewedName: (viewedName || '').toString().trim(),
      createdAt: serverTimestamp(),
    });
  }
}
