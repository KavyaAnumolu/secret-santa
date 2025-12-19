import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, query, orderBy, limit, onSnapshot } from '@angular/fire/firestore';

type ViewLog = {
  viewerEmail?: string;
  viewerUid?: string;
  viewedName?: string;
  createdAt?: any; // Firestore Timestamp
};

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css']
})
export class AdminLogsComponent implements OnInit, OnDestroy {
  loading = true;
  logs: (ViewLog & { id: string })[] = [];

  private unsub: (() => void) | null = null;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    const ref = collection(this.firestore, 'viewLogs');
    const q = query(ref, orderBy('createdAt', 'desc'), limit(200));

    this.unsub = onSnapshot(
      q,
      (snap) => {
        this.logs = snap.docs.map(d => ({ id: d.id, ...(d.data() as ViewLog) }));
        this.loading = false;
      },
      (err) => {
        console.error('Failed to load logs', err);
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.unsub) this.unsub();
  }

  formatTime(ts: any): string {
    try {
      // Firestore Timestamp -> Date
      const d: Date = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString();
    } catch {
      return '';
    }
  }

  rowTitle(l: ViewLog): string {
    const who = (l.viewerEmail || 'Unknown user').toString();
    const whom = (l.viewedName || 'Unknown profile').toString();
    return `${who} revealed ${whom}`;
  }
}
