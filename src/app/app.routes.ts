import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'customers-suppliers',
    loadComponent: () =>
      import('./components/customers-suppliers/customers-suppliers.component').then(
        m => m.CustomersSuppliersComponent
      ),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./components/inventory/inventory.component').then(m => m.InventoryComponent),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/orders/orders.component').then(m => m.OrdersComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
