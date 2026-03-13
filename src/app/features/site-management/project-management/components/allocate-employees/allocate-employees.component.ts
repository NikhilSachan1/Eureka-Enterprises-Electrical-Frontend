import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IAllocateEmployeesFormDto,
  IAllocatedEmployeeInfo,
  IManageAllocationsRequestDto,
  IManageAllocationsResponseDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  InputFieldConfigService,
} from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ProjectService } from '../../services/project.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IDialogActionHandler,
  EDataType,
  IInputFieldsConfig,
  ITrackedFields,
} from '@shared/types';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  SELECTED_EMPLOYEES_FIELD_CONFIG,
  ALLOCATION_ROW_FIELD_CONFIG,
  DEALLOCATION_ROW_FIELD_CONFIG,
} from '../../config/form/allocate-employee.config';

@Component({
  selector: 'app-allocate-employees',
  standalone: true,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './allocate-employees.component.html',
  styleUrl: './allocate-employees.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocateEmployeesComponent
  extends FormBase<IAllocateEmployeesFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly fb = inject(FormBuilder);
  private readonly inputFieldConfigService = inject(InputFieldConfigService);
  private readonly appConfigService = inject(AppConfigurationService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected formGroup!: FormGroup;

  protected readonly selectedRecord =
    input.required<IProjectGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  private allocatedEmployeeMap = new Map<string, IAllocatedEmployeeInfo>();
  protected employeeDisplayNameMap = new Map<string, string>();
  private siteId = signal<string>('');

  protected allocationsFormArray = signal<FormArray | null>(null);
  protected deallocationsFormArray = signal<FormArray | null>(null);

  /** Bump on submit attempt so nested inputs re-check validation after markAllAsTouched */
  protected validationTrigger = signal(0);

  private trackedAllocateFields!: ITrackedFields<
    Pick<IAllocateEmployeesFormDto, 'allocatedEmployees'>
  >;

  protected selectedEmployeesFieldConfig!: IInputFieldsConfig;
  protected allocatedDateFieldConfig!: IInputFieldsConfig;
  protected deallocatedDateFieldConfig!: IInputFieldsConfig;
  protected remarksFieldConfig!: IInputFieldsConfig;

  constructor() {
    super();
    effect(
      () => {
        if (this.trackedAllocateFields?.allocatedEmployees && this.formGroup) {
          const ids = this.trackedAllocateFields.allocatedEmployees();
          const sid = this.siteId();
          if (sid) {
            this.syncRowsFromSelection((ids ?? []) as string[], sid);
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    const records = this.selectedRecord();
    if (!records?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.formGroup = this.fb.group({
        allocatedEmployees: this.fb.control<string[]>([]),
        allocationRows: this.fb.array<FormGroup>([]),
        deallocationRows: this.fb.array<FormGroup>([]),
      });
      this.form = this.formService.wrapFormGroup<IAllocateEmployeesFormDto>(
        this.formGroup
      );
      return;
    }

    const project = records[0];
    this.buildAllocatedMaps(project);

    this.selectedEmployeesFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.MULTI_SELECT,
        SELECTED_EMPLOYEES_FIELD_CONFIG
      );
    this.allocatedDateFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.DATE,
        ALLOCATION_ROW_FIELD_CONFIG.allocatedDate
      );
    this.deallocatedDateFieldConfig =
      this.inputFieldConfigService.getInputFieldConfig(
        EDataType.DATE,
        DEALLOCATION_ROW_FIELD_CONFIG.deallocatedDate
      );
    this.remarksFieldConfig = this.inputFieldConfigService.getInputFieldConfig(
      EDataType.TEXT_AREA,
      DEALLOCATION_ROW_FIELD_CONFIG.remarks
    );

    this.buildForm();
  }

  private buildAllocatedMaps(project: IProjectGetBaseResponseDto): void {
    const empList = this.appConfigService.employeeList();
    empList.forEach(opt => {
      this.employeeDisplayNameMap.set(opt.value, opt.label);
    });
    (project.allocatedEmployees ?? []).forEach(emp => {
      const name = `${emp.firstName} ${emp.lastName}`.trim();
      this.allocatedEmployeeMap.set(emp.id, {
        allocationId: emp.allocationId,
        allocatedAt: emp.allocatedAt,
        firstName: emp.firstName,
        lastName: emp.lastName,
        role: emp.role,
      });
      this.employeeDisplayNameMap.set(emp.id, `${name} (${emp.role})`);
    });
  }

  private buildForm(): void {
    const project = this.selectedRecord()[0];
    const siteId = project.id;
    const initialSelectedIds = (project.allocatedEmployees ?? []).map(
      emp => emp.id
    );

    this.siteId.set(siteId);

    this.formGroup = this.fb.group({
      allocatedEmployees: this.fb.control<string[]>(initialSelectedIds),
      allocationRows: this.fb.array<FormGroup>([]),
      deallocationRows: this.fb.array<FormGroup>([]),
    });

    this.form = this.formService.wrapFormGroup<IAllocateEmployeesFormDto>(
      this.formGroup
    );

    this.syncRowsFromSelection(initialSelectedIds, siteId);

    this.trackedAllocateFields = this.formService.trackMultipleFieldChanges<
      Pick<IAllocateEmployeesFormDto, 'allocatedEmployees'>
    >(this.formGroup, ['allocatedEmployees'], this.destroyRef);

    this.allocationsFormArray.set(
      this.formGroup.get('allocationRows') as FormArray
    );
    this.deallocationsFormArray.set(
      this.formGroup.get('deallocationRows') as FormArray
    );
  }

  private syncRowsFromSelection(selectedIds: string[], siteId: string): void {
    const allocationRows = this.formGroup.get('allocationRows') as FormArray;
    const deallocationRows = this.formGroup.get(
      'deallocationRows'
    ) as FormArray;

    const existingAllocationDates = new Map<string, string>();
    for (let i = 0; i < allocationRows.length; i++) {
      const g = allocationRows.at(i) as FormGroup;
      const uid = g.get('userId')?.value;
      const date = g.get('allocatedDate')?.value;
      if (uid && date) {
        existingAllocationDates.set(uid, this.toDateString(date));
      }
    }

    allocationRows.clear();
    selectedIds.forEach(userId => {
      const date =
        existingAllocationDates.get(userId) ??
        this.getApiAllocatedDate(userId) ??
        new Date().toISOString().split('T')[0];
      allocationRows.push(this.createAllocationRow(siteId, userId, date));
    });

    const selectedSet = new Set(selectedIds);
    const toDeallocate = Array.from(this.allocatedEmployeeMap.entries()).filter(
      ([userId]) => !selectedSet.has(userId)
    );

    const existingDeallocationDates = new Map<string, string>();
    const existingDeallocationRemarks = new Map<string, string>();
    for (let i = 0; i < deallocationRows.length; i++) {
      const g = deallocationRows.at(i) as FormGroup;
      const uid = g.get('_userId')?.value as string;
      const aid = g.get('allocationId')?.value as string;
      const key = uid || aid;
      const date = g.get('deallocatedDate')?.value;
      const remarks = g.get('remarks')?.value;
      if (key && date) {
        existingDeallocationDates.set(key, this.toDateString(date));
      }
      if (key && remarks !== null) {
        existingDeallocationRemarks.set(key, String(remarks));
      }
    }

    deallocationRows.clear();
    toDeallocate.forEach(([userId, info]) => {
      const date =
        existingDeallocationDates.get(userId) ??
        existingDeallocationDates.get(info.allocationId ?? '') ??
        info.deallocatedAt ??
        new Date().toISOString().split('T')[0];
      const remarks =
        existingDeallocationRemarks.get(userId) ??
        existingDeallocationRemarks.get(info.allocationId ?? '') ??
        '';
      deallocationRows.push(
        this.createDeallocationRow(userId, info, date, remarks)
      );
    });

    this.allocationsFormArray.set(allocationRows);
    this.deallocationsFormArray.set(deallocationRows);
    this.cdr.markForCheck();
  }

  private createAllocationRow(
    siteId: string,
    userId: string,
    allocatedDate: string
  ): FormGroup {
    const dateValue = allocatedDate ? new Date(allocatedDate) : new Date();
    return this.fb.group({
      siteId: [siteId, Validators.required],
      userId: [userId, Validators.required],
      allocatedDate: [dateValue, Validators.required],
      role: ['Engineer', Validators.required],
      allocationType: ['full_time', Validators.required],
      _displayName: [this.employeeDisplayNameMap.get(userId) ?? userId],
    });
  }

  private createDeallocationRow(
    userId: string,
    info: IAllocatedEmployeeInfo,
    deallocatedDate?: string,
    remarks = ''
  ): FormGroup {
    const dateStr =
      deallocatedDate ??
      info.deallocatedAt ??
      new Date().toISOString().split('T')[0];
    const dateValue = dateStr ? new Date(dateStr) : new Date();
    return this.fb.group({
      allocationId: [info.allocationId ?? ''],
      _userId: [userId],
      deallocatedDate: [dateValue, Validators.required],
      remarks: [remarks],
      _displayName: [`${info.firstName} ${info.lastName} (${info.role})`],
      _hasAllocationId: [!!info.allocationId],
    });
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    this.validationTrigger.update(v => v + 1);
    if (!this.validateForm()) {
      return;
    }
    const payload = this.preparePayload();
    if (
      payload.allocations.length === 0 &&
      payload.deallocations.length === 0
    ) {
      this.notificationService.warning(
        'Add at least one allocation or deallocation'
      );
      return;
    }
    this.executeManageAllocations(payload);
  }

  private toDateString(val: unknown): string {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    if (typeof val === 'string' && val.includes('T')) {
      return val.split('T')[0];
    }
    return String(val ?? '');
  }

  private getApiAllocatedDate(userId: string): string | undefined {
    const allocatedAt = this.allocatedEmployeeMap.get(userId)?.allocatedAt;
    return allocatedAt ? this.toDateString(allocatedAt) : undefined;
  }

  private preparePayload(): IManageAllocationsRequestDto {
    const raw = this.formGroup.getRawValue();
    const initialAllocatedIds = new Set(this.allocatedEmployeeMap.keys());
    const allocationRows = raw.allocationRows as Record<string, unknown>[];
    const newAllocations = allocationRows.filter(
      a => !initialAllocatedIds.has(String(a['userId'] ?? ''))
    );
    const deallocationRows = raw.deallocationRows as Record<string, unknown>[];
    return {
      allocations: newAllocations.map(a => ({
        siteId: String(a['siteId'] ?? ''),
        userId: String(a['userId'] ?? ''),
        allocatedAt: this.toDateString(a['allocatedDate']),
        role: String(a['role'] ?? ''),
        allocationType: String(a['allocationType'] ?? ''),
      })),
      deallocations: deallocationRows
        .filter(d => !!d['allocationId'])
        .map(d => {
          const remarks = d['remarks'] ?? null;
          return {
            allocationId: String(d['allocationId'] ?? ''),
            deallocatedAt: this.toDateString(d['deallocatedDate']),
            ...(remarks ? { remarks: String(remarks) } : {}),
          };
        }),
    };
  }

  private executeManageAllocations(
    payload: IManageAllocationsRequestDto
  ): void {
    this.loadingService.show({
      title: 'Managing Allocations',
      message: 'Please wait while we update employee allocations...',
    });

    this.projectService
      .manageAllocations(payload)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IManageAllocationsResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  protected get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  protected getAllocationGroup(index: number): FormGroup {
    return (this.formGroup.get('allocationRows') as FormArray).at(
      index
    ) as FormGroup;
  }

  protected getDeallocationGroup(index: number): FormGroup {
    return (this.formGroup.get('deallocationRows') as FormArray).at(
      index
    ) as FormGroup;
  }
}
