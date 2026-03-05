import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgClass, TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { IgxIconComponent } from '@infragistics/igniteui-angular/icon';
import { IgxLinearProgressBarComponent } from '@infragistics/igniteui-angular/progressbar';
import { IgxBadgeComponent } from '@infragistics/igniteui-angular/badge';
import { IGX_CARD_DIRECTIVES } from '@infragistics/igniteui-angular/card';
import { ErpDataService } from '../../services/erp-data.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink, NgClass, TitleCasePipe, DatePipe, DecimalPipe,
    IgxIconComponent, IgxLinearProgressBarComponent, IgxBadgeComponent,
    IGX_CARD_DIRECTIVES,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dataService = inject(ErpDataService);

  readonly today = new Date();

  readonly alerts = toSignal(this.dataService.alerts$, { initialValue: [] });
  readonly kpis = toSignal(this.dataService.kpis$);
  readonly orders = toSignal(this.dataService.customerOrders$, { initialValue: [] });
  readonly ingredients = toSignal(this.dataService.ingredients$, { initialValue: [] });

  readonly activeOrders = computed(() =>
    this.orders()
      .filter(o => !['delivered', 'cancelled', 'shipped'].includes(o.status))
      .sort((a, b) => (b.isDelayed ? 1 : 0) - (a.isDelayed ? 1 : 0))
      .slice(0, 6)
  );

  readonly lowIngredients = computed(() => this.ingredients().filter(i => i.isLow));

  getAlertIcon(type: string): string {
    switch (type) {
      case 'low-inventory': return 'inventory_2';
      case 'delayed-order': return 'schedule';
      default: return 'local_shipping';
    }
  }

  getProgressType(progress: number, isDelayed: boolean): string {
    if (isDelayed) return 'danger';
    if (progress < 30) return 'warning';
    return 'default';
  }

  getSupplierNames(ing: { suppliers?: Array<{ supplierName: string }> }): string {
    return (ing.suppliers ?? []).map((s: { supplierName: string }) => s.supplierName).join(', ');
  }
}
