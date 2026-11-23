import { DestroyRef, inject, Injectable } from '@angular/core';
import { UNSAVED_CHANGES_PENDING_SAVE_TTL_MS } from '@core/constants/unsaved-changes.constants';
import { IPendingSave, IUnsavedChangesAware } from '@core/types';
import { UNSAVED_CHANGES_DIALOG_CONFIG } from '@shared/config/confirmation-dialog.config';
// Direct file import (not the @shared/services barrel) keeps core → shared free of cycles.
import { ConfirmationDialogService } from '@shared/services/confirmation-dialog-config.service';
import { EButtonActionType } from '@shared/types';

/**
 * Keeps the "leave without saving?" logic in one place:
 * - forms register while alive, so a browser refresh / tab close can warn;
 * - a submitting form is marked saved when its API write succeeds, so the
 *   navigation that follows a save is not blocked;
 * - the route guard asks here before leaving a page with unsaved input.
 */
@Injectable({ providedIn: 'root' })
export class UnsavedChangesService {
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private readonly liveForms = new Set<IUnsavedChangesAware>();
  private readonly pendingSaves = new Map<IPendingSave, number>();
  private openPrompt: Promise<boolean> | null = null;

  constructor() {
    window.addEventListener('beforeunload', event => {
      if (this.anyLiveFormHasChanges()) {
        // The browser shows its own generic "Leave site?" message.
        event.preventDefault();
      }
    });
  }

  /** Called by every form on creation; it is dropped again when destroyed. */
  register(
    form: IUnsavedChangesAware & IPendingSave,
    destroyRef: DestroyRef
  ): void {
    this.liveForms.add(form);
    destroyRef.onDestroy(() => {
      this.liveForms.delete(form);
      this.pendingSaves.delete(form);
    });
  }

  beginSave(form: IPendingSave): void {
    this.pendingSaves.set(form, Date.now());
  }

  /** An API write succeeded: forms that were submitting are now saved. */
  notifyWriteSucceeded(): void {
    const cutoff = Date.now() - UNSAVED_CHANGES_PENDING_SAVE_TTL_MS;

    this.pendingSaves.forEach((startedAt, form) => {
      if (startedAt >= cutoff) {
        form.markSaved();
      }
    });
    this.pendingSaves.clear();
  }

  /** An API write failed: the input is still unsaved, so keep guarding it. */
  notifyWriteFailed(): void {
    this.pendingSaves.clear();
  }

  /** Resolves true when the user chooses to leave and drop their changes. */
  confirmDiscard(): Promise<boolean> {
    // Several guards can fire for one navigation; ask only once.
    this.openPrompt ??= new Promise<boolean>(resolve => {
      this.confirmationDialogService.showConfirmationDialog(
        EButtonActionType.CANCEL,
        {
          dialogConfig: UNSAVED_CHANGES_DIALOG_CONFIG,
          onAccept: () => resolve(true),
          onReject: () => resolve(false),
        },
        null,
        false,
        false
      );
    }).finally(() => {
      this.openPrompt = null;
    });

    return this.openPrompt;
  }

  private anyLiveFormHasChanges(): boolean {
    for (const form of this.liveForms) {
      if (form.hasUnsavedChanges()) {
        return true;
      }
    }
    return false;
  }
}
