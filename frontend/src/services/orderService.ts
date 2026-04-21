import { ApiHelper } from "../utils/ApiHelper";

export const getOrderDetail = async (orderId: string) => {
  const response = await ApiHelper("GET",`/order/${orderId}/get-order-detail`);

  return response.data;
};