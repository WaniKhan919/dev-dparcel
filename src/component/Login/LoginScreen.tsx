import React, { Component } from 'react';

export class LoginScreen extends Component {
  render() {
    return (
      <div className="w-full h-screen flex flex-col lg:flex-row">
        {/* Left: Form Section */}
        <div className="w-full lg:w-1/2 xl:w-1/2 p-6 sm:p-12 flex flex-col justify-center items-center bg-white">
         
         <div className="mb-6 text-center">
          <img
            src="https://deliveringparcel.com/images/dp.svg"
            alt="Logo"
            className="mx-auto h-10"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to your account
        </p>

        {/* Form */}
        <form className="space-y-4">
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
             
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className='flex items-center justify-between'>
             <a
                href="#"
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                Forgot password?
              </a>
              <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition duration-200 text-sm"
          >
            Sign in
          </button>

          </div>
        </form>
        </div>

        {/* Right: Illustration Section */}
        <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center bg-indigo-100">
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    );
  }
}

export default LoginScreen;
