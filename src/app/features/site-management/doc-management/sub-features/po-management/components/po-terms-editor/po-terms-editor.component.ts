import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  untracked,
  viewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DEFAULT_BUTTON_CONFIG } from '@shared/config';
import { ICONS } from '@shared/constants';
import { ButtonComponent } from '@shared/components/button/button.component';
import {
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
} from '@shared/types';

@Component({
  selector: 'app-po-terms-editor',
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './po-terms-editor.component.html',
  styleUrl: './po-terms-editor.component.scss',
})
export class PoTermsEditorComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly termInputs =
    viewChildren<ElementRef<HTMLTextAreaElement>>('termInput');

  readonly formGroup = input.required<FormGroup>();

  constructor() {
    afterRenderEffect(() => {
      const inputs = this.termInputs();
      untracked(() => {
        inputs.forEach(ref => this.fitTerm(ref.nativeElement));
      });
    });
  }

  protected readonly addButton = {
    ...DEFAULT_BUTTON_CONFIG,
    id: EButtonActionType.ADD,
    label: 'Add term',
    tooltip: 'Add a term',
    icon: ICONS.COMMON.PLUS,
    variant: EButtonVariant.OUTLINED,
  };

  protected readonly removeButton = {
    ...DEFAULT_BUTTON_CONFIG,
    id: EButtonActionType.DELETE,
    label: '',
    tooltip: 'Remove term',
    icon: ICONS.ACTIONS.TRASH,
    severity: EButtonSeverity.DANGER,
    variant: EButtonVariant.TEXT,
  };

  protected termsArray(): FormArray<FormGroup> {
    return this.formGroup().get('terms') as FormArray<FormGroup>;
  }

  protected addTerm(): void {
    this.termsArray().push(
      this.formBuilder.group({
        content: ['', [Validators.required]],
      })
    );
  }

  protected removeTerm(row: FormGroup): void {
    const terms = this.termsArray();
    const index = terms.controls.indexOf(row);
    if (index < 0) {
      return;
    }
    terms.removeAt(index);
  }

  protected fitTerm(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
