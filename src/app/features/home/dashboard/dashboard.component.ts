import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ChartModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // User data
  userName = 'John Doe';
  currentDate = new Date();

  // Leave stats
  availableLeave = 15;
  usedLeave = 7;

  // Expense stats
  totalExpenseClaims = 24500;
  pendingExpenseClaims = 3;

  // Attendance stats
  attendancePercentage = 95;
  daysPresent = 19;

  // Fuel stats
  fuelExpenses = 8750;
  fuelExpenseChange = 12;

  // Dropdown options
  months = [
    { name: 'January', code: 'JAN' },
    { name: 'February', code: 'FEB' },
    { name: 'March', code: 'MAR' },
    { name: 'April', code: 'APR' },
    { name: 'May', code: 'MAY' },
    { name: 'June', code: 'JUN' },
    { name: 'July', code: 'JUL' },
    { name: 'August', code: 'AUG' },
    { name: 'September', code: 'SEP' },
    { name: 'October', code: 'OCT' },
    { name: 'November', code: 'NOV' },
    { name: 'December', code: 'DEC' }
  ];

  selectedMonth = this.months[new Date().getMonth()];
  selectedExpenseMonth = this.months[new Date().getMonth()];
  selectedFuelMonth = this.months[new Date().getMonth()];

  // Calendar data
  leaveDays = [
    new Date(2023, 9, 5),
    new Date(2023, 9, 6),
    new Date(2023, 9, 15),
    new Date(2023, 9, 16)
  ];

  holidays = [
    new Date(2023, 9, 2),
    new Date(2023, 9, 24)
  ];

  // Birthdays
  todaysBirthdays = [
    {
      name: 'Priya Sharma',
      department: 'Marketing',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Rahul Verma',
      department: 'Engineering',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];

  // Employee expenses data
  employeeExpensesData: any;
  chartOptions: any;

  // Fuel expenses data
  fuelExpensesData: any;
  lineChartOptions: any;

  topEmployeeExpenses = [
    {
      name: 'Amit Kumar',
      department: 'Sales',
      amount: 12500,
      status: 'Approved',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    {
      name: 'Neha Singh',
      department: 'Marketing',
      amount: 8750,
      status: 'Pending',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg'
    },
    {
      name: 'Rajesh Patel',
      department: 'Engineering',
      amount: 15200,
      status: 'Approved',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg'
    },
    {
      name: 'Ananya Gupta',
      department: 'HR',
      amount: 4800,
      status: 'Rejected',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
    {
      name: 'Vikram Malhotra',
      department: 'Finance',
      amount: 9300,
      status: 'Approved',
      avatar: 'https://randomuser.me/api/portraits/men/53.jpg'
    }
  ];

  topFuelExpenses = [
    {
      name: 'Suresh Kumar',
      vehicle: 'Honda City',
      distance: 450,
      amount: 2250,
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
    {
      name: 'Meera Reddy',
      vehicle: 'Hyundai i20',
      distance: 380,
      amount: 1900,
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
    },
    {
      name: 'Arjun Singh',
      vehicle: 'Maruti Swift',
      distance: 320,
      amount: 1600,
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    {
      name: 'Pooja Sharma',
      vehicle: 'Toyota Innova',
      distance: 520,
      amount: 3120,
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
    },
    {
      name: 'Karthik Nair',
      vehicle: 'Tata Nexon',
      distance: 290,
      amount: 1450,
      avatar: 'https://randomuser.me/api/portraits/men/71.jpg'
    }
  ];

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Employee expenses chart
    this.employeeExpensesData = {
      labels: ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'],
      datasets: [
        {
          label: 'Expenses',
          backgroundColor: documentStyle.getPropertyValue('--primary-color'),
          borderColor: documentStyle.getPropertyValue('--primary-color'),
          data: [12500, 8750, 15200, 4800, 9300, 7600]
        }
      ]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };

    // Fuel expenses chart
    this.fuelExpensesData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Fuel Expenses',
          data: [5400, 6200, 7100, 6800, 7500, 8200, 7800, 8500, 9200, 8750],
          fill: false,
          borderColor: documentStyle.getPropertyValue('--orange-500'),
          tension: 0.4
        }
      ]
    };

    this.lineChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  isLeaveDay(date: any): boolean {
    return this.leaveDays.some(
      leaveDate =>
        leaveDate.getDate() === date.day &&
        leaveDate.getMonth() === date.month &&
        leaveDate.getFullYear() === date.year
    );
  }

  isHoliday(date: any): boolean {
    return this.holidays.some(
      holiday =>
        holiday.getDate() === date.day &&
        holiday.getMonth() === date.month &&
        holiday.getFullYear() === date.year
    );
  }

}