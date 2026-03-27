import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CONFIGURATION_TYPE_DATA } from '@shared/config/static-data.config';
import { CONFIGURATION_KEYS, ICONS, MODULE_NAMES } from '@shared/constants';
import { IInputFieldsConfig } from '@shared/types';
import { AppConfigurationService } from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  ADD_CONFIGURATION_VALUE_EDITOR_BUTTONS,
  ADD_CONFIGURATION_VALUE_EDITOR_COLLECTION_ACTIONS,
  ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH,
  ADD_CONFIGURATION_VALUE_EDITOR_HINTS,
  buildAddConfigurationBooleanValueFieldConfig,
  buildAddConfigurationDateValueFieldConfig,
  buildAddConfigurationKindSelectFieldConfig,
  buildAddConfigurationNumberValueFieldConfig,
  buildAddConfigurationObjectKeyFieldConfig,
  buildAddConfigurationStringValueFieldConfig,
  filterAddConfigurationValueKindOptions,
  mapConfigurationTypeOptionsToValueEditorKinds,
} from '../../../configs';
import { IConfigValueNode } from '../../types/config-value-node.model';
import {
  cloneNode,
  createEmptyNode,
  isTValueKind,
} from '../../utils/config-value.util';

@Component({
  selector: 'app-add-configuration-value-node',
  standalone: true,
  imports: [
    InputFieldComponent,
    ButtonComponent,
    forwardRef(() => AddConfigurationValueNodeComponent),
  ],
  templateUrl: './add-configuration-value-node.component.html',
  styleUrl: './add-configuration-value-node.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddConfigurationValueNodeComponent {
  private readonly appConfigurationService = inject(AppConfigurationService);

  private readonly configurationTypeOptions =
    this.appConfigurationService.getDropdown(
      MODULE_NAMES.CONFIGURATION,
      CONFIGURATION_KEYS.CONFIGURATION.CONFIGURATION_TYPE_DROPDOWN
    );

  readonly node = input.required<IConfigValueNode>();
  readonly depth = input(0);
  readonly maxDepth = input(ADD_CONFIGURATION_VALUE_EDITOR_DEFAULT_MAX_DEPTH);
  readonly showKindSelector = input(true);
  readonly rowKey = input('root');
  readonly valueValidationAttempt = input(0);
  /**
   * When true, new object/array rows start collapsed (e.g. edit screen).
   * When false, rows start expanded (e.g. add screen).
   */
  readonly collapseChildrenByDefault = input(false);

  readonly nodeChange = output<IConfigValueNode>();

  protected readonly requiredFieldMessage = 'This field is required';

  protected readonly hints = ADD_CONFIGURATION_VALUE_EDITOR_HINTS;
  protected readonly collectionActions =
    ADD_CONFIGURATION_VALUE_EDITOR_COLLECTION_ACTIONS;

  protected readonly chevronExpandedIcon = ICONS.COMMON.CHEVRON_DOWN;
  protected readonly chevronCollapsedIcon = ICONS.COMMON.CHEVRON_RIGHT;

  /** Per object property row: expanded when true (arrays are always fully expanded). */
  private readonly objectRowExpanded = signal<boolean[]>([]);

  protected readonly addObjectRowButtonConfig =
    ADD_CONFIGURATION_VALUE_EDITOR_BUTTONS.addObjectRow;
  protected readonly addArrayItemButtonConfig =
    ADD_CONFIGURATION_VALUE_EDITOR_BUTTONS.addArrayItem;
  protected readonly removeRowButtonConfig =
    ADD_CONFIGURATION_VALUE_EDITOR_BUTTONS.removeRow;

  constructor() {
    effect(() => {
      const n = this.node();
      const defaultExpanded = !this.collapseChildrenByDefault();
      if (n.kind === 'object') {
        const len = n.objectEntries?.length ?? 0;
        this.objectRowExpanded.update(arr => {
          const next = arr.slice(0, len);
          while (next.length < len) {
            next.push(defaultExpanded);
          }
          return next;
        });
      }
    });
  }

  protected readonly kindOptionsFiltered = computed(() => {
    const fromService = this.configurationTypeOptions();
    const base = fromService.length > 0 ? fromService : CONFIGURATION_TYPE_DATA;
    const mapped = mapConfigurationTypeOptionsToValueEditorKinds(base);
    return filterAddConfigurationValueKindOptions(
      this.depth(),
      this.maxDepth(),
      mapped
    );
  });

  protected readonly kindSelectFieldConfig = computed(() =>
    buildAddConfigurationKindSelectFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
      options: this.kindOptionsFiltered(),
    })
  );

  protected readonly stringFieldConfig = computed(() =>
    buildAddConfigurationStringValueFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
    })
  );

  protected readonly numberFieldConfig = computed(() =>
    buildAddConfigurationNumberValueFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
    })
  );

  protected readonly booleanFieldConfig = computed(() =>
    buildAddConfigurationBooleanValueFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
    })
  );

  protected readonly dateFieldConfig = computed(() =>
    buildAddConfigurationDateValueFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
    })
  );

  protected objectKeyFieldConfig(index: number): IInputFieldsConfig {
    return buildAddConfigurationObjectKeyFieldConfig({
      rowKey: this.rowKey(),
      depth: this.depth(),
      index,
    });
  }

  protected onKindChange(raw: unknown): void {
    const v = typeof raw === 'string' ? raw : String(raw ?? '');
    if (!isTValueKind(v)) {
      return;
    }
    this.nodeChange.emit(createEmptyNode(v));
  }

  protected onStringChange(raw: unknown): void {
    const n = this.node();
    if (n.kind !== 'string') {
      return;
    }
    this.nodeChange.emit({ ...n, stringValue: String(raw ?? '') });
  }

  protected onNumberChange(raw: unknown): void {
    const n = this.node();
    if (n.kind !== 'number') {
      return;
    }
    if (raw === null || raw === undefined || raw === '') {
      this.nodeChange.emit({ ...n, numberValue: undefined });
      return;
    }
    const num =
      typeof raw === 'number' && !Number.isNaN(raw) ? raw : Number(raw);
    if (Number.isNaN(num)) {
      this.nodeChange.emit({ ...n, numberValue: undefined });
      return;
    }
    this.nodeChange.emit({ ...n, numberValue: num });
  }

  protected onBoolChange(raw: unknown): void {
    const n = this.node();
    if (n.kind !== 'boolean') {
      return;
    }
    this.nodeChange.emit({ ...n, boolValue: Boolean(raw) });
  }

  protected onDateChange(raw: unknown): void {
    const n = this.node();
    if (n.kind !== 'date') {
      return;
    }
    if (raw === null || raw === undefined) {
      this.nodeChange.emit({ ...n, dateValue: undefined });
      return;
    }
    const d = raw instanceof Date ? raw : new Date(raw as string | number);
    if (Number.isNaN(d.getTime())) {
      this.nodeChange.emit({ ...n, dateValue: undefined });
      return;
    }
    this.nodeChange.emit({ ...n, dateValue: d });
  }

  protected addObjectEntry(): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const entries = [
      ...(n.objectEntries ?? []),
      { key: '', value: createEmptyNode('string') },
    ];
    this.nodeChange.emit({ ...n, objectEntries: entries });

    // Edit mode collapses rows by default; newly added properties should open for editing.
    if (this.collapseChildrenByDefault()) {
      setTimeout(() => {
        this.objectRowExpanded.update(arr => {
          const current = this.node();
          if (current.kind !== 'object') {
            return arr;
          }
          const len = current.objectEntries?.length ?? 0;
          const next = arr.slice(0, len);
          while (next.length < len) {
            next.push(false);
          }
          if (len > 0) {
            next[len - 1] = true;
          }
          return next;
        });
      }, 0);
    }
  }

  protected removeObjectEntry(index: number): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const entries = [...(n.objectEntries ?? [])];
    entries.splice(index, 1);
    this.nodeChange.emit({ ...n, objectEntries: entries });
  }

  protected onObjectKeyChange(index: number, raw: unknown): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const entries = [...(n.objectEntries ?? [])];
    entries[index] = { ...entries[index], key: String(raw ?? '') };
    this.nodeChange.emit({ ...n, objectEntries: entries });
  }

  protected onObjectValueChange(index: number, value: IConfigValueNode): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const entries = [...(n.objectEntries ?? [])];
    entries[index] = { ...entries[index], value: cloneNode(value) };
    this.nodeChange.emit({ ...n, objectEntries: entries });
  }

  protected addArrayItem(): void {
    const n = this.node();
    if (n.kind !== 'array') {
      return;
    }
    const items = [...(n.arrayItems ?? []), createEmptyNode('string')];
    this.nodeChange.emit({ ...n, arrayItems: items });
  }

  protected removeArrayItem(index: number): void {
    const n = this.node();
    if (n.kind !== 'array') {
      return;
    }
    const items = [...(n.arrayItems ?? [])];
    items.splice(index, 1);
    this.nodeChange.emit({ ...n, arrayItems: items });
  }

  protected onArrayItemChange(index: number, value: IConfigValueNode): void {
    const n = this.node();
    if (n.kind !== 'array') {
      return;
    }
    const items = [...(n.arrayItems ?? [])];
    items[index] = cloneNode(value);
    this.nodeChange.emit({ ...n, arrayItems: items });
  }

  protected isStringValueInvalid(): boolean {
    if (this.valueValidationAttempt() === 0) {
      return false;
    }
    const n = this.node();
    return n.kind === 'string' && (n.stringValue ?? '').trim() === '';
  }

  protected isNumberValueInvalid(): boolean {
    if (this.valueValidationAttempt() === 0) {
      return false;
    }
    const n = this.node();
    return (
      n.kind === 'number' &&
      (n.numberValue === undefined ||
        n.numberValue === null ||
        Number.isNaN(n.numberValue))
    );
  }

  protected isDateValueInvalid(): boolean {
    if (this.valueValidationAttempt() === 0) {
      return false;
    }
    const n = this.node();
    return (
      n.kind === 'date' &&
      (n.dateValue === undefined ||
        n.dateValue === null ||
        !(n.dateValue instanceof Date) ||
        Number.isNaN(n.dateValue.getTime()))
    );
  }

  protected isObjectKeyInvalid(index: number): boolean {
    if (this.valueValidationAttempt() === 0) {
      return false;
    }
    const n = this.node();
    if (n.kind !== 'object') {
      return false;
    }
    const key = n.objectEntries?.[index]?.key ?? '';
    return key.trim() === '';
  }

  protected isObjectRowExpanded(index: number): boolean {
    return this.objectRowExpanded()[index] === true;
  }

  protected objectRowChevronClass(index: number): string {
    return this.isObjectRowExpanded(index)
      ? this.chevronExpandedIcon
      : this.chevronCollapsedIcon;
  }

  protected toggleObjectRow(index: number): void {
    this.objectRowExpanded.update(arr => {
      const next = [...arr];
      next[index] = !next[index];
      return next;
    });
  }

  protected expandAllObjectRows(): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const len = n.objectEntries?.length ?? 0;
    this.objectRowExpanded.set(Array(len).fill(true));
  }

  protected collapseAllObjectRows(): void {
    const n = this.node();
    if (n.kind !== 'object') {
      return;
    }
    const len = n.objectEntries?.length ?? 0;
    this.objectRowExpanded.set(Array(len).fill(false));
  }
}
