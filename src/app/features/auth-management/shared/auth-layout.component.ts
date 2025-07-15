import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';
import { EButtonSize } from '@shared/types';
import { IButtonConfig } from '@shared/models';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [
    ButtonComponent
  ],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
  EButtonSize = EButtonSize;

  // Input properties for customization
  title = input.required<string>();
  subtitle = input.required<string>();
  footerText = input.required<string>();
  footerLinkButton = input.required<Partial<IButtonConfig>>();
  footerLinkAction = output<void>();
} 