import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, query, orderBy, limit, onSnapshot } from '@angular/fire/firestore';

type ViewLog = {
  viewerEmail: string | null;
  viewerUid: string;
  profileName: string;
  createdAt?: any; // Firestore timestamp
};

@Component({
  selector: 'app-admin-logs',
  templateUrl: './admin-logs.component.html',
  styleUrls: ['./admin-logs.component.css'],
})
export class AdminLogsComponent implements OnInit, OnDestroy {
  logs: ViewLog[] = [];
  loading = true;
  private unsub?: () => void;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    const q = query(
      collection(this.firestore, 'viewLogs'),
      orderBy('createdAt', 'desc'),
      limit(200)
    );

    this.unsub = onSnapshot(
      q,
      (snap) => {
        this.logs = snap.docs.map((d) => d.data() as ViewLog);
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.unsub) this.unsub();
  }

  formatTime(ts: any): string {
    try {
      const date = ts?.toDate ? ts.toDate() : null;
      return date ? date.toLocaleString() : '';
    } catch {
      return '';
    }
  }
}
