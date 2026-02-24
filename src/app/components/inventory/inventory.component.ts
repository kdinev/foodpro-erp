import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { NgClass, TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { IgxDialogComponent } from 'igniteui-angular/dialog';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxButtonDirective, IgxIconButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxChipComponent, IgxChipsAreaComponent } from 'igniteui-angular/chips';
import { IgxLinearProgressBarComponent } from 'igniteui-angular/progressbar';
import { IgxBadgeComponent } from 'igniteui-angular/badge';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { ErpDataService } from '../../services/erp-data.service';
import { Ingredient, SplitOrderEntry } from '../../models/erp.models';

@Component({
  selector: 'app-inventory',
  imports: [
    ReactiveFormsModule, FormsModule, NgClass, TitleCasePipe, DatePipe, DecimalPipe,
    IGX_GRID_DIRECTIVES, IGX_TABS_DIRECTIVES,
    IgxDialogComponent, IGX_INPUT_GROUP_DIRECTIVES,
    IgxSelectComponent, IgxSelectItemComponent,
    IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective,
    IgxChipComponent, IgxChipsAreaComponent,
    IgxLinearProgressBarComponent, IgxBadgeComponent,
    IgxDatePickerComponent,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  @ViewChild('addIngDialog') addIngDialog!: IgxDialogComponent;
  @ViewChild('orderDialog') orderDialog!: IgxDialogComponent;

  private readonly dataService = inject(ErpDataService);

  readonly products = toSignal(this.dataService.products$, { initialValue: [] });
  readonly ingredients = toSignal(this.dataService.ingredients$, { initialValue: [] });
  readonly ingredientOrders = toSignal(this.dataService.ingredientOrders$, { initialValue: [] });

  readonly activePoOrders = computed(() =>
    this.ingredientOrders().filter(po => po.status !== 'delivered' && po.status !== 'cancelled')
  );

  readonly categories = computed(() => [
    ...new Set(this.ingredients().map(i => i.category)),
  ]);

  // ── Add Ingredient Form ───────────────────────────────────
  readonly addIngForm = new FormGroup({
    name: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    currentStock: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    reorderThreshold: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
  });

  // ── Ingredient Order (Split) ──────────────────────────────
  readonly selectedIngredientId = signal<string>('');
  readonly selectedIngredient = computed(() =>
    this.ingredients().find(i => i.id === this.selectedIngredientId()) ?? null
  );
  readonly splitEntries = signal<SplitOrderEntry[]>([]);
  readonly orderDeliveryDate = signal<Date | null>(null);

  readonly totalOrderQty = computed(() =>
    this.splitEntries()
      .filter(e => e.selected && e.quantity)
      .reduce((sum, e) => sum + (e.quantity ?? 0), 0)
  );
  readonly totalOrderValue = computed(() =>
    this.splitEntries()
      .filter(e => e.selected && e.quantity)
      .reduce((sum, e) => sum + (e.quantity ?? 0) * e.pricePerUnit, 0)
  );

  // ── Row highlight ─────────────────────────────────────────
  readonly productRowClasses = {
    'free-zero': (row: any) => row.data?.freeStock === 0,
  };
  readonly ingredientRowClasses = {
    'low-stock-row': (row: any) => row.data?.isLow === true,
  };
  readonly poRowClasses = {
    'delayed-row': (row: any) => row.data?.isDelayed === true,
  };

  openAddIngredient(): void {
    this.addIngForm.reset({ currentStock: 0, reorderThreshold: 1 });
    this.addIngDialog.open();
  }

  saveIngredient(): void {
    if (this.addIngForm.invalid) return;
    const v = this.addIngForm.getRawValue();
    this.dataService.addIngredient({
      name: v.name!,
      category: v.category!,
      unit: v.unit!,
      currentStock: v.currentStock!,
      reorderThreshold: v.reorderThreshold!,
      suppliers: [],
    });
    this.addIngDialog.close();
  }

  openOrderDialog(ingredient?: Ingredient): void {
    this.selectedIngredientId.set(ingredient?.id ?? '');
    if (ingredient) {
      this.buildSplitEntries(ingredient);
    } else {
      this.splitEntries.set([]);
    }
    this.orderDeliveryDate.set(null);
    this.orderDialog.open();
  }

  onIngredientSelect(id: string): void {
    this.selectedIngredientId.set(id);
    const ing = this.ingredients().find(i => i.id === id);
    if (ing) {
      this.buildSplitEntries(ing);
    }
  }

  private buildSplitEntries(ingredient: Ingredient): void {
    this.splitEntries.set(
      ingredient.suppliers.map(s => ({
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        quantity: null,
        pricePerUnit: s.unitPrice,
        leadTimeDays: s.leadTimeDays,
        selected: ingredient.suppliers.length === 1,
        expectedDelivery: null,
      }))
    );
  }

  toggleSplit(index: number, selected: boolean): void {
    this.splitEntries.update(entries => {
      const copy = [...entries];
      copy[index] = { ...copy[index], selected };
      return copy;
    });
  }

  updateSplitQty(index: number, qty: number | null): void {
    this.splitEntries.update(entries => {
      const copy = [...entries];
      copy[index] = { ...copy[index], quantity: qty };
      return copy;
    });
  }

  updateSplitDate(index: number, date: Date | null): void {
    this.splitEntries.update(entries => {
      const copy = [...entries];
      copy[index] = { ...copy[index], expectedDelivery: date };
      return copy;
    });
  }

  submitOrder(): void {
    const ingredient = this.selectedIngredient();
    if (!ingredient) return;
    const validEntries = this.splitEntries().filter(e => e.selected && e.quantity && e.quantity > 0);
    if (validEntries.length === 0) return;
    const baseDate = this.orderDeliveryDate() ?? new Date(Date.now() + 14 * 86400000);
    this.dataService.createSplitIngredientOrders(ingredient.id, validEntries, baseDate);
    this.orderDialog.close();
    this.selectedIngredientId.set('');
    this.splitEntries.set([]);
    this.orderDeliveryDate.set(null);
  }

  getStockPercent(current: number, threshold: number): number {
    return Math.min(100, Math.round((current / (threshold * 2)) * 100));
  }

  isOrderValid(): boolean {
    return (
      !!this.selectedIngredientId() &&
      this.splitEntries().some(e => e.selected && e.quantity != null && e.quantity > 0)
    );
  }
}
