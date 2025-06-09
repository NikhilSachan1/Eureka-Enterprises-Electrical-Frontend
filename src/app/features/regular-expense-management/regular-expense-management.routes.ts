import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const REGULAR_EXPENSE_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.EXPENSE.LEDGER,
        loadComponent: () => import('./regular-expense-ledger/regular-expense-ledger.component')
            .then(m => m.RegularExpenseLedgerComponent)
    },
    {
        path: ROUTES.EXPENSE.ADD,
        loadComponent: () => import('./regular-add-expense/regular-add-expense.component')
            .then(m => m.RegularAddExpenseComponent)
    },
]; 