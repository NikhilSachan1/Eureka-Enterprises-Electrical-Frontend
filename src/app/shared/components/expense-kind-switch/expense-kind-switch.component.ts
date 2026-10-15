import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService } from '@core/services';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';

export type ExpenseEntryKind = 'expense' | 'fuel';
export type ExpenseEntryMode = 'add' | 'force';

@Component({
  selector: 'app-expense-kind-switch',
  templateUrl: './expense-kind-switch.component.html',
  styleUrl: './expense-kind-switch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseKindSwitchComponent {
  readonly active = input.required<ExpenseEntryKind>();
  readonly mode = input<ExpenseEntryMode>('add');

  private readonly appPermissionService = inject(AppPermissionService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected readonly ICONS = ICONS;

  protected showSwitch(): boolean {
    return this.canOpenExpense() && this.canOpenFuel();
  }

  protected select(kind: ExpenseEntryKind): void {
    if (kind === this.active()) {
      return;
    }

    const forcing = this.mode() === 'force';
    const route =
      kind === 'fuel'
        ? [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            forcing ? ROUTES.FUEL.FORCE : ROUTES.FUEL.ADD,
          ]
        : [
            ROUTE_BASE_PATHS.EXPENSE,
            forcing ? ROUTES.EXPENSE.FORCE : ROUTES.EXPENSE.ADD,
          ];

    void this.routerNavigationService.navigateToRoute(route);
  }

  private canOpenExpense(): boolean {
    const permission =
      this.mode() === 'force'
        ? APP_PERMISSION.EXPENSE.FORCE
        : APP_PERMISSION.EXPENSE.ADD;
    return this.appPermissionService.hasPermission(permission);
  }

  private canOpenFuel(): boolean {
    const permission =
      this.mode() === 'force'
        ? APP_PERMISSION.FUEL_EXPENSE.FORCE
        : APP_PERMISSION.FUEL_EXPENSE.ADD;
    return this.appPermissionService.hasPermission(permission);
  }
}
