import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { GalleryComponent } from '@shared/components/gallery/gallery.component';
import { IGalleryInputData } from '@shared/models';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-get-expense',
  imports: [ButtonModule, GalleryComponent],
  templateUrl: './get-expense.component.html',
  styleUrl: './get-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseComponent implements OnInit {
  displayBasic = false;
  images = signal<IGalleryInputData[]>([]);
  ngOnInit(): void {
    const photoService = [
      {
        actualMediaUrl:
          'https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=',
        thumbnailMediaUrl:
          'https://media.istockphoto.com/id/517188688/photo/mountain-landscape.jpg?s=612x612&w=0&k=20&c=A63koPKaCyIwQWOTFBRWXj_PwCrR4cEoOw2S9Q7yVl8=',
        mediaDescription: 'Description for Image 1',
        mediaTitle: 'Title 1',
      },
      {
        actualMediaUrl:
          'https://images.pexels.com/photos/674010/pexels-photo-674010.xlsx?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg',
        thumbnailMediaUrl:
          'https://images.pexels.com/photos/674010/pexels-photo-674010.xlsx?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg',
        mediaDescription: 'Description for Image 2',
        mediaTitle: 'Title 2',
      },
      {
        actualMediaUrl:
          'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf',
        thumbnailMediaUrl:
          'https://ontheline.trincoll.edu/images/bookdown/sample-local-pdf.pdf',
        mediaDescription: 'Description for Image 3',
        mediaTitle: 'Title 3',
      },
      {
        actualMediaUrl:
          'https://images.pexels.com/photos/674010/pexels-photo-674010.pptx?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg',
        thumbnailMediaUrl:
          'https://images.pexels.com/photos/674010/pexels-photo-674010.pptx?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg',
        mediaDescription: 'Description for Image 4',
        mediaTitle: 'Title 4',
      },
    ];
    this.images.set(photoService);
  }
}
