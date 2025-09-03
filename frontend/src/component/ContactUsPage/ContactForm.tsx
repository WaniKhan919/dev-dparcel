import React from 'react';

const ContactForm = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 pt-10 pb-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          {/* Dropdown */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What do you need help with?
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>
                Select from dropdown
              </option>
              <option value="support">Customer Support</option>
              <option value="billing">Billing</option>
              <option value="other">Other</option>
            </select>
          </div> */}

          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              type="text"
              placeholder="John"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Surname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surname
            </label>
            <input
              type="text"
              placeholder="Novak"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>



          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="Subject"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              placeholder="john@email.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your message
            </label>
            <textarea
              rows={4}
              placeholder="Write your message here..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="border border-dashed border-gray-300 p-4 text-center rounded-md">
            <p className="text-sm text-gray-500 mb-1">Drag & drop or <span className="text-blue-600 underline cursor-pointer">browse files</span></p>
            <p className="text-xs text-gray-400">Supports JPG, JPEG, PNG, PDF, DOCX</p>
            <p className="text-xs text-gray-400 mt-1">Upload limit: 6 files / 3 MB</p>
          </div>

          {/* Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the processing of the personal data that I provide to DeliveryParcel in accordance with DeliveryParcel’s <a href="#" className="text-blue-600 underline">Privacy policy</a>.
            </label>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition">
            Send request
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-gray-500 mt-4">
          DELIVERINGPARCEL LTD, 27 Old Gloucester Street London, United Kingdom, WC1N 3AX<br />
          Phone: +44-2039875200
        </p>
      </div>
    </div>
  );
};

export default ContactForm;
