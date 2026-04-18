# Simak Fresh — Cart System API Guide
> For Flutter developers integrating the same cart backend.

---

## Overview

The cart is **server-side** — every cart belongs to the authenticated user on the backend. There is no local-only cart. All actions (add, update, remove) hit the API immediately.

Authentication is via **token/session** — every request must include the user's auth token in the header.

```
Authorization: Bearer <token>
```

Base URL: `https://simakfresh.ae/api`

---

## State the Flutter App Must Track

Think of this as your equivalent of Redux state:

```
cart: {
  items: [
    {
      id: 465,              // cart item ID (from backend)
      product_id: 23,       // product ID
      name: "Sultan Ibrahim",
      price: 89.99,
      discount_price: 79.99,
      final_price: 79.99,   // use this for display & total calculation
      image: "https://...",
      quantity: 3,
      stock: 54,            // max the user can add
      subtotal: 239.97
    }
  ],
  total_price: 239.97,
  total_items: 3,
  isLoading: false,
  updatingItemIds: []       // which items have a pending quantity update
}
```

---

## API Endpoints

### 1. Fetch Cart
Fetch the current logged-in user's cart. Call this when:
- Cart screen opens
- App comes back to foreground
- After any add/remove/update action

```
GET /cart/my_cart/
```

**Response:**
```json
{
  "id": 276,
  "user": 421,
  "items": [
    {
      "id": 465,
      "product": 23,
      "product_details": {
        "id": 23,
        "name": "Sultan Ibrahim",
        "price": "89.99",
        "discount_price": "79.99",
        "final_price": "79.99",
        "stock": 54,
        "is_available": true,
        "image": "https://simakfresh.ae/media/products/sultanibrahim.png",
        "sku": "FS-COCKTAIL-001",
        "unit": "piece"
      },
      "quantity": 3,
      "subtotal": "239.97",
      "created_at": "2026-04-17T15:10:08Z",
      "updated_at": "2026-04-17T15:13:34Z"
    }
  ],
  "total_price": "239.97",
  "total_items": 3
}
```

**Important:** `price` and `total_price` come as strings from the backend — parse to double/float before calculations.

---

### 2. Add Item to Cart
Call this when user taps "Add to Cart" on a product.

```
POST /cart/add_item/
Content-Type: application/json

{
  "product": 23,
  "quantity": 1
}
```

- If the product already exists in cart, backend **adds** to existing quantity
- After success → re-fetch cart (`GET /cart/my_cart/`)

---

### 3. Update Item Quantity
Call this when user taps `+` or `−` in the cart.

```
POST /cart/update_item_quantity/
Content-Type: application/json

{
  "product": 23,
  "quantity": 5
}
```

- Send the **final desired quantity**, not a delta (+1 or -1)
- If quantity exceeds stock, backend should reject it
- After success → update local state with confirmed quantity

**UX pattern used in web app:**
1. User taps `+` → show spinner on that item immediately, disable both buttons
2. Wait 400ms (debounce — if user taps again, reset timer)
3. Fire the API with the latest quantity
4. On success → hide spinner, show confirmed quantity
5. On failure → hide spinner, revert to previous quantity

---

### 4. Remove Item
Call this when user taps the delete/trash button.

```
POST /cart/remove_item/
Content-Type: application/json

{
  "product": 23
}
```

- After success → re-fetch cart

---

### 5. Clear Entire Cart
Call this after a successful order placement.

```
POST /cart/clear/
```

---

## Full Flow Diagrams

### Add to Cart
```
User taps "Add to Cart" on product page
            ↓
POST /cart/add_item/ { product: id, quantity: 1 }
            ↓
       Success?
      ↙        ↘
   Yes           No
    ↓             ↓
GET /cart/my_cart/   Show error toast
    ↓
Update local cart state
Show cart badge count updated
```

---

### Update Quantity (+ / − buttons)
```
User taps + (qty was 3, now wants 4)
            ↓
Show spinner on that item
Disable + and − buttons
            ↓
Wait 400ms
(if user taps again before 400ms → reset timer, cancel previous call)
            ↓
POST /cart/update_item_quantity/ { product: id, quantity: 4 }
            ↓
       Success?
      ↙        ↘
   Yes           No
    ↓             ↓
Update qty to 4    Revert to 3
Hide spinner       Hide spinner
Re-enable buttons  Show error
```

---

### Stock Limit Check
```
item.quantity >= item.stock
            ↓
Disable + button
Show message: "That's our full catch! Only {stock} fresh from Simak."
```

Never let the user request more than `product_details.stock`.

---

## Price Calculation Logic

```dart
// Parse strings to double
double price        = double.parse(item["product_details"]["price"]);
double discountPrice = double.parse(item["product_details"]["discount_price"] ?? "0");
double finalPrice   = double.parse(item["product_details"]["final_price"]);
int    quantity     = item["quantity"];

double subtotal     = finalPrice * quantity;  // use final_price, not price

// Cart total
double cartTotal = items.fold(0, (sum, item) => sum + (finalPrice * quantity));
```

Always use `final_price` for display and totals — this already reflects any discount.

---

## What the Web App Uses (Redux equivalent for Flutter)

| Redux Concept | Flutter Equivalent |
|---|---|
| `cartSlice` state | Your `CartProvider` / `CartBloc` / `CartController` |
| `fetchCartRequest` action | Call `fetchCart()` and set loading state |
| `updateQuantitySuccess` action | Update item quantity in local state |
| `updatingItemIds` array | Set of item IDs currently awaiting API response |
| `selectCartItems` selector | Getter on your cart model |
| `selectCartTotal` selector | Computed total from items |

---

## Error Cases to Handle

| Scenario | What to do |
|---|---|
| User not authenticated | Redirect to login before any cart action |
| Stock exceeded | Disable `+` button when `quantity >= stock` |
| Add/update API fails | Show toast, revert UI state |
| Item out of stock (`is_available: false`) | Disable "Add to Cart" button on product page |
| Empty cart | Show empty state screen |

---

## Summary for Flutter Developer

1. **On cart screen open** → `GET /cart/my_cart/` and render
2. **Add to cart** → `POST /cart/add_item/` then re-fetch
3. **Tap +** → debounce 400ms → `POST /cart/update_item_quantity/` with final qty, show spinner while waiting
4. **Tap −** → same as above
5. **Tap delete** → `POST /cart/remove_item/` then re-fetch
6. **After order placed** → `POST /cart/clear/`
7. **Stock check** → always check `product_details.stock` before allowing `+`
8. **All requests** → include `Authorization: Bearer <token>` header
