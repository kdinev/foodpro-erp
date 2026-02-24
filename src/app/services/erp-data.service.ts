import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import {
  Customer,
  Supplier,
  Product,
  Ingredient,
  CustomerOrder,
  IngredientOrder,
  ErpAlert,
  DashboardKPIs,
  OrderStatus,
  IngredientOrderStatus,
  SplitOrderEntry,
} from '../models/erp.models';

// ─── Helper ────────────────────────────────────────────────────────────────
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1', name: 'Fresh Farms Co', contactName: 'Robert Green',
    email: 'sales@freshfarms.com', phone: '+1-555-0101',
    country: 'USA', city: 'Sacramento, CA', address: '1200 Farm Road, Sacramento, CA 95814',
    status: 'active', registrationDate: new Date('2019-03-12'),
    ingredientIds: ['i1', 'i5', 'i7', 'i8'],
  },
  {
    id: 's2', name: 'MeatFirst Inc', contactName: 'Emily Walsh',
    email: 'orders@meatfirst.com', phone: '+1-555-0202',
    country: 'USA', city: 'Omaha, NE', address: '350 Stockyard Ave, Omaha, NE 68101',
    status: 'active', registrationDate: new Date('2018-07-20'),
    ingredientIds: ['i2', 'i3', 'i11', 'i12'],
  },
  {
    id: 's3', name: 'GrainWorld LLC', contactName: 'Tao Chen',
    email: 'purchase@grainworld.com', phone: '+1-555-0303',
    country: 'USA', city: 'Kansas City, MO', address: '78 Harvest Blvd, Kansas City, MO 64101',
    status: 'active', registrationDate: new Date('2020-01-05'),
    ingredientIds: ['i4', 'i10'],
  },
  {
    id: 's4', name: 'Packaging Solutions Ltd', contactName: 'Sarah Bloom',
    email: 'supply@packagingsolutions.co.uk', phone: '+44-20-5555-0404',
    country: 'UK', city: 'Birmingham', address: '22 Industrial Park, Birmingham B1 1AA',
    status: 'active', registrationDate: new Date('2019-11-18'),
    ingredientIds: ['i16', 'i17', 'i18', 'i19'],
  },
  {
    id: 's5', name: 'SpiceMaster Group', contactName: 'Marco Rossi',
    email: 'b2b@spicemaster.com', phone: '+39-02-5555-0505',
    country: 'Italy', city: 'Milan', address: 'Via Spezie 45, 20100 Milan',
    status: 'active', registrationDate: new Date('2021-02-14'),
    ingredientIds: ['i13', 'i14', 'i15'],
  },
  {
    id: 's6', name: 'Valley Vegetables', contactName: 'Ana Jimenez',
    email: 'orders@valleyveg.com', phone: '+1-555-0606',
    country: 'USA', city: 'Fresno, CA', address: '900 Valley Drive, Fresno, CA 93650',
    status: 'active', registrationDate: new Date('2020-09-30'),
    ingredientIds: ['i1', 'i5', 'i6', 'i7', 'i8', 'i9'],
  },
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1', name: 'SuperMart Stores', contactName: 'James Miller',
    email: 'jmiller@supermart.com', phone: '+1-555-1001',
    country: 'USA', city: 'New York, NY', address: '1 SuperMart Plaza, New York, NY 10001',
    status: 'active', registrationDate: new Date('2018-04-10'),
  },
  {
    id: 'c2', name: 'QuickShop Wholesale', contactName: 'Linda Park',
    email: 'lpark@quickshop.ca', phone: '+1-416-555-1002',
    country: 'Canada', city: 'Toronto, ON', address: '200 Commerce St, Toronto, ON M5H 2N2',
    status: 'active', registrationDate: new Date('2019-08-22'),
  },
  {
    id: 'c3', name: 'EuroDelicious GmbH', contactName: 'Hans Weber',
    email: 'h.weber@eurodelicious.de', phone: '+49-30-5555-1003',
    country: 'Germany', city: 'Berlin', address: 'Lebensmittelstr. 12, 10115 Berlin',
    status: 'active', registrationDate: new Date('2020-02-17'),
  },
  {
    id: 'c4', name: 'Pacific Pantry Ltd', contactName: 'Sophie Turner',
    email: 's.turner@pacificpantry.au', phone: '+61-2-5555-1004',
    country: 'Australia', city: 'Sydney', address: '88 Pantry Lane, Sydney NSW 2000',
    status: 'active', registrationDate: new Date('2020-06-05'),
  },
  {
    id: 'c5', name: 'NorthWest Provisions', contactName: 'Mike Johnson',
    email: 'm.johnson@nwprovisions.com', phone: '+1-206-555-1005',
    country: 'USA', city: 'Seattle, WA', address: '401 Pike St, Seattle, WA 98101',
    status: 'active', registrationDate: new Date('2019-12-11'),
  },
  {
    id: 'c6', name: 'Canned Goods Direct', contactName: 'Oliver Smith',
    email: 'o.smith@cannedgoodsdirect.co.uk', phone: '+44-20-5555-1006',
    country: 'UK', city: 'London', address: '77 Warehouse Row, London E1 6RF',
    status: 'active', registrationDate: new Date('2021-03-28'),
  },
  {
    id: 'c7', name: 'HealthFirst Foods', contactName: 'Priya Sharma',
    email: 'p.sharma@healthfirst.com', phone: '+1-310-555-1007',
    country: 'USA', city: 'Los Angeles, CA', address: '350 Wellness Blvd, Los Angeles, CA 90001',
    status: 'active', registrationDate: new Date('2021-09-14'),
  },
  {
    id: 'c8', name: 'GlobalEats Corp', contactName: 'François Dubois',
    email: 'f.dubois@globaleats.fr', phone: '+33-1-5555-1008',
    country: 'France', city: 'Paris', address: '15 Rue Commerce, 75001 Paris',
    status: 'active', registrationDate: new Date('2022-01-07'),
  },
  {
    id: 'c9', name: 'Urban Table Inc', contactName: 'David Lee',
    email: 'd.lee@urbantable.com', phone: '+1-312-555-1009',
    country: 'USA', city: 'Chicago, IL', address: '500 Restaurant Row, Chicago, IL 60601',
    status: 'active', registrationDate: new Date('2022-05-19'),
  },
  {
    id: 'c10', name: 'Southern Comfort Foods', contactName: 'Mary Adams',
    email: 'm.adams@scfoods.com', phone: '+1-404-555-1010',
    country: 'USA', city: 'Atlanta, GA', address: '200 Peach St, Atlanta, GA 30301',
    status: 'inactive', registrationDate: new Date('2018-11-03'),
  },
];

