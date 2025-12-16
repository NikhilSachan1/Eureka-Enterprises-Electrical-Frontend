import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoadingOverlayComponent } from '@shared/components/loading-overlay/loading-overlay.component';
import { GalleryService, LoadingService } from '@shared/services';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { DrawerComponent } from '@shared/components/drawer/drawer.component';
import { GalleryComponent } from '@shared/components/gallery/gallery.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingOverlayComponent,
    ToastModule,
    ConfirmationDialogComponent,
    DrawerComponent,
    GalleryComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  protected readonly loadingService = inject(LoadingService);
  protected readonly galleryService = inject(GalleryService);

  ngOnInit(): void {
    setTimeout(() => {
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        initialLoader.remove();
      }
    }, 1000);
  }
}
