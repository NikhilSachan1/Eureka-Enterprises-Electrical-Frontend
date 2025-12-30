import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { PopoverModule, Popover } from 'primeng/popover';

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [PopoverModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleSwitcherComponent {
  @ViewChild('rolePopover') rolePopover!: Popover;

  /** List of available roles for the user */
  readonly roles = input.required<UserRole[]>();

  /** Currently active role */
  readonly activeRole = input.required<UserRole>();

  /** Emits when user selects a different role */
  readonly roleChange = output<UserRole>();

  togglePopover(event: Event): void {
    this.rolePopover.toggle(event);
  }

  selectRole(role: UserRole): void {
    if (role.id !== this.activeRole().id) {
      this.roleChange.emit(role);
    }
    this.rolePopover.hide();
  }
}
