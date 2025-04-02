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
  userName = 'Admin';
  currentDate = new Date();

  // Key metrics
  totalEmployees = 150;
  activeEmployees = 145;
  totalExpenseClaims = 24500;
  pendingExpenseClaims = 3;
  fuelExpenses = 8750;
  fuelExpenseChange = 12;
  pendingApprovals = 8;

  // Expense status counts
  expenseStatus = {
    approved: 12,
    pending: 5,
    rejected: 3,
    reimbursed: 20000,
    pendingAmount: 3500,
    rejectedAmount: 1000
  };

  // Fuel expense status counts
  fuelExpenseStatus = {
    approved: 8,
    pending: 3,
    rejected: 2,
    reimbursed: 6500,
    pendingAmount: 1500,
    rejectedAmount: 750
  };

  // Attendance data
  attendance = {
    present: 63,
    absent: 55,
    leave: 44
  };

  // Site analytics
  siteAnalytics = {
    totalProfit: 125000,
    profitPercentage: 8.5,
    completed: 15,
    ongoing: 8,
    upcoming: 5,
    targetAchieved: 85
  };

  // Leave status
  leaveStatus = [
    {
      employeeName: 'Rajesh Kumar',
      department: 'Engineering',
      leaveType: 'Sick Leave',
      duration: 3,
      status: 'Pending',
      icon: 'pi pi-clock'
    },
    {
      employeeName: 'Priya Sharma',
      department: 'Marketing',
      leaveType: 'Annual Leave',
      duration: 5,
      status: 'Approved',
      icon: 'pi pi-check'
    },
    {
      employeeName: 'Amit Patel',
      department: 'Sales',
      leaveType: 'Personal Leave',
      duration: 2,
      status: 'Rejected',
      icon: 'pi pi-times'
    }
  ];

  // Leave status counts
  leaveStatusCount = {
    total: 15,
    approved: 8,
    pending: 5,
    rejected: 2
  };

  // Asset management
  assetManagement = {
    total: 250,
    assigned: 180,
    available: 65,
    maintenance: 5
  };

  // Vehicle management
  vehicleManagement = {
    total: 15,
    assigned: 10,
    available: 4,
    maintenance: 1
  };

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

  // Calendar data
  holidays = [
    new Date(2023, 9, 2),  // Gandhi Jayanti
    new Date(2023, 9, 24), // Dussehra
    new Date(2023, 10, 12), // Diwali
    new Date(2023, 10, 13), // Diwali
    new Date(2023, 10, 14), // Diwali
    new Date(2023, 11, 25), // Christmas
    new Date(2024, 0, 1),   // New Year
    new Date(2024, 0, 26),  // Republic Day
    new Date(2024, 2, 25),  // Holi
    new Date(2024, 3, 9),   // Good Friday
    new Date(2024, 4, 1),   // May Day
    new Date(2024, 7, 15),  // Independence Day
    new Date(2024, 8, 2),   // Ganesh Chaturthi
    new Date(2024, 8, 10)   // Muharram
  ];

  // Recent activities
  recentActivities = [
    {
      type: 'expense',
      icon: 'pi pi-wallet',
      title: 'New Expense Claim',
      description: 'Rajesh Patel submitted a claim for ₹2,500',
      time: '2 hours ago',
      needsAction: true
    },
    {
      type: 'fuel',
      icon: 'pi pi-car',
      title: 'Fuel Expense',
      description: 'Meera Reddy added fuel expense of ₹1,200',
      time: '3 hours ago',
      needsAction: true
    },
    {
      type: 'employee',
      icon: 'pi pi-user',
      title: 'New Employee',
      description: 'Amit Kumar joined the Engineering team',
      time: '1 day ago',
      needsAction: false
    },
    {
      type: 'expense',
      icon: 'pi pi-wallet',
      title: 'Expense Approved',
      description: 'Priya Sharma\'s claim of ₹3,000 was approved',
      time: '1 day ago',
      needsAction: false
    }
  ];

  // Upcoming holidays
  upcomingHolidays = [
    {
      name: 'Diwali',
      date: new Date(2023, 10, 12)
    },
    {
      name: 'Christmas',
      date: new Date(2023, 11, 25)
    },
    {
      name: 'New Year',
      date: new Date(2024, 0, 1)
    },
    {
      name: 'Republic Day',
      date: new Date(2024, 0, 26)
    }
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

  // Average amounts for expense calculations
  averageClaimAmount: number = 0;
  averageFuelAmount: number = 0;

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

    // Calculate average amounts
    this.averageClaimAmount = this.totalExpenseClaims / (this.expenseStatus.approved + this.expenseStatus.pending);
    this.averageFuelAmount = this.fuelExpenses / (this.fuelExpenseStatus.approved + this.fuelExpenseStatus.pending);
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