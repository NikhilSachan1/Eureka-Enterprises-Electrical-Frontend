import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarService } from '@shared/services';
import { ICONS } from '@shared/constants';

interface DSREntry {
  id: string;
  userName: string;
  date: string;
  description: string;
  workType: string;
  hoursWorked: number;
  progress: number;
  manpower: number;
}

@Component({
  selector: 'app-get-dsr',
  imports: [CommonModule],
  templateUrl: './get-dsr.component.html',
  styleUrl: './get-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrComponent {
  protected icons = ICONS;
  private avatarService = inject(AvatarService);

  dsrEntries: DSREntry[] = [
    {
      id: '1',
      userName: 'Rahul Sharma',
      date: 'Sunday, January 18, 2026',
      description:
        'Completed transformer base installation. Prepared cable trays.',
      workType: 'Erection',
      hoursWorked: 9,
      progress: 65,
      manpower: 12,
    },
    {
      id: '2',
      userName: 'Priya Patel',
      date: 'Saturday, January 17, 2026',
      description:
        'Completed insulation resistance testing for all transformers.',
      workType: 'Testing',
      hoursWorked: 8,
      progress: 100,
      manpower: 8,
    },
    {
      id: '3',
      userName: 'Amit Kumar',
      date: 'Friday, January 16, 2026',
      description: 'Started cable pulling work for Panel A and Panel B.',
      workType: 'Cabling',
      hoursWorked: 7,
      progress: 45,
      manpower: 10,
    },
  ];

  getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  onEditDsr(_dsr: DSREntry): void {
    // console.log('Edit DSR:', dsr);
  }

  onDeleteDsr(_dsr: DSREntry): void {
    // console.log('Delete DSR:', dsr);
  }
}
