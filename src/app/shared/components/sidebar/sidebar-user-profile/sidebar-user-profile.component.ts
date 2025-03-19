import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../core/services/theme.service';
import { fadeInOut } from '../../../animations/index';
import { SidebarUser } from '../../../models/index';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar-user-profile',
  standalone: true,
  imports: [NgClass],
  templateUrl: './sidebar-user-profile.component.html',
  styleUrls: ['./sidebar-user-profile.component.scss'],
  animations: [fadeInOut]
})
export class SidebarUserProfileComponent {
  private router = inject(Router);
  readonly themeService = inject(ThemeService);

  readonly showUserOptions = signal(false);

  // Demo user data - in a real app, this would come from a user service
  readonly user: SidebarUser = {
    name: 'John Doe',
    designation: 'Software Engineer',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
  };

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

  logout(): void {
    // In a real app, call auth service logout method
    this.router.navigate(['/login']);
  }
} 