const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Tomatoes', category: 'Produce', unit: 'kg', currentStock: 850, reorderThreshold: 500, isLow: false, suppliers: [{ supplierId: 's1', supplierName: 'Fresh Farms Co', unitPrice: 0.8, leadTimeDays: 3 }, { supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 0.75, leadTimeDays: 4 }] },
  { id: 'i2', name: 'Beef (ground)', category: 'Meat', unit: 'kg', currentStock: 220, reorderThreshold: 300, isLow: true, suppliers: [{ supplierId: 's2', supplierName: 'MeatFirst Inc', unitPrice: 8.5, leadTimeDays: 2 }] },
  { id: 'i3', name: 'Chicken (diced)', category: 'Meat', unit: 'kg', currentStock: 680, reorderThreshold: 400, isLow: false, suppliers: [{ supplierId: 's2', supplierName: 'MeatFirst Inc', unitPrice: 6.2, leadTimeDays: 2 }] },
  { id: 'i4', name: 'Corn (kernels)', category: 'Grain', unit: 'kg', currentStock: 420, reorderThreshold: 350, isLow: false, suppliers: [{ supplierId: 's3', supplierName: 'GrainWorld LLC', unitPrice: 1.1, leadTimeDays: 5 }] },
  { id: 'i5', name: 'Carrots', category: 'Produce', unit: 'kg', currentStock: 560, reorderThreshold: 200, isLow: false, suppliers: [{ supplierId: 's1', supplierName: 'Fresh Farms Co', unitPrice: 0.6, leadTimeDays: 3 }, { supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 0.55, leadTimeDays: 4 }] },
  { id: 'i6', name: 'Potatoes (diced)', category: 'Produce', unit: 'kg', currentStock: 340, reorderThreshold: 250, isLow: false, suppliers: [{ supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 0.5, leadTimeDays: 4 }] },
  { id: 'i7', name: 'Onions', category: 'Produce', unit: 'kg', currentStock: 490, reorderThreshold: 200, isLow: false, suppliers: [{ supplierId: 's1', supplierName: 'Fresh Farms Co', unitPrice: 0.45, leadTimeDays: 3 }, { supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 0.4, leadTimeDays: 4 }] },
  { id: 'i8', name: 'Celery', category: 'Produce', unit: 'kg', currentStock: 180, reorderThreshold: 150, isLow: false, suppliers: [{ supplierId: 's1', supplierName: 'Fresh Farms Co', unitPrice: 0.9, leadTimeDays: 3 }, { supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 0.85, leadTimeDays: 4 }] },
  { id: 'i9', name: 'Kidney Beans', category: 'Legume', unit: 'kg', currentStock: 720, reorderThreshold: 300, isLow: false, suppliers: [{ supplierId: 's6', supplierName: 'Valley Vegetables', unitPrice: 1.4, leadTimeDays: 5 }] },
  { id: 'i10', name: 'White Rice', category: 'Grain', unit: 'kg', currentStock: 1100, reorderThreshold: 500, isLow: false, suppliers: [{ supplierId: 's3', supplierName: 'GrainWorld LLC', unitPrice: 0.9, leadTimeDays: 5 }] },
  { id: 'i11', name: 'Chicken Broth', category: 'Broth', unit: 'L', currentStock: 800, reorderThreshold: 600, isLow: false, suppliers: [{ supplierId: 's2', supplierName: 'MeatFirst Inc', unitPrice: 1.5, leadTimeDays: 3 }] },
  { id: 'i12', name: 'Beef Broth', category: 'Broth', unit: 'L', currentStock: 180, reorderThreshold: 400, isLow: true, suppliers: [{ supplierId: 's2', supplierName: 'MeatFirst Inc', unitPrice: 1.8, leadTimeDays: 3 }] },
  { id: 'i13', name: 'Salt', category: 'Spice', unit: 'kg', currentStock: 320, reorderThreshold: 100, isLow: false, suppliers: [{ supplierId: 's5', supplierName: 'SpiceMaster Group', unitPrice: 0.3, leadTimeDays: 7 }] },
  { id: 'i14', name: 'Black Pepper', category: 'Spice', unit: 'kg', currentStock: 45, reorderThreshold: 30, isLow: false, suppliers: [{ supplierId: 's5', supplierName: 'SpiceMaster Group', unitPrice: 12.0, leadTimeDays: 7 }] },
  { id: 'i15', name: 'Herbs & Spices Mix', category: 'Spice', unit: 'kg', currentStock: 28, reorderThreshold: 20, isLow: false, suppliers: [{ supplierId: 's5', supplierName: 'SpiceMaster Group', unitPrice: 18.0, leadTimeDays: 7 }] },
  { id: 'i16', name: 'Steel Cans (425ml)', category: 'Packaging', unit: 'units', currentStock: 12500, reorderThreshold: 5000, isLow: false, suppliers: [{ supplierId: 's4', supplierName: 'Packaging Solutions Ltd', unitPrice: 0.12, leadTimeDays: 14 }] },
  { id: 'i17', name: 'Lids', category: 'Packaging', unit: 'units', currentStock: 12500, reorderThreshold: 5000, isLow: false, suppliers: [{ supplierId: 's4', supplierName: 'Packaging Solutions Ltd', unitPrice: 0.05, leadTimeDays: 14 }] },
  { id: 'i18', name: 'Labels', category: 'Packaging', unit: 'units', currentStock: 8200, reorderThreshold: 3000, isLow: false, suppliers: [{ supplierId: 's4', supplierName: 'Packaging Solutions Ltd', unitPrice: 0.03, leadTimeDays: 10 }] },
  { id: 'i19', name: 'Cardboard Boxes (24-pack)', category: 'Packaging', unit: 'units', currentStock: 380, reorderThreshold: 200, isLow: false, suppliers: [{ supplierId: 's4', supplierName: 'Packaging Solutions Ltd', unitPrice: 1.2, leadTimeDays: 10 }] },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1', name: 'Canned Tomato Soup', sku: 'CTS-001', category: 'Soup', unit: 'cans',
    description: 'Rich tomato soup with herbs, packed in 425ml cans.',
    totalStock: 1250, pendingOrderQty: 800, freeStock: 450,
    ingredients: [
      { ingredientId: 'i1', ingredientName: 'Tomatoes', quantityPerUnit: 0.35, unit: 'kg' },
      { ingredientId: 'i7', ingredientName: 'Onions', quantityPerUnit: 0.05, unit: 'kg' },
      { ingredientId: 'i8', ingredientName: 'Celery', quantityPerUnit: 0.03, unit: 'kg' },
      { ingredientId: 'i13', ingredientName: 'Salt', quantityPerUnit: 0.005, unit: 'kg' },
      { ingredientId: 'i15', ingredientName: 'Herbs & Spices Mix', quantityPerUnit: 0.003, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
  {
    id: 'p2', name: 'Canned Beef Stew', sku: 'CBS-001', category: 'Stew', unit: 'cans',
    description: 'Hearty beef stew with root vegetables in rich beef broth.',
    totalStock: 890, pendingOrderQty: 640, freeStock: 250,
    ingredients: [
      { ingredientId: 'i2', ingredientName: 'Beef (ground)', quantityPerUnit: 0.12, unit: 'kg' },
      { ingredientId: 'i5', ingredientName: 'Carrots', quantityPerUnit: 0.04, unit: 'kg' },
      { ingredientId: 'i6', ingredientName: 'Potatoes (diced)', quantityPerUnit: 0.06, unit: 'kg' },
      { ingredientId: 'i12', ingredientName: 'Beef Broth', quantityPerUnit: 0.15, unit: 'L' },
      { ingredientId: 'i13', ingredientName: 'Salt', quantityPerUnit: 0.005, unit: 'kg' },
      { ingredientId: 'i14', ingredientName: 'Black Pepper', quantityPerUnit: 0.002, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
  {
    id: 'p3', name: 'Canned Chicken & Rice', sku: 'CCR-001', category: 'Main', unit: 'cans',
    description: 'Tender chicken with fluffy white rice in chicken broth.',
    totalStock: 2100, pendingOrderQty: 1200, freeStock: 900,
    ingredients: [
      { ingredientId: 'i3', ingredientName: 'Chicken (diced)', quantityPerUnit: 0.1, unit: 'kg' },
      { ingredientId: 'i10', ingredientName: 'White Rice', quantityPerUnit: 0.05, unit: 'kg' },
      { ingredientId: 'i11', ingredientName: 'Chicken Broth', quantityPerUnit: 0.14, unit: 'L' },
      { ingredientId: 'i7', ingredientName: 'Onions', quantityPerUnit: 0.03, unit: 'kg' },
      { ingredientId: 'i13', ingredientName: 'Salt', quantityPerUnit: 0.004, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
  {
    id: 'p4', name: 'Canned Vegetable Medley', sku: 'CVM-001', category: 'Vegetable', unit: 'cans',
    description: 'Colourful medley of seasonal vegetables in light broth.',
    totalStock: 450, pendingOrderQty: 450, freeStock: 0,
    ingredients: [
      { ingredientId: 'i5', ingredientName: 'Carrots', quantityPerUnit: 0.07, unit: 'kg' },
      { ingredientId: 'i6', ingredientName: 'Potatoes (diced)', quantityPerUnit: 0.06, unit: 'kg' },
      { ingredientId: 'i9', ingredientName: 'Kidney Beans', quantityPerUnit: 0.05, unit: 'kg' },
      { ingredientId: 'i8', ingredientName: 'Celery', quantityPerUnit: 0.03, unit: 'kg' },
      { ingredientId: 'i7', ingredientName: 'Onions', quantityPerUnit: 0.04, unit: 'kg' },
      { ingredientId: 'i13', ingredientName: 'Salt', quantityPerUnit: 0.004, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
  {
    id: 'p5', name: 'Canned Minestrone Soup', sku: 'CMS-001', category: 'Soup', unit: 'cans',
    description: 'Classic Italian-style minestrone with beans and pasta.',
    totalStock: 1800, pendingOrderQty: 900, freeStock: 900,
    ingredients: [
      { ingredientId: 'i1', ingredientName: 'Tomatoes', quantityPerUnit: 0.2, unit: 'kg' },
      { ingredientId: 'i9', ingredientName: 'Kidney Beans', quantityPerUnit: 0.06, unit: 'kg' },
      { ingredientId: 'i5', ingredientName: 'Carrots', quantityPerUnit: 0.04, unit: 'kg' },
      { ingredientId: 'i8', ingredientName: 'Celery', quantityPerUnit: 0.03, unit: 'kg' },
      { ingredientId: 'i7', ingredientName: 'Onions', quantityPerUnit: 0.04, unit: 'kg' },
      { ingredientId: 'i15', ingredientName: 'Herbs & Spices Mix', quantityPerUnit: 0.004, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
  {
    id: 'p6', name: 'Canned Corn Chowder', sku: 'CCC-001', category: 'Chowder', unit: 'cans',
    description: 'Creamy corn chowder with potatoes and herbs.',
    totalStock: 620, pendingOrderQty: 200, freeStock: 420,
    ingredients: [
      { ingredientId: 'i4', ingredientName: 'Corn (kernels)', quantityPerUnit: 0.12, unit: 'kg' },
      { ingredientId: 'i6', ingredientName: 'Potatoes (diced)', quantityPerUnit: 0.07, unit: 'kg' },
      { ingredientId: 'i11', ingredientName: 'Chicken Broth', quantityPerUnit: 0.14, unit: 'L' },
      { ingredientId: 'i13', ingredientName: 'Salt', quantityPerUnit: 0.004, unit: 'kg' },
      { ingredientId: 'i15', ingredientName: 'Herbs & Spices Mix', quantityPerUnit: 0.003, unit: 'kg' },
      { ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i17', ingredientName: 'Lids', quantityPerUnit: 1, unit: 'units' },
      { ingredientId: 'i18', ingredientName: 'Labels', quantityPerUnit: 1, unit: 'units' },
    ],
  },
];

const MOCK_ORDERS: CustomerOrder[] = [
  {
    id: 'o1', orderNumber: 'ORD-2026-001',
    customerId: 'c1', customerName: 'SuperMart Stores',
    items: [
      { productId: 'p1', productName: 'Canned Tomato Soup', quantity: 400, unit: 'cans', pricePerUnit: 2.1 },
      { productId: 'p2', productName: 'Canned Beef Stew', quantity: 200, unit: 'cans', pricePerUnit: 3.2 },
    ],
    totalValue: 400 * 2.1 + 200 * 3.2, status: 'in-production',
    orderDate: daysAgo(20), dueDate: daysFromNow(5), shipmentDate: null,
    productionProgress: 65, isDelayed: false, notes: 'Priority order.',
  },
  {
    id: 'o2', orderNumber: 'ORD-2026-002',
    customerId: 'c3', customerName: 'EuroDelicious GmbH',
    items: [
      { productId: 'p3', productName: 'Canned Chicken & Rice', quantity: 300, unit: 'cans', pricePerUnit: 2.8 },
      { productId: 'p5', productName: 'Canned Minestrone Soup', quantity: 200, unit: 'cans', pricePerUnit: 2.4 },
    ],
    totalValue: 300 * 2.8 + 200 * 2.4, status: 'shipped',
    orderDate: daysAgo(30), dueDate: daysAgo(2), shipmentDate: daysAgo(3),
    productionProgress: 100, isDelayed: false, notes: '',
  },
  {
    id: 'o3', orderNumber: 'ORD-2026-003',
    customerId: 'c4', customerName: 'Pacific Pantry Ltd',
    items: [
      { productId: 'p4', productName: 'Canned Vegetable Medley', quantity: 450, unit: 'cans', pricePerUnit: 2.2 },
    ],
    totalValue: 450 * 2.2, status: 'in-production',
    orderDate: daysAgo(18), dueDate: daysAgo(1), shipmentDate: null,
    productionProgress: 40, isDelayed: true, notes: 'Ingredient shortage causing delay.',
  },
  {
    id: 'o4', orderNumber: 'ORD-2026-004',
    customerId: 'c5', customerName: 'NorthWest Provisions',
    items: [
      { productId: 'p1', productName: 'Canned Tomato Soup', quantity: 200, unit: 'cans', pricePerUnit: 2.1 },
    ],
    totalValue: 200 * 2.1, status: 'ready',
    orderDate: daysAgo(12), dueDate: daysFromNow(3), shipmentDate: null,
    productionProgress: 100, isDelayed: false, notes: 'Ready for pickup.',
  },
  {
    id: 'o5', orderNumber: 'ORD-2026-005',
    customerId: 'c2', customerName: 'QuickShop Wholesale',
    items: [
      { productId: 'p2', productName: 'Canned Beef Stew', quantity: 400, unit: 'cans', pricePerUnit: 3.2 },
      { productId: 'p3', productName: 'Canned Chicken & Rice', quantity: 500, unit: 'cans', pricePerUnit: 2.8 },
    ],
    totalValue: 400 * 3.2 + 500 * 2.8, status: 'pending',
    orderDate: daysAgo(3), dueDate: daysFromNow(10), shipmentDate: null,
    productionProgress: 0, isDelayed: false, notes: '',
  },
  {
    id: 'o6', orderNumber: 'ORD-2026-006',
    customerId: 'c6', customerName: 'Canned Goods Direct',
    items: [
      { productId: 'p5', productName: 'Canned Minestrone Soup', quantity: 500, unit: 'cans', pricePerUnit: 2.4 },
    ],
    totalValue: 500 * 2.4, status: 'in-production',
    orderDate: daysAgo(10), dueDate: daysFromNow(8), shipmentDate: null,
    productionProgress: 30, isDelayed: false, notes: '',
  },
  {
    id: 'o7', orderNumber: 'ORD-2026-007',
    customerId: 'c7', customerName: 'HealthFirst Foods',
    items: [
      { productId: 'p3', productName: 'Canned Chicken & Rice', quantity: 250, unit: 'cans', pricePerUnit: 2.8 },
    ],
    totalValue: 250 * 2.8, status: 'in-production',
    orderDate: daysAgo(15), dueDate: daysFromNow(2), shipmentDate: null,
    productionProgress: 88, isDelayed: false, notes: 'On track.',
  },
  {
    id: 'o8', orderNumber: 'ORD-2026-008',
    customerId: 'c8', customerName: 'GlobalEats Corp',
    items: [
      { productId: 'p1', productName: 'Canned Tomato Soup', quantity: 100, unit: 'cans', pricePerUnit: 2.1 },
      { productId: 'p6', productName: 'Canned Corn Chowder', quantity: 100, unit: 'cans', pricePerUnit: 2.6 },
    ],
    totalValue: 100 * 2.1 + 100 * 2.6, status: 'delivered',
    orderDate: daysAgo(40), dueDate: daysAgo(5), shipmentDate: daysAgo(7),
    productionProgress: 100, isDelayed: false, notes: '',
  },
  {
    id: 'o9', orderNumber: 'ORD-2026-009',
    customerId: 'c9', customerName: 'Urban Table Inc',
    items: [
      { productId: 'p6', productName: 'Canned Corn Chowder', quantity: 100, unit: 'cans', pricePerUnit: 2.6 },
    ],
    totalValue: 100 * 2.6, status: 'pending',
    orderDate: daysAgo(1), dueDate: daysFromNow(14), shipmentDate: null,
    productionProgress: 0, isDelayed: false, notes: '',
  },
  {
    id: 'o10', orderNumber: 'ORD-2026-010',
    customerId: 'c1', customerName: 'SuperMart Stores',
    items: [
      { productId: 'p5', productName: 'Canned Minestrone Soup', quantity: 200, unit: 'cans', pricePerUnit: 2.4 },
      { productId: 'p3', productName: 'Canned Chicken & Rice', quantity: 450, unit: 'cans', pricePerUnit: 2.8 },
    ],
    totalValue: 200 * 2.4 + 450 * 2.8, status: 'in-production',
    orderDate: daysAgo(25), dueDate: daysAgo(3), shipmentDate: null,
    productionProgress: 70, isDelayed: true, notes: 'Production behind schedule due to equipment maintenance.',
  },
  {
    id: 'o11', orderNumber: 'ORD-2026-011',
    customerId: 'c2', customerName: 'QuickShop Wholesale',
    items: [
      { productId: 'p1', productName: 'Canned Tomato Soup', quantity: 300, unit: 'cans', pricePerUnit: 2.1 },
    ],
    totalValue: 300 * 2.1, status: 'shipped',
    orderDate: daysAgo(22), dueDate: daysAgo(1), shipmentDate: daysAgo(2),
    productionProgress: 100, isDelayed: false, notes: '',
  },
  {
    id: 'o12', orderNumber: 'ORD-2026-012',
    customerId: 'c6', customerName: 'Canned Goods Direct',
    items: [
      { productId: 'p2', productName: 'Canned Beef Stew', quantity: 200, unit: 'cans', pricePerUnit: 3.2 },
    ],
    totalValue: 200 * 3.2, status: 'pending',
    orderDate: daysAgo(2), dueDate: daysFromNow(7), shipmentDate: null,
    productionProgress: 0, isDelayed: false, notes: '',
  },
];

const MOCK_INGREDIENT_ORDERS: IngredientOrder[] = [
  {
    id: 'po1', poNumber: 'PO-2026-001', ingredientId: 'i2', ingredientName: 'Beef (ground)',
    supplierId: 's2', supplierName: 'MeatFirst Inc', quantity: 500, unit: 'kg',
    pricePerUnit: 8.5, totalValue: 4250, status: 'in-transit',
    orderDate: daysAgo(8), expectedDelivery: daysFromNow(3), actualDelivery: null, isDelayed: false,
  },
  {
    id: 'po2', poNumber: 'PO-2026-002', ingredientId: 'i12', ingredientName: 'Beef Broth',
    supplierId: 's2', supplierName: 'MeatFirst Inc', quantity: 800, unit: 'L',
    pricePerUnit: 1.8, totalValue: 1440, status: 'pending',
    orderDate: daysAgo(1), expectedDelivery: daysFromNow(10), actualDelivery: null, isDelayed: false,
  },
  {
    id: 'po3', poNumber: 'PO-2026-003', ingredientId: 'i1', ingredientName: 'Tomatoes',
    supplierId: 's1', supplierName: 'Fresh Farms Co', quantity: 2000, unit: 'kg',
    pricePerUnit: 0.8, totalValue: 1600, status: 'in-transit',
    orderDate: daysAgo(5), expectedDelivery: daysAgo(2), actualDelivery: null, isDelayed: true,
  },
  {
    id: 'po4', poNumber: 'PO-2026-004', ingredientId: 'i18', ingredientName: 'Labels',
    supplierId: 's4', supplierName: 'Packaging Solutions Ltd', quantity: 10000, unit: 'units',
    pricePerUnit: 0.03, totalValue: 300, status: 'pending',
    orderDate: daysAgo(2), expectedDelivery: daysFromNow(7), actualDelivery: null, isDelayed: false,
  },
  {
    id: 'po5', poNumber: 'PO-2026-005', ingredientId: 'i7', ingredientName: 'Onions',
    supplierId: 's6', supplierName: 'Valley Vegetables', quantity: 1000, unit: 'kg',
    pricePerUnit: 0.4, totalValue: 400, status: 'delivered',
    orderDate: daysAgo(15), expectedDelivery: daysAgo(5), actualDelivery: daysAgo(5), isDelayed: false,
  },
  {
    id: 'po6', poNumber: 'PO-2026-006', ingredientId: 'i11', ingredientName: 'Chicken Broth',
    supplierId: 's2', supplierName: 'MeatFirst Inc', quantity: 600, unit: 'L',
    pricePerUnit: 1.5, totalValue: 900, status: 'in-transit',
    orderDate: daysAgo(3), expectedDelivery: daysFromNow(5), actualDelivery: null, isDelayed: false,
  },
  {
    id: 'po7', poNumber: 'PO-2026-007', ingredientId: 'i4', ingredientName: 'Corn (kernels)',
    supplierId: 's3', supplierName: 'GrainWorld LLC', quantity: 800, unit: 'kg',
    pricePerUnit: 1.1, totalValue: 880, status: 'pending',
    orderDate: new Date(), expectedDelivery: daysFromNow(14), actualDelivery: null, isDelayed: false,
  },
  {
    id: 'po8', poNumber: 'PO-2026-008', ingredientId: 'i16', ingredientName: 'Steel Cans (425ml)',
    supplierId: 's4', supplierName: 'Packaging Solutions Ltd', quantity: 20000, unit: 'units',
    pricePerUnit: 0.12, totalValue: 2400, status: 'in-transit',
    orderDate: daysAgo(10), expectedDelivery: daysAgo(2), actualDelivery: null, isDelayed: true,
  },
];

// ─── Service ───────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ErpDataService {
  private readonly platformId = inject(PLATFORM_ID);

  private _customers$ = new BehaviorSubject<Customer[]>(structuredClone(MOCK_CUSTOMERS));
  private _suppliers$ = new BehaviorSubject<Supplier[]>(structuredClone(MOCK_SUPPLIERS));
  private _products$ = new BehaviorSubject<Product[]>(structuredClone(MOCK_PRODUCTS));
  private _ingredients$ = new BehaviorSubject<Ingredient[]>(structuredClone(MOCK_INGREDIENTS));
  private _customerOrders$ = new BehaviorSubject<CustomerOrder[]>(structuredClone(MOCK_ORDERS));
  private _ingredientOrders$ = new BehaviorSubject<IngredientOrder[]>(structuredClone(MOCK_INGREDIENT_ORDERS));
  private _alerts$ = new BehaviorSubject<ErpAlert[]>([]);

  readonly customers$ = this._customers$.asObservable();
  readonly suppliers$ = this._suppliers$.asObservable();
  readonly products$ = this._products$.asObservable();
  readonly ingredients$ = this._ingredients$.asObservable();
  readonly customerOrders$ = this._customerOrders$.asObservable();
  readonly ingredientOrders$ = this._ingredientOrders$.asObservable();
  readonly alerts$ = this._alerts$.asObservable();

  readonly kpis$ = combineLatest([
    this._customers$, this._suppliers$, this._customerOrders$,
    this._ingredientOrders$, this._ingredients$,
  ]).pipe(
    map(([customers, suppliers, orders, poOrders, ingredients]) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        totalActiveOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
        ordersShippedThisMonth: orders.filter(o =>
          (o.status === 'shipped' || o.status === 'delivered') && o.shipmentDate && o.shipmentDate >= startOfMonth
        ).length,
        pendingIngredientOrders: poOrders.filter(po => ['pending', 'confirmed', 'in-transit'].includes(po.status)).length,
        lowInventoryIngredients: ingredients.filter(i => i.isLow).length,
        totalCustomers: customers.filter(c => c.status === 'active').length,
        totalSuppliers: suppliers.filter(s => s.status === 'active').length,
        delayedOrders: orders.filter(o => o.isDelayed).length,
        delayedShipments: poOrders.filter(po => po.isDelayed).length,
      } as DashboardKPIs;
    })
  );

  constructor() {
    this.generateAlerts();
    if (isPlatformBrowser(this.platformId)) {
      this.startProductionSimulation();
    }
  }

  private generateAlerts(): void {
    const alerts: ErpAlert[] = [];
    const ingredients = this._ingredients$.value;
    const orders = this._customerOrders$.value;
    const poOrders = this._ingredientOrders$.value;

    ingredients.filter(i => i.isLow).forEach(i => {
      alerts.push({
        id: 'a-' + uid(),
        type: 'low-inventory',
        message: `${i.name} stock (${i.currentStock} ${i.unit}) is below reorder threshold (${i.reorderThreshold} ${i.unit}).`,
        severity: 'warning',
        entityId: i.id,
        entityName: i.name,
        date: new Date(),
      });
    });

    orders.filter(o => o.isDelayed).forEach(o => {
      alerts.push({
        id: 'a-' + uid(),
        type: 'delayed-order',
        message: `Order ${o.orderNumber} for ${o.customerName} is past its due date. Production at ${o.productionProgress}%.`,
        severity: 'error',
        entityId: o.id,
        entityName: o.orderNumber,
        date: o.dueDate,
      });
    });

    poOrders.filter(po => po.isDelayed).forEach(po => {
      alerts.push({
        id: 'a-' + uid(),
        type: 'delayed-shipment',
        message: `Supplier shipment ${po.poNumber} (${po.ingredientName} from ${po.supplierName}) is overdue. Expected: ${po.expectedDelivery.toLocaleDateString()}.`,
        severity: 'error',
        entityId: po.id,
        entityName: po.poNumber,
        date: po.expectedDelivery,
      });
    });

    this._alerts$.next(alerts);
  }

  private startProductionSimulation(): void {
    setInterval(() => {
      const orders = this._customerOrders$.value.map(o => {
        if (o.status === 'in-production' && o.productionProgress < 100) {
          const newProgress = Math.min(100, o.productionProgress + Math.floor(Math.random() * 2) + 1);
          const wasDelayed = o.isDelayed;
          const isNowDelayed = new Date() > o.dueDate;
          return { ...o, productionProgress: newProgress, isDelayed: isNowDelayed };
        }
        return o;
      });
      this._customerOrders$.next(orders);
    }, 4000);
  }

  // ── Customers ──────────────────────────────────────────────────
  addCustomer(c: Omit<Customer, 'id'>): void {
    const all = [...this._customers$.value, { ...c, id: 'c' + uid() }];
    this._customers$.next(all);
  }
  updateCustomer(c: Customer): void {
    this._customers$.next(this._customers$.value.map(x => x.id === c.id ? c : x));
  }
  deleteCustomer(id: string): void {
    this._customers$.next(this._customers$.value.filter(x => x.id !== id));
  }

  // ── Suppliers ──────────────────────────────────────────────────
  addSupplier(s: Omit<Supplier, 'id'>): void {
    const all = [...this._suppliers$.value, { ...s, id: 's' + uid() }];
    this._suppliers$.next(all);
  }
  updateSupplier(s: Supplier): void {
    this._suppliers$.next(this._suppliers$.value.map(x => x.id === s.id ? s : x));
  }
  deleteSupplier(id: string): void {
    this._suppliers$.next(this._suppliers$.value.filter(x => x.id !== id));
  }

  // ── Ingredients ────────────────────────────────────────────────
  addIngredient(i: Omit<Ingredient, 'id' | 'isLow'>): void {
    const ingredient: Ingredient = { ...i, id: 'i' + uid(), isLow: i.currentStock <= i.reorderThreshold };
    this._ingredients$.next([...this._ingredients$.value, ingredient]);
    this.generateAlerts();
  }
  updateIngredient(i: Ingredient): void {
    const updated = { ...i, isLow: i.currentStock <= i.reorderThreshold };
    this._ingredients$.next(this._ingredients$.value.map(x => x.id === i.id ? updated : x));
    this.generateAlerts();
  }

  // ── Ingredient Orders ──────────────────────────────────────────
  addIngredientOrder(order: Omit<IngredientOrder, 'id' | 'poNumber' | 'isDelayed' | 'actualDelivery'>): void {
    const num = String(this._ingredientOrders$.value.length + 1).padStart(3, '0');
    const po: IngredientOrder = {
      ...order, id: 'po' + uid(),
      poNumber: `PO-2026-${num}`, actualDelivery: null, isDelayed: false,
    };
    this._ingredientOrders$.next([...this._ingredientOrders$.value, po]);
  }

  // ── Bulk create ingredient orders (split order) ─────────────────
  createSplitIngredientOrders(
    ingredientId: string,
    splits: SplitOrderEntry[],
    baseExpectedDelivery: Date
  ): void {
    const ingredient = this._ingredients$.value.find(i => i.id === ingredientId);
    if (!ingredient) return;
    const poOrders = [...this._ingredientOrders$.value];
    splits.filter(s => s.selected && s.quantity && s.quantity > 0).forEach(s => {
      const num = String(poOrders.length + 1).padStart(3, '0');
      poOrders.push({
        id: 'po' + uid(), poNumber: `PO-2026-${num}`,
        ingredientId, ingredientName: ingredient.name,
        supplierId: s.supplierId, supplierName: s.supplierName,
        quantity: s.quantity!, unit: ingredient.unit,
        pricePerUnit: s.pricePerUnit,
        totalValue: (s.quantity ?? 0) * s.pricePerUnit,
        status: 'pending', orderDate: new Date(),
        expectedDelivery: s.expectedDelivery ?? baseExpectedDelivery,
        actualDelivery: null, isDelayed: false,
      });
    });
    this._ingredientOrders$.next(poOrders);
  }

  // ── Customer Orders ────────────────────────────────────────────
  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this._customerOrders$.value.map(o => {
      if (o.id !== orderId) return o;
      const shipmentDate = status === 'shipped' ? new Date() : o.shipmentDate;
      const progress = ['shipped', 'delivered'].includes(status) ? 100 : o.productionProgress;
      return { ...o, status, shipmentDate, productionProgress: progress };
    });
    this._customerOrders$.next(orders);
  }

  getSupplierById(id: string): Supplier | undefined {
    return this._suppliers$.value.find(s => s.id === id);
  }

  getIngredientById(id: string): Ingredient | undefined {
    return this._ingredients$.value.find(i => i.id === id);
  }

  getSuppliersForIngredient(ingredientId: string): Supplier[] {
    const ingredient = this._ingredients$.value.find(i => i.id === ingredientId);
    if (!ingredient) return [];
    return this._suppliers$.value.filter(s => s.ingredientIds.includes(ingredientId));
  }
}
