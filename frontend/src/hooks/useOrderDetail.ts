import { useState, useEffect } from "react";
import { getOrderDetail } from "../services/orderService";

export interface PriceBreakdown {
  initial_price: number;
  offer_price: number;
  stripe_fee: number;
  service_fee: number;
  grand_total: number;
  selected_services: number;
  additional_services: number;
  total_payable: number;
}

export interface Location {
  country: string;
  state: string;
  city: string;
}

export interface ProductDetail {
  id: number;
  title: string;
  price: string;
  weight: string;
  product_url: string;
  tracking: any;
}

export interface ProductItem {
  id: number;
  quantity: number;
  price: string;
  weight: string;
  status: string;
  product: ProductDetail;
}
export interface ShippingType {
  id: number;
  slug: string;
  title: string;
}

export interface Service {
  service_id: number;
  title: string;
  price: string | null;
  description: string;
}

export interface Tracking {
  status: string;
  tracking_number: string;
  remarks: string | null;
  attachments: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  request_number: string;
  service_type: string | null;
  status: number;
  status_title: string;
  total_price: string;
  total_aprox_weight: string;
  price_breakdown: PriceBreakdown;
  ship_from: Location;
  ship_to: Location;
  products: ProductItem[];
  shipping_type: ShippingType;
  services: Service[];
  trackings: Tracking[];
  accepted_offer: any | null;
  customDeclaration: any | null;
  created_at: string;
}
const useOrderDetail = (orderId: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    
    setLoading(true);
    getOrderDetail(orderId)
      .then(res => setOrder(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  return { order, loading, error };
};

export default useOrderDetail;