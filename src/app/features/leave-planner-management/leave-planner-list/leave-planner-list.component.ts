import { Component, signal, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-leave-planner-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    DatePipe,
    CardModule,
    ButtonModule,
    TooltipModule,
  ],
  templateUrl: './leave-planner-list.component.html',
  styleUrl: './leave-planner-list.component.scss'
})
export class LeavePlannerListComponent implements OnInit {
  
  private readonly router = inject(Router);
  
  // FY Policy Configuration Signals
  annualLeaves = signal<any[]>([]);
  optionalHolidays = signal<any[]>([]);
  currentYear = signal(new Date().getFullYear());
  metricsCards = signal<IMetricData[]>([]);

  ngOnInit(): void {
    this.loadAnnualLeaves();
    this.loadOptionalHolidays();
    this.loadMetricsData();
  }

  private loadAnnualLeaves(): void {
    const leaves: any[] = [
      {
        id: '1',
        leaveType: 'Casual Leave (CL)',
        allocatedDays: 12,
      },
    ];
    this.annualLeaves.set(leaves);
  }

  private loadOptionalHolidays(): void {
    const holidays: any[] = [
      {
        id: '1',
        name: 'Diwali',
        date: new Date(2024, 10, 1),
      },
      {
        id: '2',
        name: 'Holi',
        date: new Date(2024, 2, 25),
      },
      {
        id: '3',
        name: 'Eid ul-Fitr',
        date: new Date(2024, 3, 10),
      },
      {
        id: '4',
        name: 'Christmas',
        date: new Date(2024, 11, 25),
      }
    ];
    this.optionalHolidays.set(holidays);
  }

  private loadMetricsData(): void {
    const metrics: IMetricData[] = [
      {
        title: `FY ${this.currentYear()} Leave Policy`,
        subtitle: 'Current policy configuration',
        iconClass: 'pi pi-calendar text-blue-600',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Total Annual Leave Days', value: 12 },
          { label: 'Optional Holidays Available', value: 4 },
        ],
      },
    ];
    this.metricsCards.set(metrics);
  }

  // Annual Leave Management
  protected onAddAnnualLeave(): void {
    this.router.navigate(['/calendar/add']);
  }

  protected editAnnualLeave(leaveId: string): void {
    console.log('Editing annual leave:', leaveId);
  }

  // Holiday Management
  protected onAddHoliday(): void {
    this.router.navigate(['/calendar/add']);
  }

  protected editHoliday(holidayId: string): void {
    console.log('Editing holiday:', holidayId);
  }

  protected removeHoliday(holidayId: string): void {
    console.log('Removing holiday:', holidayId);
  }

  // Icon and color management
  protected getLeaveIcon(leaveType: string): string {
    const type = leaveType.toLowerCase();
    if (type.includes('holiday') || type.includes('vacation')) return 'pi pi-sun';
    if (type.includes('casual')) return 'pi pi-calendar-clock';
    if (type.includes('sick')) return 'pi pi-heart';
    if (type.includes('maternity') || type.includes('paternity')) return 'pi pi-users';
    if (type.includes('emergency')) return 'pi pi-exclamation-triangle';
    return 'pi pi-calendar-check';
  }

  protected getHolidayIcon(holidayName: string): string {
    const name = holidayName.toLowerCase();
    if (name.includes('diwali') || name.includes('deepavali')) return 'pi pi-sun';
    if (name.includes('christmas') || name.includes('xmas')) return 'pi pi-gift';
    if (name.includes('eid') || name.includes('ramadan')) return 'pi pi-moon';
    if (name.includes('holi')) return 'pi pi-palette';
    if (name.includes('dussehra') || name.includes('navratri')) return 'pi pi-crown';
    if (name.includes('ganesh') || name.includes('ganesha')) return 'pi pi-heart';
    if (name.includes('new year')) return 'pi pi-sparkles';
    if (name.includes('independence') || name.includes('republic')) return 'pi pi-flag';
    if (name.includes('guru') || name.includes('buddha')) return 'pi pi-book';
    return 'pi pi-calendar-star';
  }
}
