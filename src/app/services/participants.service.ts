import { Injectable } from '@angular/core';
import {
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class ParticipantsService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  // Save answers for a person (docId = lowercase name)
  async saveParticipant(name: string, data: any): Promise<void> {
    const id = name.trim().toLowerCase();
    await setDoc(doc(this.firestore, 'participants', id), { ...data, name }, { merge: true });
  }

  // Load answers by name
  async getParticipantByName(name: string): Promise<any | null> {
    const id = name.trim().toLowerCase();
    const snap = await getDoc(doc(this.firestore, 'participants', id));
    return snap.exists() ? snap.data() : null;
  }

  // Log that current signed-in user revealed a profile
  async logView(profileName: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    await addDoc(collection(this.firestore, 'viewLogs'), {
      viewerUid: user.uid,
      viewerEmail: user.email ?? null,
      profileName,
      createdAt: serverTimestamp(),
    });
  }
}
