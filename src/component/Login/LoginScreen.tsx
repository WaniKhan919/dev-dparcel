import React, { Component, useState } from 'react';

const LoginScreen = () => {
  const [isSignupOpen, setIsSignupOpen] = useState(false);




  return (
    <div className="w-full h-screen flex flex-col lg:flex-row">



      <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-indigo-100">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/images/general.jpeg')",
          }}
        ></div>
      </div>


      <div className="w-full lg:w-1/2 xl:w-5/12 px-6 sm:px-12 py-12 flex flex-col justify-center bg-white">
        <div className="mb-8 text-center">
          <img
            src="https://deliveringparcel.com/images/dp.svg"
            alt="Logo"
            className="mx-auto h-10"
          />
        </div>

        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
            Welcome back!
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Sign in to your account
          </p>

          {/* Form */}
          <form className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200"
            >
              Log in
            </button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Don’t have an account?{' '}
              <button
                onClick={() => setIsSignupOpen(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Create one
              </button>
            </p>
          </form>
        </div>
      </div>

      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md p-8 rounded-lg relative">
            <button
              onClick={() => setIsSignupOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-lg font-bold"
            >
              ×
            </button>

            <div className="flex flex-col items-center mb-4">
              <img
                src="https://deliveringparcel.com/images/dp.svg"
                alt="Logo"
                className="h-10 mb-2"
              />
              <h3 className="text-xl font-semibold mb-4">Create an account</h3>
            </div>

            <form className="space-y-4">
              <select className="w-full border px-4 py-2 rounded" required>
                <option value="">Select Country</option>
                <option>United Kingdom</option>
                <option>United States</option>
              </select>

              <select className="w-full border px-4 py-2 rounded" required>
                <option value="">How will you use our services?</option>
                <option>Business</option>
                <option>Personal</option>
              </select>
              <input
                type="name"
                placeholder="Name"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Phone Number"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border px-4 py-2 rounded"
                required
              />
              <p className="text-xs text-gray-500">
                It contains at least 8 characters, 1 number, 1 uppercase and 1 special character.
              </p>

              <div className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" required />
                <span>
                  I agree with the{' '}
                  <a href="#" className="text-blue-600 underline">
                    terms of use
                  </a>{' '}
                  and the{' '}
                  <a href="#" className="text-blue-600 underline">
                    privacy policy
                  </a>
                </span>
              </div>

              <button className="w-full bg-blue-800 text-white py-2 rounded hover:bg-blue-900">
                Continue
              </button>

              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignupOpen(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Log in
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default LoginScreen;
