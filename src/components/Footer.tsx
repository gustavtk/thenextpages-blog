'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TheNextPages. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/page/about-us" className="text-gray-500 hover:text-gray-700 text-sm">
              About
            </Link>
            <Link href="/page/contact-us" className="text-gray-500 hover:text-gray-700 text-sm">
              Contact
            </Link>
            <Link href="/page/privacy-policy" className="text-gray-500 hover:text-gray-700 text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}