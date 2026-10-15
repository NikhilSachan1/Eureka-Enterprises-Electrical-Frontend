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
export type ExpenseEntryMode = 'add' | 'force' | 'reimburse';

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

  protected prompt(): string {
    if (this.mode() === 'force') {
      return 'What are you forcing?';
    }
    if (this.mode() === 'reimburse') {
      return 'What are you reimbursing?';
    }
    return 'What are you adding?';
  }

  protected showSwitch(): boolean {
    return this.canOpenExpense() && this.canOpenFuel();
  }

  protected select(kind: ExpenseEntryKind): void {
    if (kind === this.active()) {
      return;
    }

    void this.routerNavigationService.navigateToRoute(this.routeFor(kind));
  }

  private routeFor(kind: ExpenseEntryKind): string[] {
    if (kind === 'fuel') {
      const step =
        this.mode() === 'force'
          ? ROUTES.FUEL.FORCE
          : this.mode() === 'reimburse'
            ? ROUTES.FUEL.REIMBURSEMENT
            : ROUTES.FUEL.ADD;
      return [ROUTE_BASE_PATHS.TRANSPORT, ROUTE_BASE_PATHS.FUEL, step];
    }

    const step =
      this.mode() === 'force'
        ? ROUTES.EXPENSE.FORCE
        : this.mode() === 'reimburse'
          ? ROUTES.EXPENSE.REIMBURSE
          : ROUTES.EXPENSE.ADD;
    return [ROUTE_BASE_PATHS.EXPENSE, step];
  }

  private canOpenExpense(): boolean {
    const permission =
      this.mode() === 'force'
        ? APP_PERMISSION.EXPENSE.FORCE
        : this.mode() === 'reimburse'
          ? APP_PERMISSION.EXPENSE.REIMBURSE
          : APP_PERMISSION.EXPENSE.ADD;
    return this.appPermissionService.hasPermission(permission);
  }

  private canOpenFuel(): boolean {
    const permission =
      this.mode() === 'force'
        ? APP_PERMISSION.FUEL_EXPENSE.FORCE
        : this.mode() === 'reimburse'
          ? APP_PERMISSION.FUEL_EXPENSE.REIMBURSE
          : APP_PERMISSION.FUEL_EXPENSE.ADD;
    return this.appPermissionService.hasPermission(permission);
  }
}
