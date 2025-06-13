import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const FUEL_EXPENSE_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.FUEL.LEDGER,
        loadComponent: () => import('./fuel-expense-ledger/fuel-expense-ledger.component')
            .then(m => m.FuelExpenseLedgerComponent)
    },
    {
        path: ROUTES.FUEL.ADD,
        loadComponent: () => import('./fuel-add-expense/fuel-add-expense.component')
            .then(m => m.FuelAddExpenseComponent)
    },
    {
        path: ROUTES.FUEL.FORCE,
        loadComponent: () => import('./fuel-force-expense/fuel-force-expense.component')
            .then(m => m.FuelForceExpenseComponent)
    },
    {
        path: ROUTES.FUEL.REIMBURSEMENT,
        loadComponent: () => import('./fuel-reimburse-expense/fuel-reimburse-expense.component')
            .then(m => m.FuelReimburseExpenseComponent)
    }
]; 