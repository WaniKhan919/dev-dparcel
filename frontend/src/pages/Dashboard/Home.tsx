import PageMeta from "../../components/common/PageMeta";
import { InfoIcon } from "../../icons";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard"
        description="International Package and mail Forwarding Services"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          {/* Header */}
            <div className="bg-blue-600 text-white px-6 h-40 rounded-b-lg">
              <h1 className="text-2xl font-bold flex items-center gap-2 pt-4">
                Welcome to your dashboard!
                <InfoIcon className="w-5 h-5 text-white" />
              </h1>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 -mt-25">
              {/* Total Orders */}
              <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-blue-600 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600">Total orders</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 text-blue-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                    />
                  </svg>
                </div>
                <div className="flex justify-end mt-4">
                  <a href="#" className="text-blue-600 font-medium text-sm">
                    See all
                  </a>
                </div>
              </div>


              {/* Pickup Soon */}
              <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-yellow-400 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-gray-600">Pickup soon</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    className="w-6 h-6 text-yellow-600">
                    <path strokeLinecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>

                </div>
                <div className="flex justify-end mt-4">
                  <a href="#" className="text-blue-600 font-medium text-sm">
                    See all
                  </a>
                </div>
              </div>

              {/* Balance */}
              <div className="bg-white rounded-2xl shadow-md p-4 border-b-4 border-green-500 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">€0.00</p>
                    <p className="text-gray-600">Your current balance</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                    className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                  </svg>

                </div>
                <div className="flex justify-end mt-4">
                  <a href="#" className="text-blue-600 font-medium text-sm">
                    See all
                  </a>
                </div>
              </div>
            </div>
        </div>

      </div>
    </>
  );
}
