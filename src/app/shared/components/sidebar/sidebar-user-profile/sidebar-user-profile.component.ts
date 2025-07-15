import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '@core/services';
import { fadeInOut } from '@shared/animations';
import { UserOption } from '@shared/models';
import { NgClass } from '@angular/common';
import { primaryUserOptions, secondaryUserOptions } from '@core/config';
import { AuthService } from '@features/auth-management/services/auth.service';

@Component({
  selector: 'app-sidebar-user-profile',
  imports: [NgClass],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  animations: [fadeInOut]
})
export class SidebarUserProfileComponent {
  private router = inject(Router);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);

  readonly user = computed(() => this.authService.user());  
  readonly userAvatar = computed(() => this.authService.loggedInUserAvatar());
  

  readonly showUserOptions = signal(false);

  // User options from configuration
  readonly primaryOptions = primaryUserOptions;
  readonly secondaryOptions = secondaryUserOptions;

  // Dynamic properties
  getThemeIcon(): string {
    return this.themeService.isDarkMode() ? 'pi-sun' : 'pi-moon';
  }

  getThemeLabel(): string {
    return this.themeService.isDarkMode() ? 'Light Mode' : 'Dark Mode';
  }

  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-options') && !target.matches('img')) {
      this.showUserOptions.set(false);
    }
  }

  toggleUserOptions(): void {
    this.showUserOptions.update(v => !v);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.showUserOptions.set(false);
  }

  async logout(): Promise<void> {
    this.showUserOptions.set(false);
    await this.authService.logout();
  }
  
  // Method to handle option click
  handleOptionClick(option: UserOption): void {
    if (option.id === 'theme') {
      this.toggleTheme();
    } else if (option.id === 'logout') {
      this.logout();
    } else if (option.path) {
      this.navigateTo(option.path);
    }
  }
} 