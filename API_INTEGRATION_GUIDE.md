# Admin API Integration Guide

This guide explains the newly integrated APIs and components for managing delivery preferences, discounts, and orders in your e-commerce platform.

## Table of Contents

- [API Services](#api-services)
- [Components](#components)
- [Hooks](#hooks)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## API Services

### ordersApi - Order Management

**Location:** `src/features/admin/orders/ordersApi.ts`

#### Methods

#### `Dashboard Analytics`
```typescript
const analytics = await ordersApi.getDashboardAnalytics();
// Returns: {
//   total_users,
//   active_users,
//   total_orders,
//   completed_orders,
//   total_revenue,
//   average_order_value,
//   cart_conversion_rate,
//   top_products
// }
```

#### `Update Order Status`
```typescript
const updatedOrder = await ordersApi.updateStatus(
  orderId,
  "SHIPPED",
  "Order is on the way"
);
```

**Valid Statuses:** `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `RETURNED`

#### `Estimate Delivery`
```typescript
const estimation = await ordersApi.estimateDelivery();
// Returns: {
//   earliest_delivery_date,
//   max_delivery_days,
//   items_breakdown
// }
```

### tierApi - Tier Management

**Location:** `src/features/admin/products/tierApi.ts`

#### Delivery Tiers

Define quantity-based delivery timeframes per product.

```typescript
// List delivery tiers for a product
const tiers = await tierApi.deliveryTiers.list(productId);

// Create a new delivery tier
const tier = await tierApi.deliveryTiers.create({
  product: productId,
  min_quantity: 10,
  delivery_days: 2
});

// Update delivery tier
const updated = await tierApi.deliveryTiers.update(tierId, {
  delivery_days: 3
});

// Delete delivery tier
await tierApi.deliveryTiers.delete(tierId);
```

#### Discount Tiers

Apply percentage-based discounts based on quantity ordered.

```typescript
// List discount tiers for a product
const discounts = await tierApi.discountTiers.list(productId);

// Create a new discount tier
const discount = await tierApi.discountTiers.create({
  product: productId,
  min_quantity: 10,
  discount_percentage: 10.00
});

// Update discount tier
const updated = await tierApi.discountTiers.update(discountId, {
  discount_percentage: 15.00
});

// Delete discount tier
await tierApi.discountTiers.delete(discountId);
```

### productsApi - Extended Methods

**Location:** `src/features/admin/products/productApi.ts`

These methods are now available on the productsApi object:

```typescript
// Delivery Tiers (replaces tierApi methods)
await productsApi.listDeliveryTiers(productId);
await productsApi.createDeliveryTier(payload);
await productsApi.updateDeliveryTier(id, payload);
await productsApi.deleteDeliveryTier(id);

// Discount Tiers (replaces tierApi methods)
await productsApi.listDiscountTiers(productId);
await productsApi.createDiscountTier(payload);
await productsApi.updateDiscountTier(id, payload);
await productsApi.deleteDiscountTier(id);
```

## Components

### DeliveryTiersManager

**Location:** `src/features/admin/products/DeliveryTiersManager.tsx`

Manage delivery tiers for a product with a user-friendly table and form.

#### Props

```typescript
interface DeliveryTiersManagerProps {
  productId: number;
  onTiersChange?: (tiers: DeliveryTierDto[]) => void;
}
```

#### Usage

```tsx
import DeliveryTiersManager from '@/features/admin/products/DeliveryTiersManager';

export function EditProductPage() {
  return (
    <div>
      {/* ... other product fields ... */}
      <DeliveryTiersManager 
        productId={productId}
        onTiersChange={(tiers) => console.log('Tiers updated:', tiers)}
      />
    </div>
  );
}
```

#### Features

- Display existing tiers in a sortable table
- Add new tiers with min_quantity and delivery_days
- Delete tiers with confirmation
- Real-time tier list updates
- Error handling and loading states

### DiscountTiersManager

**Location:** `src/features/admin/products/DiscountTiersManager.tsx`

Manage quantity-based discounts for a product.

#### Props

```typescript
interface DiscountTiersManagerProps {
  productId: number;
  finalPrice: string | number;
  onTiersChange?: (tiers: DiscountTierDto[]) => void;
}
```

#### Usage

```tsx
import DiscountTiersManager from '@/features/admin/products/DiscountTiersManager';

export function EditProductPage() {
  const [product, setProduct] = useState<ProductDto>();

  return (
    <div>
      {/* ... other fields ... */}
      <DiscountTiersManager 
        productId={product.id}
        finalPrice={product.final_price}
        onTiersChange={(tiers) => setProduct({...product, discount_tiers: tiers})}
      />
    </div>
  );
}
```

#### Features

- Display discount tiers with calculated unit prices (after discount)
- Preview final price after discount for new tiers
- Validate discount percentage (0-100%)
- Real-time calculations
- Tier management (add, delete)

### OrdersDashboard

**Location:** `src/features/admin/orders/OrdersDashboard.tsx`

Display analytics dashboard with key metrics and top products.

#### Usage

```tsx
import OrdersDashboard from '@/features/admin/orders/OrdersDashboard';

export function AdminDashboard() {
  return (
    <div className="p-6">
      <h1>Admin Dashboard</h1>
      <OrdersDashboard />
    </div>
  );
}
```

#### Displays

- Total Users / Active Users
- Total Orders / Completed Orders
- Total Revenue
- Average Order Value
- Cart Conversion Rate (with progress bar)
- Top Products Table (with sales and revenue)
- Auto-refresh functionality

### OrderStatusManager

**Location:** `src/features/admin/orders/OrderStatusManager.tsx`

Update order status with notes and view status history.

#### Props

```typescript
interface OrderStatusManagerProps {
  order: OrderDto;
  onStatusUpdate?: (updatedOrder: OrderDto) => void;
}
```

#### Usage

```tsx
import OrderStatusManager from '@/features/admin/orders/OrderStatusManager';

export function OrderDetailsPage() {
  const [order, setOrder] = useState<OrderDto>();

  return (
    <div>
      {/* ... order details ... */}
      <OrderStatusManager 
        order={order}
        onStatusUpdate={(updated) => setOrder(updated)}
      />
    </div>
  );
}
```

#### Features

- Dropdown selector for available statuses
- Optional notes field for status changes
- Status history timeline
- Success/error feedback
- Loading states
- Prevents updating to same status without notes

## Hooks

### useDeliveryEstimation

**Location:** `src/hooks/useDeliveryEstimation.ts`

Hook for fetching delivery estimation for the current cart.

#### Usage

```tsx
import { useDeliveryEstimation } from '@/hooks/useDeliveryEstimation';

export function CheckoutFlow() {
  const { estimation, loading, error, refetch } = useDeliveryEstimation();

  if (loading) return <div>Calculating delivery date...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Estimated delivery: {estimation?.earliest_delivery_date}</p>
      <p>Max delivery days: {estimation?.max_delivery_days}</p>
      
      {estimation?.items_breakdown.map(item => (
        <div key={item.product_id}>
          <p>{item.product_name}</p>
          <p>Qty: {item.quantity}, Delivery: {item.delivery_days} days</p>
        </div>
      ))}
      
      <button onClick={() => refetch()}>Recalculate</button>
    </div>
  );
}
```

#### Return Value

```typescript
{
  estimation: DeliveryEstimationDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

## Usage Examples

### Example 1: Integrate Managers into Product Editor

```tsx
// EditProduct.tsx
import React, { useState, useEffect } from 'react';
import { productApi } from './productApi';
import DeliveryTiersManager from './DeliveryTiersManager';
import DiscountTiersManager from './DiscountTiersManager';

export function EditProduct() {
  const [product, setProduct] = useState<ProductDto>();
  
  useEffect(() => {
    const productId = new URLSearchParams(location.search).get('id');
    productApi.details(parseInt(productId!)).then(setProduct);
  }, []);

  if (!product) return <div>Loading...</div>;

  return (
    <form>
      {/* Basic product fields */}
      <input value={product.name} {...} />
      <input value={product.price} {...} />
      
      {/* Tier managers */}
      <DeliveryTiersManager 
        productId={product.id}
        onTiersChange={(tiers) => 
          setProduct({...product, delivery_tiers: tiers})
        }
      />
      
      <DiscountTiersManager 
        productId={product.id}
        finalPrice={product.final_price}
        onTiersChange={(tiers) => 
          setProduct({...product, discount_tiers: tiers})
        }
      />
    </form>
  );
}
```

### Example 2: Display Dashboard in Admin Panel

```tsx
// AdminHome.tsx
import React from 'react';
import OrdersDashboard from '@/features/admin/orders/OrdersDashboard';

export function AdminDashboard() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <OrdersDashboard />
    </div>
  );
}
```

### Example 3: Order Management

```tsx
// OrderDetails.tsx
import React, { useState, useEffect } from 'react';
import { ordersApi, OrderDto } from './ordersApi';
import OrderStatusManager from './OrderStatusManager';

export function OrderDetails({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<OrderDto>();

  useEffect(() => {
    ordersApi.details(orderId).then(setOrder);
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div>
      <h2>Order #{order.id}</h2>
      
      {/* Order items */}
      <div>
        {order.items.map(item => (
          <div key={item.id}>
            <p>{item.product_name}</p>
            <p>Qty: {item.quantity} × {item.price}</p>
          </div>
        ))}
      </div>

      {/* Status manager */}
      <OrderStatusManager 
        order={order}
        onStatusUpdate={setOrder}
      />
    </div>
  );
}
```

## Best Practices

### Delivery Tiers

1. **Avoid Overlapping:** Keep min_quantity values clear and non-overlapping
2. **Ascending Order:** Organize tiers by min_quantity ascending
3. **Fallback Usage:** Use `expected_delivery_time` only when no tiers apply
4. **Test Coverage:** After creation, test with quantities matching each tier

```tsx
// Good example
tiers = [
  { min_quantity: 1, delivery_days: 7 },
  { min_quantity: 10, delivery_days: 5 },
  { min_quantity: 50, delivery_days: 2 },
]
```

### Discount Tiers

1. **Progressive Discounts:** Increase discount % with quantity
2. **Avoid Exact Duplicates:** Don't create tiers with identical min_quantity
3. **Price Validation:** Ensure discounted price doesn't exceed original
4. **Percentage Limits:** Keep discounts between 0-100%

```tsx
// Good example
discounts = [
  { min_quantity: 5, discount_percentage: 5 },
  { min_quantity: 10, discount_percentage: 10 },
  { min_quantity: 20, discount_percentage: 15 },
]
```

### API Error Handling

Always handle errors gracefully:

```tsx
try {
  const data = await tierApi.deliveryTiers.create(payload);
  // Success
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error - show field-specific message
  } else if (error.response?.status === 403) {
    // Permission denied - show auth error
  } else {
    // Generic error
  }
}
```

### Performance Optimization

- Cache tier data in Redux/Context when possible
- Debounce tier updates when user is editing
- Pre-fetch analytics on admin dashboard load
- Use memoization for component rendering

```tsx
const cachedTiers = useMemo(() => tiers, [tiers]);
```

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/products/delivery-tiers/` | GET, POST | List/Create delivery tiers |
| `/api/products/delivery-tiers/{id}/` | PATCH, DELETE | Update/Delete tier |
| `/api/products/discount-tiers/` | GET, POST | List/Create discount tiers |
| `/api/products/discount-tiers/{id}/` | PATCH, DELETE | Update/Delete tier |
| `/api/orders/` | GET, POST | List/Create orders |
| `/api/orders/{id}/` | GET | Get order details |
| `/api/orders/{id}/admin_update_status/` | POST | Update order status |
| `/api/orders/dashboard_analytics/` | GET | Get dashboard analytics |
| `/api/orders/estimate_delivery/` | GET | Estimate delivery date |

## Troubleshooting

### Tiers Not Showing
- Verify productId is correct
- Check API response for errors
- Ensure user has admin permissions

### Delivery Estimation Fails
- Verify cart items are valid
- Check if delivery tiers are configured for products
- Ensure estimated dates are in future

### Status Updates Not Working
- Verify order exists
- Check if status is valid
- Ensure admin authentication is active

## Support

For issues or questions about these integrations, refer to:
- Backend API documentation
- Component prop interfaces
- API service method signatures
