import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { IMyFileBaseResponseDto } from '../../types/my-files.dto';
import { getMyFileExtension, toMyFile } from '../../utils/my-files.util';

/**
 * The item an action is about (rename, move, delete): coloured type tile, name and
 * "Kind · size". Same look as the cards on the My Files page.
 */
@Component({
  selector: 'app-my-file-preview',
  templateUrl: './my-file-preview.component.html',
  styleUrl: './my-file-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyFilePreviewComponent {
  readonly record = input.required<IMyFileBaseResponseDto>();

  protected readonly item = computed(() => toMyFile(this.record()));
  protected readonly extension = computed(() =>
    getMyFileExtension(this.item().name, this.item().isFolder)
  );
  protected readonly meta = computed(() =>
    [this.item().kind, this.item().sizeLabel].filter(Boolean).join(' · ')
  );
}
