import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ShopperGuideLine() {
  const steps = [
    {
      title: "Step 1: Create Order",
      desc: "After logging in, go to your dashboard and open the shipping form. Select the shipping type (Buy for Me or Ship for Me), add your shipping address, then add the products you want to ship. If any additional services are required, select them and submit your request.",
      color: "bg-blue-50 border-blue-400",
    },
    {
      title: "Step 2: Approve Shipper Offer",
      desc: "Once your request is submitted, multiple shippers may send offers. Review each offer carefully and select the one that best fits your requirements and budget. Approve the most suitable offer to proceed.",
      color: "bg-green-50 border-green-400",
    },
    {
      title: "Step 3: Make Payment",
      desc: "After approving the offer, you will proceed to the payment step. Complete the payment securely. Once the payment is successful, your order will move to the 'In Progress' state.",
      color: "bg-yellow-50 border-yellow-400",
    },
    {
      title: "Step 4: Track Your Order",
      desc: "Once the shipper starts processing your order, you can track it from the order tracking page. Here you will see updates such as product purchase status, tracking numbers, tracking links, and uploaded receipts.",
      color: "bg-purple-50 border-purple-400",
    },
    {
      title: "Step 5: Fill Customs Declaration Form",
      desc: "After the shipper uploads all tracking details, you must complete the Customs Declaration Form. This form is required for international shipping and includes information such as product description, value of goods, and shipment purpose to ensure smooth customs clearance.",
      color: "bg-indigo-50 border-indigo-400",
    },
    {
      title: "Step 6: Order Completion",
      desc: "Once the shipment process is finished and all requirements are completed, your order will be marked as completed. You can review all tracking details and delivery history from your dashboard.",
      color: "bg-red-50 border-red-400",
    },
  ];

  return (
    <>
      <PageMeta
        title="Delivering Parcel | Shopper Guideline"
        description="Step-by-step guide for shoppers to create orders and track shipments."
      />
      <PageBreadcrumb pageTitle="Shopper Guideline" />

      <div className="max-w-5xl mx-auto p-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Shopper Guideline
          </h1>
          <p className="text-gray-600 mt-2">
            Follow these simple steps to create a shipping request, approve offers, complete payment,
            track your shipment, and finalize your order.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`p-6 border-l-4 rounded-lg shadow-sm ${step.color}`}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {step.title}
              </h2>
              <p className="text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Summary</h2>
          <p className="text-gray-700 mt-3">
            The process is simple: create your order, review and approve the best shipper offer,
            complete the payment, track your shipment updates, fill the required customs declaration
            form, and finally receive your parcel once the order is completed.
          </p>
        </div>

      </div>
    </>
  );
}