import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  output,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { UserDelegationService } from '@features/settings-management/delegation-management/services/user-delegation.service';
import {
  managedUserIds,
  managesOtherUsers,
  withManagedUserInclude,
} from '@features/settings-management/delegation-management/utils/managed-users.util';
import { IUserDelegationManagedUserDto } from '@features/settings-management/delegation-management/types/user-delegation.dto';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants';
import { FormService } from '@shared/services';
import { EFilingTarget, IInputFieldsConfig } from '@shared/types';

@Component({
  selector: 'app-filing-target',
  imports: [InputFieldComponent],
  templateUrl: './filing-target.component.html',
  styleUrl: './filing-target.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilingTargetComponent implements OnInit {
  private readonly userDelegationService = inject(UserDelegationService);
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly module = input.required<string>();
  readonly label = input('Filing for');
  readonly selfHint = input('This entry stays on your name');
  readonly otherHint = input('File for someone you manage');
  readonly formGroup = input<FormGroup>();
  readonly employeeField = input<IInputFieldsConfig>();

  /** Colleague id when Other employee is selected. Null means the caller. */
  readonly selectedEmployeeIdChange = output<string | null>();
  readonly targetChange = output<EFilingTarget>();
  readonly canFileForOthersChange = output<boolean>();
  readonly resolvedChange = output<boolean>();

  protected readonly filingTargets = EFilingTarget;
  protected readonly filingTarget = signal<EFilingTarget>(EFilingTarget.SELF);
  protected readonly showChoices = signal(false);
  protected readonly employeeFieldView = signal<IInputFieldsConfig | undefined>(
    undefined
  );
  protected readonly choices = computed(() => [
    {
      label: 'Self',
      value: EFilingTarget.SELF,
      hint: this.selfHint(),
      icon: ICONS.EMPLOYEE.USER,
    },
    {
      label: 'Other employee',
      value: EFilingTarget.OTHER,
      hint: this.otherHint(),
      icon: ICONS.EMPLOYEE.GROUP,
    },
  ]);

  private trackedEmployeeId: Signal<string | null> | null = null;

  ngOnInit(): void {
    this.trackedEmployeeId = this.trackEmployee();
    this.watchSelectedEmployee();
    this.applySavedManagedUsers();
  }

  reset(): void {
    this.applyTarget(EFilingTarget.SELF);
  }

  protected select(target: EFilingTarget): void {
    if (target === this.filingTarget()) {
      return;
    }
    this.applyTarget(target);
  }

  private trackEmployee(): Signal<string | null> | null {
    const formGroup = this.formGroup();
    const fieldName = this.employeeField()?.fieldName;
    if (!formGroup || !fieldName) {
      return null;
    }

    return this.formService.trackFieldChanges<string | null>(
      formGroup,
      fieldName,
      this.destroyRef
    );
  }

  private watchSelectedEmployee(): void {
    effect(
      () => {
        const selected = this.trackedEmployeeId?.() ?? null;
        const employeeId =
          this.filingTarget() === EFilingTarget.OTHER && selected ? selected : null;
        untracked(() => this.selectedEmployeeIdChange.emit(employeeId));
      },
      { injector: this.injector }
    );
  }

  private applySavedManagedUsers(): void {
    const users = this.userDelegationService.managedUsersFor(this.module());
    const allowed = managesOtherUsers(users);
    this.showChoices.set(allowed);
    this.canFileForOthersChange.emit(allowed);
    this.applyEmployeeOptions(users);
    this.resolvedChange.emit(true);
  }

  private applyEmployeeOptions(users: IUserDelegationManagedUserDto[]): void {
    const field = this.employeeField();
    if (!field?.selectConfig) {
      return;
    }

    this.employeeFieldView.set(
      withManagedUserInclude(field, managedUserIds(users, true))
    );
  }

  private applyTarget(target: EFilingTarget): void {
    this.filingTarget.set(target);
    this.targetChange.emit(target);
    const control = this.employeeControl();
    if (!control) {
      return;
    }

    if (target === EFilingTarget.SELF) {
      control.setValue(null);
      control.clearValidators();
    } else {
      control.setValidators([Validators.required]);
    }

    control.updateValueAndValidity();
  }

  private employeeControl() {
    const fieldName = this.employeeField()?.fieldName;
    if (!fieldName) {
      return null;
    }
    return this.formGroup()?.get(fieldName);
  }
}
