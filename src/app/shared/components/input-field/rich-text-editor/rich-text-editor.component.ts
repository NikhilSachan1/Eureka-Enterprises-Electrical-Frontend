import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

/**
 * The rich-text editor of an EDITOR field. Its own component so the input field can load it
 * with `@defer`: Quill (~200 kB) is fetched only where an editor field is on screen, instead
 * of with every form that uses the shared input field.
 */
@Component({
  selector: 'app-rich-text-editor',
  imports: [EditorModule, FormsModule],
  templateUrl: './rich-text-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RichTextEditorComponent {
  readonly editorId = input<string>();
  readonly value = input<unknown>();
  readonly invalid = input(false);
  readonly height = input('320px');
  readonly modules = input<Record<string, unknown> | undefined>(undefined);
  readonly readonly = input(false);
  readonly disabled = input(false);
  readonly placeholder = input<string | undefined>(undefined);

  readonly valueChange = output<unknown>();
}
