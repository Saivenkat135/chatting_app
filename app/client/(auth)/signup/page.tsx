"use client";
export default function signup() {
    const handleSubmit = () => {
        window.location.href = "/client/login";
    }
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">
            Sign up to get started
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              className="
                w-full
                border border-gray-300
                rounded-lg
                p-2
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                transition
                text-black
              "
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="
                w-full
                
                text-black
                border border-gray-300
                rounded-lg
                p-2
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                transition
              "
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="
                w-full
                text-black
                border border-gray-300
                rounded-lg
                p-2
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                transition
              "
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="
                w-full
                text-black
                border border-gray-300
                rounded-lg
                p-2
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                transition
              "
            />
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            onClick={handleSubmit}
            className="
              w-full
              bg-blue-600
              text-white
              py-3
              rounded-lg
              font-semibold
              hover:bg-blue-700
              active:scale-[0.98]
              transition
              cursor-pointer
            "
          >
            Sign Up
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a
            href="/client/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login 
          </a>
        </p>

      </div>
    </div>
  );
}