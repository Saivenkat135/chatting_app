import Link from "next/link";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          CA
          <Link
            href="/"
            className="text-2xl pl-30 font-bold tracking-wide"
          >
            Chat Application
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">

            <Link
              href="/client/about"
              className="px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              About
            </Link>

            <Link
              href="/client/login"
              className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition"
            >
              Login
            </Link>

            <Link
              href="/client/signup"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
            >
              Sign Up
            </Link>

          </div>
        </nav>
      </header>


      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>


      {/* Footer */}
      <footer className="bg-black text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">

          <p className="text-sm">
            © {new Date().getFullYear()} Chat Application. All rights reserved.
          </p>

          <div className="flex gap-5 text-sm">
            <Link
              href="/client/about"
              className="hover:text-white transition"
            >
              About
            </Link>

            <Link
              href="/client/login"
              className="hover:text-white transition"
            >
              Login
            </Link>

            <Link
              href="/client/signup"
              className="hover:text-white transition"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}