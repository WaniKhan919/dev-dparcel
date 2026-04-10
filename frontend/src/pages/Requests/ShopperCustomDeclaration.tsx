import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";import CustomDeclarationView from "../Order/CustomDeclarationView";
export default function ShopperCustomDeclaration() {
  const location = useLocation();
  const { order_id } = location.state || {};

  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomDeclaration = async () => {
    if (!order_id) return;
    setLoading(true);
    setError(null);

    try {
      const response = await ApiHelper("GET", `/order/get-order-detail/${order_id}`);
      if (response.status === 200 && response.data?.data) {
        setOrderData(response.data.data);
      } else {
        setError(response.data?.message || "Failed to fetch custom declaration");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomDeclaration();
  }, []);

  return (
    <>
      <PageMeta title="Delivering Parcel | Custom Declaration" description="" />
      <PageBreadcrumb pageTitle="Custom Declaration" />

      {loading && (
        <p className="text-sm text-gray-400 py-10 text-center">Loading...</p>
      )}
      {error && (
        <p className="text-sm text-red-500 py-4 text-center">{error}</p>
      )}

      {orderData?.customDeclaration && (
        <CustomDeclarationView
          data={orderData.customDeclaration}
          orderData={orderData}
        />
      )}
    </>
  );
}