import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-messages',
  imports: [],
  templateUrl: './empty-messages.component.html',
  styleUrl: './empty-messages.component.scss'
})
export class EmptyMessagesComponent {

  icon = input<string>('');
  title = input.required<string>();
  description = input<string>();
}
