import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const HOLIDAY_CALENDAR_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.CALENDAR.ADD,
    loadComponent: () => import('./holiday-list/holiday-list.component')
      .then(m => m.HolidayListComponent)
  },
  {
    path: ROUTES.CALENDAR.LIST,
    loadComponent: () => import('./add-edit-holiday/add-edit-holiday.component')
      .then(m => m.AddEditHolidayComponent)
  },
  {
    path: ROUTES.CALENDAR.EDIT,
    loadComponent: () => import('./add-edit-holiday/add-edit-holiday.component')
      .then(m => m.AddEditHolidayComponent)
  }
]; 