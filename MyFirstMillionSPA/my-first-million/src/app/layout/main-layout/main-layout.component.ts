import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { CharacterPopupComponent } from '../../shared/character-popup/character-popup.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, CharacterPopupComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <div class="content-area">
        <app-topbar />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <app-character-popup />
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: var(--bg-main);
    }
    @media (max-width: 768px) {
      .main-content { padding: 16px; }
    }
  `]
})
export class MainLayoutComponent {}
