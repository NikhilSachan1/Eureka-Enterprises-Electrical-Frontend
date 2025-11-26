import { Injectable, signal } from '@angular/core';
// import { DOCUMENT } from '@angular/common';
import { ThemeMode, ThemeConfig } from '@shared/types';
import { themeConfig } from '@core/config';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // private readonly document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'theme';

  // Reactive state
  readonly currentTheme = signal<ThemeMode>('light');
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // const savedTheme = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
    // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // // Use saved preference or system preference
    // const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    // this.setTheme(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    localStorage.setItem(this.STORAGE_KEY, newTheme);
  }

  private setTheme(theme: ThemeMode): void {
    this.currentTheme.set(theme);
    this.isDarkMode.set(theme === 'dark');
    // this.applyTheme(theme);
  }

  // private applyTheme(theme: ThemeMode): void {
  //   // const colors = themeConfig[theme];
  //   // const root = this.document.documentElement;
  //   // Apply theme class to body
  //   // if (theme === 'dark') {
  //   //   this.document.body.classList.add('dark-theme');
  //   // } else {
  //   //   this.document.body.classList.remove('dark-theme');
  //   // }
  //   // Apply CSS variables
  //   // this.applyColorVariables(root, colors);
  // }

  private applyColorVariables(
    root: HTMLElement,
    colors: ThemeConfig['light']
  ): void {
    // Primary colors
    root.style.setProperty('--primary-color', colors.primary.main);
    root.style.setProperty('--primary-light-color', colors.primary.light);
    root.style.setProperty('--primary-dark-color', colors.primary.dark);
    root.style.setProperty('--primary-contrast-color', colors.primary.contrast);

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
