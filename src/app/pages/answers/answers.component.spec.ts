import { Component } from '@angular/core';
import { ParticipantsService } from '../../services/participants.service';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css'],
})
export class AnswersComponent {
  name = '';
  data: any = null;
  loading = false;
  notFound = false;

  // IMPORTANT: your existing sections array must already exist in your project
  // If you already have it, keep it. If not, you can keep your current one.
  sections: any[] = (this as any).sections || [];

  private flipped = new Set<string>();

  constructor(private participantsService: ParticipantsService) {}



  async search() {
  const n = this.name.trim();
  if (!n) return;

  this.loading = true;
  this.notFound = false;
  this.data = null;

  try {
    const result = await this.participantsService.getParticipantByName(n);

    if (!result) {
      this.notFound = true;
      return;
    }

    this.data = result;

    // log view
    await this.participantsService.logView(this.data.name || n);

  } catch (e: any) {
    console.error(e);
    // If permission denied, show a friendly message instead of loading forever
    alert('Access denied. You are not allowed to view answers.');
  } finally {
    this.loading = false;
  }
}


  // Flip helpers
  toggleSection(id: string) {
    if (this.flipped.has(id)) this.flipped.delete(id);
    else this.flipped.add(id);
  }

  isFlipped(id: string) {
    return this.flipped.has(id);
  }

  // These must match your existing section model
  sectionHasAny(id: string): boolean {
    const s = this.sections.find(x => x.id === id);
    if (!s || !this.data) return false;
    return s.fields.some((f: any) => (this.data[f.key] ?? '').toString().trim().length > 0);
  }

  filledCount(id: string): number {
    const s = this.sections.find(x => x.id === id);
    if (!s || !this.data) return 0;
    return s.fields.reduce((acc: number, f: any) => acc + (((this.data[f.key] ?? '').toString().trim().length > 0) ? 1 : 0), 0);
  }
}
