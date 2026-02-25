import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass, TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IgxDialogComponent } from 'igniteui-angular/dialog';
import { IgxButtonDirective, IgxIconButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxLinearProgressBarComponent } from 'igniteui-angular/progressbar';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IgxChipComponent, IgxChipsAreaComponent } from 'igniteui-angular/chips';
import { ErpDataService } from '../../services/erp-data.service';
import { CustomerOrder, OrderItem, OrderStatus } from '../../models/erp.models';

@Component({
  selector: 'app-orders',
  imports: [
    NgClass, TitleCasePipe, DatePipe, DecimalPipe,
    IGX_GRID_DIRECTIVES,
    IgxDialogComponent,
    IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective,
    IgxLinearProgressBarComponent, IgxBadgeComponent,
    IgxChipComponent, IgxChipsAreaComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponent {
  @ViewChild('detailDialog') detailDialog!: IgxDialogComponent;

  private readonly dataService = inject(ErpDataService);

  readonly orders = toSignal(this.dataService.customerOrders$, { initialValue: [] });

  // Status filter: 'all' | OrderStatus | 'delayed'
  readonly statusFilter = signal<string>('all');

  readonly filteredOrders = computed(() => {
    const filter = this.statusFilter();
    const all = this.orders();
    if (filter === 'all') return all;
    if (filter === 'delayed') return all.filter(o => o.isDelayed);
    return all.filter(o => o.status === filter);
  });

  readonly delayedCount = computed(() => this.orders().filter(o => o.isDelayed).length);
  readonly activeCount = computed(() =>
    this.orders().filter(o => !['delivered', 'cancelled'].includes(o.status)).length
  );

  readonly selectedOrder = signal<CustomerOrder | null>(null);

  readonly rowClasses = {
    'delayed-order-row': (row: any) => row.data?.isDelayed === true,
    'shipped-row': (row: any) =>
      row.data?.status === 'shipped' || row.data?.status === 'delivered',
  };

  readonly filters: { label: string; value: string; icon: string }[] = [
    { label: 'All Orders', value: 'all', icon: 'list_alt' },
    { label: 'Pending', value: 'pending', icon: 'hourglass_empty' },
    { label: 'In Production', value: 'in-production', icon: 'precision_manufacturing' },
    { label: 'Ready', value: 'ready', icon: 'task_alt' },
    { label: 'Shipped', value: 'shipped', icon: 'local_shipping' },
    { label: 'Delivered', value: 'delivered', icon: 'done_all' },
    { label: 'Delayed', value: 'delayed', icon: 'schedule' },
  ];

  openDetail(order: CustomerOrder): void {
    this.selectedOrder.set(order);
    this.detailDialog.open();
  }

  updateStatus(order: CustomerOrder, status: OrderStatus): void {
    this.dataService.updateOrderStatus(order.id, status);
    this.selectedOrder.set(null);
    this.detailDialog.close();
  }

  getProgressType(progress: number, isDelayed: boolean): string {
    if (isDelayed) return 'danger';
    if (progress >= 100) return 'success';
    if (progress < 30) return 'warning';
    return 'default';
  }

  getOrderTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  }

  getNextStatus(current: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['pending', 'in-production', 'ready', 'shipped', 'delivered'];
    const idx = flow.indexOf(current);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  }
}
