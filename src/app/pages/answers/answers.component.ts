import { Component } from '@angular/core';
import { ParticipantsService } from '../../services/participants.service';

type SectionKey =
  | 'basics'
  | 'food'
  | 'interests'
  | 'comfort'
  | 'style'
  | 'random';

type Field = { label: string; key: string };

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

  /** MULTI-OPEN FLIP CARDS */
  openSections = new Set<SectionKey>();

  /** SOFT FLIP SOUND */
  private audioCtx: AudioContext | null = null;

  /** SECTIONS USED BY THE TEMPLATE */
  sections: {
    id: SectionKey;
    title: string;
    icon: string;
    fields: Field[];
  }[] = [
    {
      id: 'basics',
      title: 'Basics',
      icon: 'person_outline',
      fields: [
        { label: 'Birthday / Zodiac', key: 'birthday' },
        { label: 'Favorite color', key: 'favoriteColor' },
        { label: 'Favorite snack', key: 'favoriteSnack' },
        { label: 'Favorite drink', key: 'favoriteDrink' },
      ],
    },
    {
      id: 'food',
      title: 'Food & Treats',
      icon: 'restaurant_menu',
      fields: [
        { label: 'Sweet or salty', key: 'sweetOrSalty' },
        { label: 'Candy', key: 'favoriteCandy' },
        { label: 'Dessert', key: 'favoriteDessert' },
        { label: 'Fast food', key: 'favoriteFastFood' },
        { label: 'Allergies / dislikes', key: 'foodAllergies' },
      ],
    },
    {
      id: 'interests',
      title: 'Fun & Interests',
      icon: 'interests',
      fields: [
        { label: 'Movies', key: 'favoriteMovie' },
        { label: 'TV Show', key: 'favoriteTV' },
        { label: 'Music', key: 'favoriteMusic' },
        { label: 'Hobbies', key: 'hobbies' },
        { label: 'Obsessed with', key: 'obsession' },
      ],
    },
    {
      id: 'comfort',
      title: 'Comfort & Vibes',
      icon: 'self_improvement',
      fields: [
        { label: 'Cozy Night In or out', key: 'cozyOrOut' },
        { label: 'Coffee or tea', key: 'coffeeOrTea' },
        { label: 'Morning or night', key: 'morningOrNight' },
        { label: 'Scent', key: 'favoriteScent' },
        { label: 'Season', key: 'favoriteSeason' },
      ],
    },
    {
      id: 'style',
      title: 'Style & Aesthetic',
      icon: 'style',
      fields: [
        { label: 'Go-to outfit', key: 'goToOutfit' },
        { label: 'Accessory', key: 'favoriteAccessory' },
        { label: 'Store / brand', key: 'favoriteStore' },
        { label: 'Casual or dressy', key: 'casualOrDressy' },
        { label: 'Favorite emoji', key: 'favoriteEmoji' },
      ],
    },
    {
      id: 'random',
      title: 'Random',
      icon: 'emoji_nature',
      fields: [
        { label: 'Animal', key: 'favoriteAnimal' },
        { label: 'Quote', key: 'favoriteQuote' },
        { label: 'Small joy', key: 'smallJoy' },
        { label: 'Need more of', key: 'needMoreOf' },
        { label: 'Dream gift', key: 'dreamGift' },
      ],
    },
  ];

  constructor(private participantsService: ParticipantsService) {}

  async search() {
    this.loading = true;
    this.notFound = false;
    this.data = null;
    this.openSections.clear();

    const result = await this.participantsService.getParticipantByName(this.name);

    if (!result) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.data = result;
    this.loading = false;
  }

  sectionHasAny(sectionId: SectionKey): boolean {
    const section = this.sections.find((s) => s.id === sectionId);
    if (!section || !this.data) return false;

    return section.fields.some((f) => {
      const v = (this.data?.[f.key] ?? '').toString().trim();
      return v.length > 0;
    });
  }

  filledCount(sectionId: SectionKey): number {
    const section = this.sections.find((s) => s.id === sectionId);
    if (!section || !this.data) return 0;

    return section.fields.reduce((acc, f) => {
      const v = (this.data?.[f.key] ?? '').toString().trim();
      return acc + (v.length > 0 ? 1 : 0);
    }, 0);
  }

  isFlipped(sectionId: SectionKey): boolean {
    return this.openSections.has(sectionId);
  }

  toggleSection(sectionId: SectionKey) {
    this.playFlipSound();

    if (this.openSections.has(sectionId)) {
      this.openSections.delete(sectionId);
    } else {
      this.openSections.add(sectionId);
    }
  }

  private playFlipSound() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore audio failures
    }
  }
}
