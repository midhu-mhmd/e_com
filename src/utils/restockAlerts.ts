import type { ProductDto } from "../features/admin/products/productApi";

export interface RestockTrackableProduct
  extends Pick<ProductDto, "id" | "name" | "slug" | "image" | "stock" | "is_available"> {}

interface RestockSubscription {
  productId: number;
  subscribedAt: string;
}

export interface RestockAlert {
  title: string;
  message: string;
  actionUrl: string | null;
}

const STORAGE_PREFIX = "uae_ecom_restock_subscriptions_v1";

const storageKey = (userId: number | string | null | undefined) => `${STORAGE_PREFIX}:${userId ?? "guest"}`;

const readSubscriptions = (userId: number | string | null | undefined): RestockSubscription[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.productId === "number") : [];
  } catch {
    return [];
  }
};

const writeSubscriptions = (userId: number | string | null | undefined, subscriptions: RestockSubscription[]) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(subscriptions));
  } catch {
    // Ignore storage failures so restock alerts never block commerce flows.
  }
};

export const subscribeToRestock = (
  product: Pick<RestockTrackableProduct, "id" | "name" | "slug" | "image">,
  userId: number | string | null | undefined
): { created: boolean; subscription: RestockSubscription } => {
  const subscriptions = readSubscriptions(userId);
  const existing = subscriptions.find((item) => item.productId === product.id);
  if (existing) {
    return { created: false, subscription: existing };
  }

  const subscription: RestockSubscription = {
    productId: product.id,
    subscribedAt: new Date().toISOString(),
  };

  writeSubscriptions(userId, [...subscriptions, subscription]);
  return { created: true, subscription };
};

export const processRestockAlerts = <T extends RestockTrackableProduct>(
  products: T[],
  userId: number | string | null | undefined,
  createAlert: (product: T) => RestockAlert
): RestockAlert[] => {
  const subscriptions = readSubscriptions(userId);
  if (!subscriptions.length || !products.length) return [];

  const productMap = new Map<number, T>(products.map((product) => [product.id, product]));
  const remainingSubscriptions: RestockSubscription[] = [];
  const alerts: RestockAlert[] = [];

  for (const subscription of subscriptions) {
    const product = productMap.get(subscription.productId);
    const isRestocked = Boolean(product && product.is_available && product.stock > 0);

    if (!isRestocked || !product) {
      remainingSubscriptions.push(subscription);
      continue;
    }

    const alert = createAlert(product);
    alerts.push({
      title: alert.title,
      message: alert.message,
      actionUrl: alert.actionUrl ?? `/products/${product.id}`,
    });
  }

  if (remainingSubscriptions.length !== subscriptions.length) {
    writeSubscriptions(userId, remainingSubscriptions);
  }

  return alerts;
};
