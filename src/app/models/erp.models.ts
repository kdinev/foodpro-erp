export type OrderStatus =
  | 'pending'
  | 'in-production'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type IngredientOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'in-transit'
  | 'delivered'
  | 'cancelled';

export type AlertType = 'low-inventory' | 'delayed-order' | 'delayed-shipment';
export type AlertSeverity = 'warning' | 'error';
export type EntityStatus = 'active' | 'inactive';

export interface Customer {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  status: EntityStatus;
  registrationDate: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  status: EntityStatus;
  registrationDate: Date;
  ingredientIds: string[];
}

export interface ProductIngredient {
  ingredientId: string;
  ingredientName: string;
  quantityPerUnit: number;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  totalStock: number;
  pendingOrderQty: number;
  freeStock: number;
  unit: string;
  ingredients: ProductIngredient[];
}

export interface IngredientSupplier {
  supplierId: string;
  supplierName: string;
  unitPrice: number;
  leadTimeDays: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  reorderThreshold: number;
  isLow: boolean;
  suppliers: IngredientSupplier[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalValue: number;
  status: OrderStatus;
  orderDate: Date;
  dueDate: Date;
  shipmentDate: Date | null;
  productionProgress: number;
  isDelayed: boolean;
  notes: string;
}

export interface IngredientOrder {
  id: string;
  poNumber: string;
  ingredientId: string;
  ingredientName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  status: IngredientOrderStatus;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery: Date | null;
  isDelayed: boolean;
}

export interface ErpAlert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  entityId: string;
  entityName: string;
  date: Date;
}

export interface DashboardKPIs {
  totalActiveOrders: number;
  ordersShippedThisMonth: number;
  pendingIngredientOrders: number;
  lowInventoryIngredients: number;
  totalCustomers: number;
  totalSuppliers: number;
  delayedOrders: number;
  delayedShipments: number;
}

export interface SplitOrderEntry {
  supplierId: string;
  supplierName: string;
  quantity: number | null;
  pricePerUnit: number;
  leadTimeDays: number;
  selected: boolean;
  expectedDelivery: Date | null;
}
