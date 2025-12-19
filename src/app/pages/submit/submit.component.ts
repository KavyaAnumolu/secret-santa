import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ParticipantsService } from '../../services/participants.service';

type StepId = 'basics' | 'food' | 'interests' | 'comfort' | 'style' | 'random';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.css']
})
export class SubmitComponent {
  form: FormGroup;
  loading = false;

  stepIndex = 0;

  // swipe handling
  private startX: number | null = null;

  // 90% rule
  threshold = 0.8;

  steps: { id: StepId; title: string; subtitle: string; icon: string; themeClass: string; keys: string[] }[] = [
    {
      id: 'basics',
      title: 'Basics',
      subtitle: 'Start with the essentials',
      icon: 'person_outline',
      themeClass: 'theme-basics',
      keys: ['name', 'birthday', 'favoriteColor', 'favoriteSnack', 'favoriteDrink'],
    },
    {
      id: 'food',
      title: 'Food & Treats',
      subtitle: 'Snacks matter 😄',
      icon: 'restaurant_menu',
      themeClass: 'theme-food',
      keys: ['sweetOrSalty', 'favoriteCandy', 'favoriteDessert', 'favoriteFastFood', 'foodAllergies'],
    },
    {
      id: 'interests',
      title: 'Fun & Interests',
      subtitle: 'What you love doing',
      icon: 'interests',
      themeClass: 'theme-interests',
      keys: ['favoriteMovie', 'favoriteTV', 'favoriteMusic', 'hobbies', 'obsession'],
    },
    {
      id: 'comfort',
      title: 'Comfort & Vibes',
      subtitle: 'Your cozy preferences',
      icon: 'self_improvement',
      themeClass: 'theme-comfort',
      keys: ['cozyOrOut', 'coffeeOrTea', 'morningOrNight', 'favoriteScent', 'favoriteSeason'],
    },
    {
      id: 'style',
      title: 'Style & Aesthetic',
      subtitle: 'Your vibe',
      icon: 'style',
      themeClass: 'theme-style',
      keys: ['goToOutfit', 'favoriteAccessory', 'favoriteStore', 'casualOrDressy', 'favoriteEmoji'],
    },
    {
      id: 'random',
      title: 'Random',
      subtitle: 'Fun extras ✨',
      icon: 'emoji_nature',
      themeClass: 'theme-random',
      keys: ['favoriteAnimal', 'favoriteQuote', 'smallJoy', 'needMoreOf', 'dreamGift'],
    },
  ];

  constructor(
    private fb: FormBuilder,
    private participantsService: ParticipantsService
  ) {
    this.form = this.fb.group({
      // Basics
      name: [''],
      birthday: [''],
      favoriteColor: [''],
      favoriteSnack: [''],
      favoriteDrink: [''],

      // Food & Treats
      sweetOrSalty: [''],
      favoriteCandy: [''],
      favoriteDessert: [''],
      favoriteFastFood: [''],
      foodAllergies: [''],

      // Fun & Interests
      favoriteMovie: [''],
      favoriteTV: [''],
      favoriteMusic: [''],
      hobbies: [''],
      obsession: [''],

      // Comfort & Vibes
      cozyOrOut: [''],
      coffeeOrTea: [''],
      morningOrNight: [''],
      favoriteScent: [''],
      favoriteSeason: [''],

      // Style & Aesthetic
      goToOutfit: [''],
      favoriteAccessory: [''],
      favoriteStore: [''],
      casualOrDressy: [''],
      favoriteEmoji: [''],

      // Random
      favoriteAnimal: [''],
      favoriteQuote: [''],
      smallJoy: [''],
      needMoreOf: [''],
      dreamGift: [''],
    });
  }

  get currentStep() {
    return this.steps[this.stepIndex];
  }

  /** count how many fields are filled in current step */
  filledCount(keys: string[]): number {
    const v = this.form.value;
    return keys.reduce((acc, k) => {
      const val = (v?.[k] ?? '').toString().trim();
      return acc + (val.length > 0 ? 1 : 0);
    }, 0);
  }
  totalCount(keys: string[]): number {
  return keys.length;
}


  /** minimum required to pass 90% (round UP) */
  requiredCount(keys: string[]): number {
    return Math.ceil(keys.length * this.threshold);
  }

  /** Next allowed when filled >= required */
  canGoNext(): boolean {
    // Always require NAME to be filled (even if 90% would pass)
    const nameOk = (this.form.value.name ?? '').toString().trim().length > 0;
    if (!nameOk) return false;

    const keys = this.currentStep.keys;
    return this.filledCount(keys) >= this.requiredCount(keys);
  }

  next() {
    if (!this.canGoNext()) return;
    if (this.stepIndex < this.steps.length - 1) this.stepIndex++;
  }

  back() {
    if (this.stepIndex > 0) this.stepIndex--;
  }

  async save() {
    if (!this.canGoNext()) return;

    const name = (this.form.value.name || '').toString().trim();
    if (!name) {
      alert('Please enter your name / nickname');
      this.stepIndex = 0;
      return;
    }

    try {
      this.loading = true;
      await this.participantsService.saveParticipant(name, this.form.value);
      alert('Saved successfully 🎉');
    } catch (e) {
      console.error(e);
      alert('Something went wrong');
    } finally {
      this.loading = false;
    }
  }

  // --- Swipe support obeys same rule ---
  onTouchStart(ev: TouchEvent) {
    this.startX = ev.touches?.[0]?.clientX ?? null;
  }

  onTouchEnd(ev: TouchEvent) {
    if (this.startX === null) return;
    const endX = ev.changedTouches?.[0]?.clientX ?? this.startX;
    const dx = endX - this.startX;
    this.startX = null;

    if (Math.abs(dx) < 60) return;

    if (dx < 0) this.next();
    else this.back();
  }
}
