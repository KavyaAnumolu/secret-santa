import { Component } from '@angular/core';
import { ParticipantsService } from '../../services/participants.service';

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.css']
})
export class AnswersComponent {
  name = '';
  loading = false;
  notFound = false;

  data: any | null = null;

  flipped: Record<string, boolean> = {};

  // ✅ sound (local asset). Put file in: src/assets/sounds/flip.mp3
  private flipAudio = new Audio('assets/flipping.mp3');

  sections = [
    {
      id: 'basics',
      title: 'Basics',
      icon: 'person_outline',
      fields: [
        { key: 'birthday', label: 'Birthday / Zodiac' },
        { key: 'favoriteColor', label: 'Favorite color' },
        { key: 'favoriteSnack', label: 'Favorite snack' },
        { key: 'favoriteDrink', label: 'Favorite drink' },
      ],
    },
    {
      id: 'food',
      title: 'Food & Treats',
      icon: 'restaurant_menu',
      fields: [
        { key: 'sweetOrSalty', label: 'Sweet or salty?' },
        { key: 'favoriteCandy', label: 'Favorite candy' },
        { key: 'favoriteDessert', label: 'Favorite dessert' },
        { key: 'favoriteFastFood', label: 'Favorite fast food' },
        { key: 'foodAllergies', label: 'Allergies / dislikes' },
      ],
    },
    {
      id: 'interests',
      title: 'Fun & Interests',
      icon: 'interests',
      fields: [
        { key: 'favoriteMovie', label: 'Favorite movie / genre' },
        { key: 'favoriteTV', label: 'Favorite TV show' },
        { key: 'favoriteMusic', label: 'Favorite music' },
        { key: 'hobbies', label: 'Hobbies' },
        { key: 'obsession', label: 'Obsessed with lately' },
      ],
    },
    {
      id: 'comfort',
      title: 'Comfort & Vibes',
      icon: 'self_improvement',
      fields: [
        { key: 'cozyOrOut', label: 'Cozy night in or going out?' },
        { key: 'coffeeOrTea', label: 'Coffee or tea?' },
        { key: 'morningOrNight', label: 'Morning person or night owl?' },
        { key: 'favoriteScent', label: 'Favorite scent' },
        { key: 'favoriteSeason', label: 'Favorite season' },
      ],
    },
    {
      id: 'style',
      title: 'Style & Aesthetic',
      icon: 'style',
      fields: [
        { key: 'goToOutfit', label: 'Go-to outfit' },
        { key: 'favoriteAccessory', label: 'Favorite accessory' },
        { key: 'favoriteStore', label: 'Favorite store / brand' },
        { key: 'casualOrDressy', label: 'Casual or dressy?' },
        { key: 'favoriteEmoji', label: 'Favorite emoji' },
      ],
    },
    {
      id: 'random',
      title: 'Random',
      icon: 'auto_awesome',
      fields: [
        { key: 'introvertOrExtrovert', label: 'Introvert or extrovert?' },
        { key: 'favoriteCartoonCharacter', label: 'Favorite cartoon/anime character' },
        { key: 'favoriteCartoonShow', label: 'Favorite cartoon/anime show' },
        { key: 'favoriteVacationSpot', label: 'Dream vacation destination' },
        { key: 'personalityIn3Words', label: 'Personality in 3 words' },
        { key: 'currentlyLearning', label: 'Currently learning' },
        { key: 'favoriteSong', label: 'Favorite song' },
        { key: 'favoriteQuote', label: 'Favorite quote' },
        { key: 'smallJoy', label: 'Small thing that makes you happy' },
        { key: 'needMoreOf', label: 'Always need more of' },
        { key: 'dreamGift', label: 'Dream gift' },
      ],
    },
  ];

  constructor(private participantsService: ParticipantsService) {
    // iOS/Safari: allow sound on user gesture
    this.flipAudio.volume = 0.6;
  }

  async search() {
    const n = (this.name || '').toString().trim();
    if (!n) return;

    this.loading = true;
    this.notFound = false;
    this.data = null;

    try {
      // ✅ case-insensitive now because service uses nameLower
      const result = await this.participantsService.getParticipantByName(n);

      if (!result) {
        this.notFound = true;
        return;
      }

      this.data = result;

      // reset flip states
      this.flipped = {};
      for (const s of this.sections) this.flipped[s.id] = false;

      // log view
      await this.participantsService.logView(this.data.name || n);
    } catch (e) {
      console.error(e);
      this.notFound = true;
    } finally {
      this.loading = false;
    }
  }

  private playFlipSound() {
    try {
      this.flipAudio.currentTime = 0;
      void this.flipAudio.play();
    } catch {}
  }

  toggleSection(id: string) {
    this.flipped[id] = !this.flipped[id];
    this.playFlipSound();
  }

  isFlipped(id: string) {
    return !!this.flipped[id];
  }

  sectionHasAny(id: string): boolean {
    if (!this.data) return false;
    const sec = this.sections.find(s => s.id === id);
    if (!sec) return false;
    return sec.fields.some(f => ((this.data?.[f.key] ?? '').toString().trim().length > 0));
  }

  filledCount(id: string): string {
    if (!this.data) return '';
    const sec = this.sections.find(s => s.id === id);
    if (!sec) return '';
    const filled = sec.fields.filter(f => (this.data?.[f.key] ?? '').toString().trim().length > 0).length;
    return `${filled}/${sec.fields.length}`;
  }
}
