import { inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeMode, ThemeConfig } from '@shared/types';
import { themeConfig } from '@core/config';
import { mixHex } from '@core/config/theme.utils';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'theme';

  // Reactive state
  readonly currentTheme = signal<ThemeMode>('light');
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    const theme: ThemeMode =
      saved === 'dark' || saved === 'light' ? saved : 'light';
    this.setTheme(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    localStorage.setItem(this.STORAGE_KEY, newTheme);
    this.applyTheme(newTheme);
  }

  private setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.isDarkMode.set(theme === 'dark');
  }

  private applyTheme(theme: ThemeMode): void {
    const colors = themeConfig[theme];
    const html = this.document.documentElement;
    const { body } = this.document;
    if (theme === 'dark') {
      html.classList.add('dark-theme');
      body.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
    }
    this.applyColorVariables(html, colors);
    // Remove inline theme set by index.html so CSS variables take over (no stuck inline style)
    html.style.removeProperty('background-color');
    html.style.removeProperty('color');
    if (body) {
      body.style.removeProperty('background-color');
      body.style.removeProperty('color');
    }
  }

  private applyColorVariables(
    root: HTMLElement,
    colors: ThemeConfig['light']
  ): void {
    // Primary: semantic + full shades (50–900) for hover, selected, borders, etc.
    root.style.setProperty('--primary-color', colors.primary.main);
    root.style.setProperty('--primary-light-color', colors.primary.light);
    root.style.setProperty('--primary-dark-color', colors.primary.dark);
    root.style.setProperty('--primary-contrast-color', colors.primary.contrast);

    // Theme-level: paper + primary combo (file entry card, etc.) – use anywhere
    root.style.setProperty(
      '--primary-lightest-color',
      mixHex(colors.background.paper, colors.primary.main, 0.04)
    );
    root.style.setProperty(
      '--primary-darkest-color',
      mixHex(colors.background.paper, colors.primary.main, 0.04)
    );

    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].forEach(key => {
      const value = colors.primary[key as keyof typeof colors.primary];
      if (typeof value === 'string') {
        root.style.setProperty(`--primary-${key}`, value);
      }
    });

    // Surface colors
    Object.entries(colors.surface).forEach(([key, value]) => {
      root.style.setProperty(`--surface-${key}`, value);
    });

    // Text colors
    root.style.setProperty('--text-primary-color', colors.text.primary);
    root.style.setProperty('--text-secondary-color', colors.text.secondary);
    root.style.setProperty('--text-disabled-color', colors.text.disabled);

    // Background colors
    root.style.setProperty(
      '--background-default-color',
      colors.background.default
    );
    root.style.setProperty('--background-paper-color', colors.background.paper);

    // Border colors
    root.style.setProperty('--border-light-color', colors.border.light);
    root.style.setProperty('--border-main-color', colors.border.main);
    root.style.setProperty('--border-dark-color', colors.border.dark);

    // Shadow values
    root.style.setProperty('--shadow-sm', colors.shadow.sm);
    root.style.setProperty('--shadow-md', colors.shadow.md);
    root.style.setProperty('--shadow-lg', colors.shadow.lg);
  }

  // Helper method to get current theme colors
  getCurrentThemeColors(): ThemeConfig['light'] {
    return themeConfig[this.currentTheme()];
  }
}
