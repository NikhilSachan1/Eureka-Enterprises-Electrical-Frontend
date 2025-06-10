import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const FUEL_EXPENSE_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.FUEL.LEDGER,
        loadComponent: () => import('./fuel-expense-ledger/fuel-expense-ledger.component')
            .then(m => m.FuelExpenseLedgerComponent)
    }
]; 