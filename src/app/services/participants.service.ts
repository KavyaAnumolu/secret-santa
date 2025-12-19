import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { collection, getDocs, getDoc } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class ParticipantsService {

  constructor(private firestore: Firestore) {}

  async saveParticipant(name: string, data: any) {
    // use name as document id (lowercase, no spaces)
    const id = name.trim().toLowerCase().replace(/\s+/g, '-');

    const ref = doc(this.firestore, 'participants', id);

    await setDoc(ref, {
      ...data,
      updatedAt: new Date()
    });
  }
  async getParticipantByName(name: string) {
  const id = name.trim().toLowerCase().replace(/\s+/g, '-');
  const ref = doc(this.firestore, 'participants', id);

  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

async listParticipantNames(): Promise<string[]> {
  const ref = collection(this.firestore, 'participants');
  const snaps = await getDocs(ref);

  const names: string[] = [];
  snaps.forEach((d) => {
    const data: any = d.data();
    if (data?.name) names.push(data.name);
  });

  // sort alphabetically
  return names.sort((a, b) => a.localeCompare(b));
}

}
