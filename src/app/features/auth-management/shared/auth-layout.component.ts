import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    ButtonModule,
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
  // Input properties for customization
  title = input<string>('');
  subtitle = input<string>('');
  footerText = input<string>('');
  footerLinkText = input<string>('');
  footerLinkAction = output<void>();
} 