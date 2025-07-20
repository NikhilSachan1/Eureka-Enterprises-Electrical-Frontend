import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoadingOverlayComponent } from '@shared/components';
import { LoadingService } from '@shared/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  protected readonly loadingService = inject(LoadingService);

  ngOnInit(): void {
    setTimeout(() => {
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        initialLoader.remove();
      }
    }, 1000);
  }
}
