import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CharacterPopupService } from '../../core/services/character-popup.service';

@Component({
  selector: 'app-character-popup',
  standalone: true,
  imports: [CurrencyPipe],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(120%)', opacity: 0 }),
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateY(120%)', opacity: 0 }))
      ])
    ])
  ],
  template: `
    @if (svc.popup(); as popup) {
      <div class="popup-backdrop" (click)="svc.dismiss()">
        <div
          class="popup-card"
          [class.ralphao]="popup.character === 'ralphao'"
          [class.amelinha]="popup.character === 'amelinha'"
          [@slideIn]
          (click)="$event.stopPropagation()"
        >
          <button class="close-btn" (click)="svc.dismiss()">✕</button>

          <div class="character-img-wrap">
            <img
              src="assets/characters/amelinha-ralphao.jpeg"
              [class.show-amelinha]="popup.character === 'amelinha'"
              [class.show-ralphao]="popup.character === 'ralphao'"
              alt="{{ popup.character === 'ralphao' ? 'Ralphão' : 'Amélinha' }}"
            />
          </div>

          <div class="popup-content">
            <div class="character-name">
              @if (popup.character === 'ralphao') {
                <span class="name-ralphao">Ralphão, O Econômico</span>
              } @else {
                <span class="name-amelinha">Amélinha, A Consumista</span>
              }
            </div>

            <p class="popup-message">"{{ popup.message }}"</p>

            <div class="goal-impact" [class.positive]="popup.goalImpact > 0" [class.negative]="popup.goalImpact < 0">
              <span class="impact-icon">{{ popup.goalImpact > 0 ? '📈' : '📉' }}</span>
              <span class="impact-text">
                Impacto na sua {{ popup.goalLabel }}:
                <strong>{{ popup.goalImpact > 0 ? '+' : '' }}{{ popup.goalImpact | currency:'BRL':'symbol':'1.2-2' }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .popup-backdrop {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: flex-end; justify-content: center;
      padding: 24px;
      pointer-events: none;
    }

    .popup-card {
      pointer-events: all;
      display: flex;
      align-items: center;
      gap: 16px;
      border-radius: 20px;
      padding: 16px 20px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      position: relative;
    }

    .popup-card.ralphao {
      background: linear-gradient(135deg, #064E3B, #065F46);
      border: 2px solid #10B981;
    }

    .popup-card.amelinha {
      background: linear-gradient(135deg, #831843, #9D174D);
      border: 2px solid #F472B6;
    }

    .close-btn {
      position: absolute; top: 10px; right: 12px;
      background: none; border: none; color: rgba(255,255,255,0.6);
      cursor: pointer; font-size: 16px; line-height: 1;
      padding: 4px;
    }
    .close-btn:hover { color: white; }

    .character-img-wrap {
      width: 90px; height: 110px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid rgba(255,255,255,0.2);
    }

    .character-img-wrap img {
      height: 100%;
      width: 200%;
      object-fit: cover;
      object-position: left center;
    }

    .character-img-wrap img.show-ralphao {
      object-position: right center;
    }

    .character-img-wrap img.show-amelinha {
      object-position: left center;
    }

    .popup-content { flex: 1; color: white; }

    .character-name { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 6px; text-transform: uppercase; }
    .name-ralphao { color: #6EE7B7; }
    .name-amelinha { color: #FBCFE8; }

    .popup-message {
      font-size: 14px; line-height: 1.5; margin: 0 0 12px;
      color: rgba(255,255,255,0.95);
      font-style: italic;
    }

    .goal-impact {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 10px; padding: 8px 12px;
      font-size: 13px;
    }

    .impact-icon { font-size: 18px; }

    .impact-text { color: rgba(255,255,255,0.85); }
    .impact-text strong { color: white; }

    .goal-impact.positive .impact-text strong { color: #6EE7B7; }
    .goal-impact.negative .impact-text strong { color: #FCA5A5; }

    @media (max-width: 500px) {
      .popup-backdrop { padding: 12px; }
      .character-img-wrap { width: 70px; height: 90px; }
    }
  `]
})
export class CharacterPopupComponent {
  svc = inject(CharacterPopupService);
}
