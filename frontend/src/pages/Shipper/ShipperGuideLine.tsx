import { Link } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ShipperGuideLine() {


  const steps = [
    {
      title: "Step 1: Create Account & Update Profile",
      desc: "After creating your account, you must complete your profile. This step is mandatory before you can start offering shipping services. Make sure your personal information and service details are accurate."
    },
    {
      title: "Step 2: Select Service Areas",
      desc: "Select the countries where you provide shipping services. These selected service areas determine which shopper requests will appear in your dashboard."
    },
    {
      title: "Step 3: Default Subscription & Upgrade Plan",
      desc: (
        <>
          When a shipper creates an account, a default subscription plan is automatically assigned.
          This plan includes limited orders and limited service locations. If you want to handle more
          orders or expand your service areas, you can upgrade your subscription from the {" "}
          <Link
            to="/shipper/subscription"
            className="text-indigo-600 font-semibold underline hover:text-indigo-800"
          >
            Subscription Page
          </Link>.
        </>
      )
    },
    {
      title: "Step 4: Review Shopper Requests & Place Offer",
      desc: "Once your service areas are selected, shopper requests from those locations will be visible to you. You can review the request details and place your offer based on your service cost and availability."
    },
    {
      title: "Step 5: Wait for Offer Approval & Payment",
      desc: "After placing an offer, the shopper will review all received offers. If your offer is accepted, you will wait for the shopper to complete the payment. Once the payment is successfully processed, the order will move to the active stage."
    },
    {
      title: "Step 6: Start Order Processing",
      desc: "When payment is confirmed, you can start processing the order depending on the shipping type. For 'Ship for Me', pick up the product from the provided address and arrange delivery. For 'Buy for Me / Shop for Me', purchase the product on behalf of the shopper."
    },
    {
      title: "Step 7: Update Product Purchase & Tracking",
      desc: "If a product is unavailable or sold out, you must update its purchase status in the order tracking section. Two statuses are available: 'Purchased' or 'Not Purchased'. If the product is purchased, upload the receipt, add the tracking number, and provide the tracking link if available."
    },
    {
      title: "Step 8: Update Product Status",
      desc: "After submitting the product details, update the product status according to its progress. The available states include 'In Progress', 'Processed', or 'Forwarded'. This keeps the shopper informed about the order progress."
    },
    {
      title: "Step 9: Communicate with Shopper",
      desc: "Shippers and shoppers can communicate directly through the portal chat system. Use this feature to clarify product details, delivery instructions, or resolve any issues during the process."
    }
  ];
  return (
    <>
      <PageMeta
        title="Delivering Parcel | Shipper Guideline"
        description="Step-by-step guide for shippers to manage shipping requests and orders."
      />
      <PageBreadcrumb pageTitle="Shipper Guideline" />

      <div className="max-w-5xl mx-auto p-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Shipper Guideline
          </h1>
          <p className="text-gray-600 mt-2">
            Follow these steps to manage shopper requests, place offers, process orders,
            and update shipment tracking through the portal.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-6 border-l-4 border-indigo-400 bg-indigo-50 rounded-lg shadow-sm"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {step.title}
              </h2>
              <p className="text-gray-700">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 bg-gray-100 p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Summary
          </h2>
          <p className="text-gray-700 mt-3">
            As a shipper, your main responsibility is to complete your profile,
            select service areas, review shopper requests, place offers, and
            process orders once payment is confirmed. You must update purchase
            details, tracking information, and product status to keep the shopper
            informed. Communication between shopper and shipper can also be done
            through the portal chat system.
          </p>
        </div>

      </div>
    </>
  );
}