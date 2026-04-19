import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  InputFieldConfigService,
} from '@shared/services';
import {
  ECalendarView,
  EDataType,
  EDateIconDisplay,
  EDateSelectionMode,
  EHourFormat,
  IDialogActionHandler,
} from '@shared/types';
import { transformDateFormat } from '@shared/utility';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import {
  ALLOCATE_DEALLOCATE_EMPLOYEE_FORM_CONFIG,
  ALLOCATE_DEALLOCATE_ROW_EFFECTIVE_DATE_FIELD_OPTIONS,
} from '../../config';
import { ProjectService } from '../../services/project.service';
import {
  IAllocateDeallocateUIFormDto,
  IProjectAllocateDeallocateEmployeeRequestFormDto,
  IProjectAllocateDeallocateEmployeeResponseDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function effectiveDateRequired(
  control: AbstractControl
): ValidationErrors | null {
  const v = control.value;
  if (v === null || v === undefined) {
    return { required: true };
  }
  return v instanceof Date && !Number.isNaN(v.getTime())
    ? null
    : { required: true };
}

@Component({
  selector: 'app-allocate-deallocate-employee',
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    NgClass,
    NgTemplateOutlet,
    DatePickerModule,
    FloatLabelModule,
  ],
  templateUrl: './allocate-deallocate-employee.component.html',
  styleUrl: './allocate-deallocate-employee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocateDeallocateEmployeeComponent
  extends FormBase<IAllocateDeallocateUIFormDto>
  implements OnInit, IDialogActionHandler
{
  protected readonly selectedRecord =
    input.required<IProjectGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly inputFieldConfigService = inject(InputFieldConfigService);

  protected readonly rowEffectiveDateFieldConfig =
    this.inputFieldConfigService.getInputFieldConfig(
      EDataType.DATE,
      ALLOCATE_DEALLOCATE_ROW_EFFECTIVE_DATE_FIELD_OPTIONS
    );

  protected readonly ALL_DATE_ICON_DISPLAY_TYPES = EDateIconDisplay;
  protected readonly ALL_DATE_SELECTION_MODES = EDateSelectionMode;
  protected readonly ALL_CALENDAR_VIEWS = ECalendarView;
  protected readonly ALL_HOUR_FORMATS = EHourFormat;

  readonly actionsForm = this.fb.group({
    /** Selected employees already on project — UI only; not sent as new allocations. */
    currentTeam: this.fb.array<FormGroup>([]),
    allocations: this.fb.array<FormGroup>([]),
    deallocations: this.fb.array<FormGroup>([]),
  });

  readonly currentTeamArray = this.actionsForm.get(
    'currentTeam'
  ) as FormArray<FormGroup>;
  readonly allocationsArray = this.actionsForm.get(
    'allocations'
  ) as FormArray<FormGroup>;
  readonly deallocationsArray = this.actionsForm.get(
    'deallocations'
  ) as FormArray<FormGroup>;

  private readonly trackedActionsForm = this.formService.trackFormChanges(
    this.actionsForm,
    this.destroyRef
  );

  private previousSelection = new Set<string>();
  private initialEmployeeIds = new Set<string>();
  private readonly userIdToAllocationId = new Map<string, string>();
  private readonly userIdToAllocatedAt = new Map<string, Date | null>();
  private readonly employeeLabels = new Map<string, string>();

  constructor() {
    super();
    effect(() => {
      void this.trackedActionsForm.status();
      this.appConfigurationService.employeeList();
      this.refreshActionRowLabels();
      this.cdr.markForCheck();
    });
  }

  /** Stable keys + metadata so allocate/deallocate lists share one template shape. */
  protected get actionPanels(): readonly {
    key: string;
    formArrayName: 'allocations' | 'deallocations';
    array: FormArray<FormGroup>;
    title: string;
    headingId: string;
    panelClass: string;
  }[] {
    return [
      {
        key: 'alloc',
        formArrayName: 'allocations',
        array: this.allocationsArray,
        title: 'Allocate',
        headingId: 'allocate-heading',
        panelClass:
          'allocate-deallocate__panel allocate-deallocate__panel--allocate',
      },
      {
        key: 'dealloc',
        formArrayName: 'deallocations',
        array: this.deallocationsArray,
        title: 'Deallocate',
        headingId: 'deallocate-heading',
        panelClass:
          'allocate-deallocate__panel allocate-deallocate__panel--deallocate',
      },
    ];
  }

  /** `@for` track — cannot reference `panel` in template track expr (Angular). */
  protected trackAllocateDeallocateRow(group: AbstractControl): unknown {
    const g = group as FormGroup;
    const allocationId = g.get('allocationId')?.value;
    if (typeof allocationId === 'string' && allocationId.length > 0) {
      return `d:${allocationId}`;
    }
    return `a:${g.get('userId')?.value}`;
  }

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to allocate/deallocate employee to project but was not provided'
      );
      return;
    }

    const allocated = record.flatMap(item => item.allocatedEmployees ?? []);

    for (const e of allocated) {
      if (e.id) {
        const name = `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.id;
        this.employeeLabels.set(e.id, name);
        if (e.allocationId) {
          this.userIdToAllocationId.set(e.id, e.allocationId);
        }
        this.userIdToAllocatedAt.set(
          e.id,
          this.parseAllocatedAtToDate(e.allocatedAt)
        );
      }
    }

    const initialIds = allocated
      .map(e => e.id)
      .filter((id): id is string => !!id);

    this.initialEmployeeIds = new Set(initialIds);
    this.previousSelection = new Set(initialIds);

    this.form = this.formService.createForm<IAllocateDeallocateUIFormDto>(
      ALLOCATE_DEALLOCATE_EMPLOYEE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: { employeeNames: initialIds },
      }
    );

    this.form.formGroup
      .get('employeeNames')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const current = this.readEmployeeSelection();
        const prev = this.previousSelection;

        for (const id of current) {
          if (!prev.has(id)) {
            this.onEmployeeAdded(id);
          }
        }
        for (const id of prev) {
          if (!current.has(id)) {
            this.onEmployeeRemoved(id);
          }
        }

        this.previousSelection = this.readEmployeeSelection();
        this.syncCurrentTeamRows();
      });

    this.syncCurrentTeamRows();
  }

  protected override validateForm(): boolean {
    if (this.isMultiStepForm()) {
      return super.validateForm();
    }
    if (!this.validateSingleStepForm()) {
      return false;
    }

    this.actionsForm.markAllAsTouched();
    this.syncActionsFormValidity();
    this.cdr.markForCheck();

    if (this.actionsForm.invalid) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Allocate/deallocate actions validation failed');
      return false;
    }

    const hasNetChanges =
      this.allocationsArray.length > 0 || this.deallocationsArray.length > 0;

    if (!hasNetChanges) {
      this.notificationService.error(
        'Add or remove employees in the list above, then set a date for each action.'
      );
      return false;
    }

    return true;
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const payload = this.buildApiPayload();

    this.loadingService.show({
      title: 'Updating project team',
      message: "We're updating the project team. This will just take a moment.",
    });

    this.projectService
      .allocateDeallocateEmployees(payload)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ message }: IProjectAllocateDeallocateEmployeeResponseDto) => {
          this.notificationService.success(message);
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  protected showEffectiveDateError(group: AbstractControl): boolean {
    const c = group.get('date');
    return !!c?.invalid && c.touched;
  }

  private syncActionsFormValidity(): void {
    const touchRow = (row: AbstractControl): void => {
      row.get('date')?.updateValueAndValidity({ emitEvent: false });
      row.updateValueAndValidity({ emitEvent: false });
    };
    for (const arr of [this.allocationsArray, this.deallocationsArray]) {
      arr.controls.forEach(touchRow);
    }
    this.actionsForm.updateValueAndValidity({ emitEvent: false });
  }

  private readEmployeeSelection(): Set<string> {
    const raw = this.form.formGroup.get('employeeNames')?.value;
    return new Set(
      (Array.isArray(raw) ? raw : []).filter(
        (x): x is string => typeof x === 'string' && x.length > 0
      )
    );
  }

  private patchMultiselectAdd(userId: string): void {
    const ctrl = this.form.formGroup.get('employeeNames');
    if (!ctrl) {
      return;
    }
    const next = new Set(this.readEmployeeSelection());
    next.add(userId);
    ctrl.patchValue([...next], { emitEvent: false });
  }

  private onEmployeeAdded(userId: string): void {
    if (this.initialEmployeeIds.has(userId)) {
      this.removeRowByUserId(this.deallocationsArray, userId);
      return;
    }
    if (
      this.allocationsArray.controls.some(
        c => c.get('userId')?.value === userId
      )
    ) {
      return;
    }
    this.allocationsArray.push(
      this.fb.group({
        userId: [userId],
        displayLabel: [this.resolveLabel(userId)],
        date: [null, effectiveDateRequired],
      })
    );
  }

  private onEmployeeRemoved(userId: string): void {
    if (!this.initialEmployeeIds.has(userId)) {
      this.removeRowByUserId(this.allocationsArray, userId);
      return;
    }
    if (
      this.deallocationsArray.controls.some(
        c => c.get('userId')?.value === userId
      )
    ) {
      return;
    }
    const allocationId = this.userIdToAllocationId.get(userId);
    if (!allocationId) {
      this.notificationService.error(
        'Cannot deallocate: allocation id is missing for this employee. Refresh the list and try again.'
      );
      this.patchMultiselectAdd(userId);
      return;
    }
    this.deallocationsArray.push(
      this.fb.group({
        userId: [userId],
        allocationId: [allocationId],
        displayLabel: [this.resolveLabel(userId)],
        date: [
          this.userIdToAllocatedAt.get(userId) ?? null,
          effectiveDateRequired,
        ],
      })
    );
  }

  private removeRowByUserId(array: FormArray<FormGroup>, userId: string): void {
    const idx = array.controls.findIndex(
      c => c.get('userId')?.value === userId
    );
    if (idx >= 0) {
      array.removeAt(idx);
    }
  }

  private resolveLabel(userId: string): string {
    const dir = this.appConfigurationService
      .employeeList()
      .find(o => String(o.value) === userId);
    if (dir?.label) {
      this.employeeLabels.set(userId, dir.label);
      return dir.label;
    }
    return (
      this.employeeLabels.get(userId) ??
      (UUID_RE.test(userId) ? `Employee (${userId.slice(0, 8)}…)` : userId)
    );
  }

  private refreshActionRowLabels(): void {
    const patch = (arr: FormArray<FormGroup>): void => {
      for (const ctrl of arr.controls) {
        const uid = ctrl.get('userId')?.value as string | undefined;
        if (uid) {
          ctrl
            .get('displayLabel')
            ?.patchValue(this.resolveLabel(uid), { emitEvent: false });
        }
      }
    };
    patch(this.currentTeamArray);
    patch(this.allocationsArray);
    patch(this.deallocationsArray);
  }

  private syncCurrentTeamRows(): void {
    const selected = this.readEmployeeSelection();
    const wanted = [...selected].filter(id => this.initialEmployeeIds.has(id));
    const arr = this.currentTeamArray;

    for (let i = arr.length - 1; i >= 0; i--) {
      const uid = arr.at(i)?.get('userId')?.value as string | undefined;
      if (!uid || !wanted.includes(uid)) {
        arr.removeAt(i);
      }
    }

    for (const id of wanted) {
      if (!arr.controls.some(c => c.get('userId')?.value === id)) {
        arr.push(
          this.fb.group({
            userId: [id],
            displayLabel: [this.resolveLabel(id)],
            date: [this.userIdToAllocatedAt.get(id) ?? null],
          })
        );
      }
    }
  }

  private parseAllocatedAtToDate(raw: unknown): Date | null {
    if (
      raw === null ||
      raw === undefined ||
      typeof raw !== 'string' ||
      !raw.trim()
    ) {
      return null;
    }
    const d = new Date(raw.trim());
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private buildApiPayload(): IProjectAllocateDeallocateEmployeeRequestFormDto {
    const toApiDate = (value: unknown): string =>
      value instanceof Date && !Number.isNaN(value.getTime())
        ? transformDateFormat(value, APP_CONFIG.DATE_FORMATS.API)
        : '';

    return {
      allocations: this.allocationsArray.getRawValue().map(row => ({
        userId: row['userId'] as string,
        date: toApiDate(row['date']),
      })),
      deallocations: this.deallocationsArray.getRawValue().map(row => ({
        allocationId: row['allocationId'] as string,
        date: toApiDate(row['date']),
      })),
    };
  }
}
