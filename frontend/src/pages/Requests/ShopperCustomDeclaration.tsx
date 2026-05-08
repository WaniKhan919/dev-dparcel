import { useLocation } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { ApiHelper } from "../../utils/ApiHelper";import CustomDeclarationView from "../Order/CustomDeclarationView";
import useOrderDetail from "../../hooks/useOrderDetail";
export default function ShopperCustomDeclaration() {
  const location = useLocation();
  const { order_id } = location.state || {};

  const { order: orderData, loading, error } = useOrderDetail(order_id);

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