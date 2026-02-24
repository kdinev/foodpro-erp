import { Component, ViewChild, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { IGX_NAVIGATION_DRAWER_DIRECTIVES, IgxNavigationDrawerComponent } from 'igniteui-angular/navigation-drawer';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IgxRippleDirective } from 'igniteui-angular/directives';
import { IGX_NAVBAR_DIRECTIVES } from 'igniteui-angular/navbar';
import { ErpDataService } from './services/erp-data.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe,
    IGX_NAVIGATION_DRAWER_DIRECTIVES, IGX_NAVBAR_DIRECTIVES,
    IgxIconComponent, IgxBadgeComponent, IgxRippleDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('drawer') drawer!: IgxNavigationDrawerComponent;

  protected readonly dataService = inject(ErpDataService);

  readonly navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Customers & Suppliers', path: '/customers-suppliers', icon: 'people' },
    { label: 'Inventory', path: '/inventory', icon: 'inventory_2' },
    { label: 'Orders', path: '/orders', icon: 'receipt_long' },
  ];

  toggleDrawer(): void {
    this.drawer.toggle();
  }
}
