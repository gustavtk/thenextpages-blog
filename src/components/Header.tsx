'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, MoreVertical } from 'lucide-react';

// Static menu items to avoid API calls and loading delays
const STATIC_MENU_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'PAGES', href: '/category/pages' },
  { name: 'CAREERS', href: '/category/careers' },
  { name: 'FUNDING', href: '/category/funding' },
  { name: 'TVET COLLEGES', href: '/category/tvet-colleges' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchVisible(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Search Mode - Google Blog Style */}
        {isSearchVisible ? (
          <div className="hidden md:flex items-center h-14">
            {/* Logo - Always Visible */}
            <Link href="/" className="flex items-center mr-4">
              <Image
                src="/logo.svg"
                alt="TheNextPages"
                width={67}
                height={16}
                className="h-4 w-auto"
                priority
              />
            </Link>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <div className="flex-1 flex items-center bg-gray-50 rounded-full px-4 py-2 focus-within:bg-gray-100 transition-colors">
                <Search className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find an article..."
                  className="search-input flex-1 bg-transparent outline-none ring-0 focus:ring-0 border-0 text-base text-gray-900 placeholder-gray-500"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </form>
            
            {/* Close Search Button */}
            <button 
              onClick={() => {
                setIsSearchVisible(false);
                setSearchQuery('');
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ml-2"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          /* Normal Header */
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="TheNextPages"
                width={67}
                height={16}
                className="h-4 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation - Google Blog Style */}
            <nav className="hidden md:flex items-center space-x-6">
              {STATIC_MENU_ITEMS.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 font-normal text-sm transition-colors py-2 px-3 rounded hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Search & Menu - Google Blog Style */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Search Toggle */}
              <button 
                onClick={() => setIsSearchVisible(true)}
                className="p-3 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* More Menu */}
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Search & Menu - Google Blog Style */}
            <div className="md:hidden flex items-center space-x-1">
              {/* Mobile Search Toggle */}
              <button 
                onClick={() => setIsSearchVisible(true)}
                className="p-3 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Mobile Menu Button */}
              <button 
                className={`p-3 rounded-full transition-colors ${isMenuOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Menu - Google Blog Style */}
        {isMenuOpen && !isSearchVisible && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col space-y-1">
              {STATIC_MENU_ITEMS.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 font-normal text-sm py-4 px-4 rounded transition-colors hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}

                        {/* Mobile Search Mode - Replaces entire header */}
        {isSearchVisible && (
          <div className="flex md:hidden items-center h-14">
            {/* Menu Button */}
            <button 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 focus-within:bg-gray-100 transition-colors">
                <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find an article..."
                  className="search-input flex-1 bg-transparent outline-none ring-0 focus:ring-0 border-0 text-base text-gray-900 placeholder-gray-500"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </form>
            
            {/* Close Search Button */}
            <button
              type="button"
              onClick={() => {
                setIsSearchVisible(false);
                setSearchQuery('');
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}