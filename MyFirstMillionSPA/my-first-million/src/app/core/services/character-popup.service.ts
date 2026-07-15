import { Injectable, signal } from '@angular/core';

export type Character = 'ralphao' | 'amelinha';

export interface CharacterPopup {
  character: Character;
  message: string;
  goalImpact: number;
  goalLabel: string;
}

const RALPHAO_MESSAGES = [
  'Isso aí! Tá chegando mais perto do milhão! 💰',
  'Desconto não é desperdício! Planejamento é tudo! 📊',
  'Café sem frescura e foco no objetivo! ☕',
  'Planeja, poupa e investe. Esse é o caminho! ✅',
  'Cada real economizado é um passo a mais para a liberdade! 📈',
  'Esse aporte vai fazer diferença nos juros compostos! 🎯',
];

const AMELINHA_MESSAGES = [
  'Ih, Ameliei... Mas a vida é agora, bora recuperar depois! 💳',
  'Não é gasto, é investimento em mim! (O objetivo vai sentir...) 🛍️',
  'A vida é curta, mas o objetivo também precisa viver! 🌸',
  'Comprei e fui feliz! O Ralphão vai reclamar, mas tudo bem! 😅',
  'Não foi caro, foi investimento em mim! (O objetivo discorda...) 👛',
  'Essa foi grande, viu? Mas próximo mês a gente compensa! 🎀',
];

@Injectable({ providedIn: 'root' })
export class CharacterPopupService {
  readonly popup = signal<CharacterPopup | null>(null);

  showRalphao(goalImpact: number, goalLabel = 'meta de poupança') {
    const msg = RALPHAO_MESSAGES[Math.floor(Math.random() * RALPHAO_MESSAGES.length)];
    this.popup.set({ character: 'ralphao', message: msg, goalImpact, goalLabel });
    setTimeout(() => this.dismiss(), 6000);
  }

  showAmelinha(goalImpact: number, goalLabel = 'meta de poupança') {
    const msg = AMELINHA_MESSAGES[Math.floor(Math.random() * AMELINHA_MESSAGES.length)];
    this.popup.set({ character: 'amelinha', message: msg, goalImpact, goalLabel });
    setTimeout(() => this.dismiss(), 7000);
  }

  triggerForTransaction(type: 'Income' | 'Expense', amount: number, isLarge = false) {
    if (type === 'Income') {
      this.showRalphao(amount);
    } else if (isLarge || amount >= 200) {
      this.showAmelinha(-amount);
    } else {
      this.showRalphao(-amount);
    }
  }

  dismiss() {
    this.popup.set(null);
  }
}
