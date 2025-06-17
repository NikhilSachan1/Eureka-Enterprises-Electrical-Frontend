import { NgTemplateOutlet } from '@angular/common';
import { Component, input, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
  // Input properties for customization
  title = input<string>('');
  subtitle = input<string>('');
  submitButtonLabel = input<string>('');
  footerText = input<string>('');
  footerLinkText = input<string>('');
  footerLinkAction = input<() => void>();
  onSubmit = input<() => void>();

  // Content projection for form fields
  @ContentChild('formContent') formContent?: TemplateRef<any>;
} 