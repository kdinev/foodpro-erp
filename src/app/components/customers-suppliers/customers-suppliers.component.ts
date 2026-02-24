import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgClass, TitleCasePipe, DatePipe } from '@angular/common';
import { IGX_GRID_DIRECTIVES } from 'igniteui-angular/grids/grid';
import { IGX_TABS_DIRECTIVES } from 'igniteui-angular/tabs';
import { IgxDialogComponent } from 'igniteui-angular/dialog';
import { IGX_INPUT_GROUP_DIRECTIVES } from 'igniteui-angular/input-group';
import { IgxSelectComponent, IgxSelectItemComponent } from 'igniteui-angular/select';
import { IgxButtonDirective, IgxIconButtonDirective, IgxRippleDirective } from 'igniteui-angular/directives';
import { IgxIconComponent } from 'igniteui-angular/icon';
import { IgxDatePickerComponent } from 'igniteui-angular/date-picker';
import { ErpDataService } from '../../services/erp-data.service';
import { Customer, Supplier } from '../../models/erp.models';

@Component({
  selector: 'app-customers-suppliers',
  imports: [
    ReactiveFormsModule, NgClass, TitleCasePipe, DatePipe,
    IGX_GRID_DIRECTIVES, IGX_TABS_DIRECTIVES,
    IgxDialogComponent,
    IGX_INPUT_GROUP_DIRECTIVES, IgxSelectComponent, IgxSelectItemComponent,
    IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxRippleDirective,
    IgxDatePickerComponent,
  ],
  templateUrl: './customers-suppliers.component.html',
  styleUrl: './customers-suppliers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersSuppliersComponent {
  @ViewChild('customerDialog') customerDialog!: IgxDialogComponent;
  @ViewChild('supplierDialog') supplierDialog!: IgxDialogComponent;
  @ViewChild('confirmDialog') confirmDialog!: IgxDialogComponent;

  private readonly dataService = inject(ErpDataService);

  readonly customers = toSignal(this.dataService.customers$, { initialValue: [] });
  readonly suppliers = toSignal(this.dataService.suppliers$, { initialValue: [] });

  // ── Edit mode state ───────────────────────────────────────
  readonly dialogTitle = signal('Add Customer');
  readonly editingId = signal<string | null>(null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly pendingDeleteType = signal<'customer' | 'supplier'>('customer');

  // ── Customer Form ─────────────────────────────────────────
  readonly customerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    contactName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    country: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    address: new FormControl(''),
    status: new FormControl<'active' | 'inactive'>('active', Validators.required),
    registrationDate: new FormControl<Date>(new Date(), Validators.required),
  });

  // ── Supplier Form ─────────────────────────────────────────
  readonly supplierForm = new FormGroup({
    name: new FormControl('', Validators.required),
    contactName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    country: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    address: new FormControl(''),
    status: new FormControl<'active' | 'inactive'>('active', Validators.required),
    registrationDate: new FormControl<Date>(new Date(), Validators.required),
  });

  // ── Customer CRUD ─────────────────────────────────────────
  openAddCustomer(): void {
    this.editingId.set(null);
    this.dialogTitle.set('Add New Customer');
    this.customerForm.reset({ status: 'active', registrationDate: new Date() });
    this.customerDialog.open();
  }

  openEditCustomer(row: Customer): void {
    this.editingId.set(row.id);
    this.dialogTitle.set('Edit Customer');
    this.customerForm.patchValue({
      name: row.name,
      contactName: row.contactName,
      email: row.email,
      phone: row.phone,
      country: row.country,
      city: row.city,
      address: row.address,
      status: row.status,
      registrationDate: row.registrationDate,
    });
    this.customerDialog.open();
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;
    const v = this.customerForm.getRawValue();
    const id = this.editingId();
    const payload = {
      name: v.name!,
      contactName: v.contactName!,
      email: v.email!,
      phone: v.phone ?? '',
      country: v.country!,
      city: v.city!,
      address: v.address ?? '',
      status: v.status!,
      registrationDate: v.registrationDate!,
    };
    if (id) {
      this.dataService.updateCustomer({ id, ...payload });
    } else {
      this.dataService.addCustomer(payload);
    }
    this.customerDialog.close();
  }

  promptDeleteCustomer(id: string): void {
    this.pendingDeleteId.set(id);
    this.pendingDeleteType.set('customer');
    this.confirmDialog.open();
  }

  // ── Supplier CRUD ─────────────────────────────────────────
  openAddSupplier(): void {
    this.editingId.set(null);
    this.dialogTitle.set('Add New Supplier');
    this.supplierForm.reset({ status: 'active', registrationDate: new Date() });
    this.supplierDialog.open();
  }

  openEditSupplier(row: Supplier): void {
    this.editingId.set(row.id);
    this.dialogTitle.set('Edit Supplier');
    this.supplierForm.patchValue({
      name: row.name,
      contactName: row.contactName,
      email: row.email,
      phone: row.phone,
      country: row.country,
      city: row.city,
      address: row.address,
      status: row.status,
      registrationDate: row.registrationDate,
    });
    this.supplierDialog.open();
  }

  saveSupplier(): void {
    if (this.supplierForm.invalid) return;
    const v = this.supplierForm.getRawValue();
    const id = this.editingId();
    const payload = {
      name: v.name!,
      contactName: v.contactName!,
      email: v.email!,
      phone: v.phone ?? '',
      country: v.country!,
      city: v.city!,
      address: v.address ?? '',
      status: v.status!,
      registrationDate: v.registrationDate!,
      ingredientIds: [],
    };
    if (id) {
      const existing = this.suppliers().find(s => s.id === id)!;
      this.dataService.updateSupplier({ ...existing, ...payload });
    } else {
      this.dataService.addSupplier(payload);
    }
    this.supplierDialog.close();
  }

  promptDeleteSupplier(id: string): void {
    this.pendingDeleteId.set(id);
    this.pendingDeleteType.set('supplier');
    this.confirmDialog.open();
  }

  confirmDelete(): void {
    const id = this.pendingDeleteId();
    const type = this.pendingDeleteType();
    if (!id) return;
    if (type === 'customer') {
      this.dataService.deleteCustomer(id);
    } else {
      this.dataService.deleteSupplier(id);
    }
    this.confirmDialog.close();
    this.pendingDeleteId.set(null);
  }

  getIngredientNamesForSupplier(ingredientIds: string[]): string {
    const all = this.dataService['_ingredients$'].value;
    return ingredientIds
      .map(id => all.find(i => i.id === id)?.name ?? id)
      .join(', ') || 'None assigned';
  }
}
