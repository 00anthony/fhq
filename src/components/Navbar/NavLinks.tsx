'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { barbers } from '@/data/barbers';

type NavLinksProps = {
  closeMenu?: () => void;
};

const NavLinks = ({ closeMenu }: NavLinksProps) => {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  console.log(session);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    closeMenu?.();
  };

  // Helper function to check if link is active
  const isActiveLink = (href: string) => {
    if (!pathname) return false;
    if (href === '/barbers') {
      return pathname === '/barbers' || pathname.startsWith('/barbers/');
    }
    return pathname === href;
  };

  return (
    <nav className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-white">
      <Link
        className={`px-4 py-2 font-extrabold flex items-center transition-colors duration-200 ${
          isActiveLink('/about') 
            ? 'text-red-900 border-b-2 border-red-900' 
            : 'text-white hover:text-red-900'
        }`}
        href="/about"
        onClick={handleLinkClick}
      >
        About
      </Link>
      <Link
        className={`px-4 py-2 font-extrabold flex items-center transition-colors duration-200 ${
          isActiveLink('/services') 
            ? 'text-red-900 border-b-2 border-red-900' 
            : 'text-white hover:text-red-900'
        }`}
        href="/services"
        onClick={handleLinkClick}
      >
        Services
      </Link>
      <Link
        className={`px-4 py-2 font-extrabold flex items-center transition-colors duration-200 ${
          isActiveLink('/gallery') 
            ? 'text-red-900 border-b-2 border-red-900' 
            : 'text-white hover:text-red-900'
        }`}
        href="/gallery"
        onClick={handleLinkClick}
      >
        Gallery
      </Link>

      {/* Barbers Dropdown */}
      <div className="relative group">
        <button
          className={`px-4 py-2 font-extrabold flex items-center gap-1 transition-colors duration-200 ${
            isActiveLink('/barbers') 
              ? 'text-red-900 border-b-2 border-red-900' 
              : 'text-white hover:text-red-900'
          }`}
          onClick={handleDropdownToggle}
          onMouseEnter={() => setIsDropdownOpen(true)}
        >
          Barbers
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown Menu */}
        <div
          className={`absolute top-full left-0 mt-1 bg-neutral-950/90 backdrop-blur border border-neutral-700 rounded-lg shadow-xl z-50 min-w-48 transition-all duration-200 ${
            isDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          }`}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          {/* View All Barbers */}
          <Link
            href="/barbers"
            className={`block px-4 py-3 font-semibold border-b border-neutral-700 transition-colors duration-150 ${
              pathname === '/barbers'
                ? 'text-red-900 '
                : 'text-white hover:text-red-900 '
            }`}
            onClick={handleLinkClick}
          >
            View All Barbers
          </Link>
          
          {/* Individual Barbers */}
          {barbers.map((barber) => (
            <Link
              key={barber.slug}
              href={`/barbers/${barber.slug}`}
              className={`block px-4 py-3 transition-colors duration-150 ${
                pathname === `/barbers/${barber.slug}`
                  ? 'text-red-900 '
                  : 'text-gray-300 hover:text-red-900 '
              }`}
              onClick={handleLinkClick}
            >
              {barber.name}
            </Link>
          ))}
        </div>
      </div>

      <Link
        className={`text-white backdrop-blur-sm px-6 py-3 font-extrabold flex items-center justify-center w-auto shadow-xl rounded-xl transition-colors duration-200 ${
          isActiveLink('/booking') 
            ? 'bg-red-900 ' 
            : 'bg-red-900/50 hover:bg-red-900'
        }`}
        href="/booking"
        onClick={handleLinkClick}
      >
        Get Faded
      </Link>
      <Link
        href="https://www.instagram.com/faded.headquarters/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center py-2"
      >
        <svg
          className="w-6 h-6 text-white hover:scale-110 hover:text-red-900 transition-transform duration-300"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
          />
          <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z"
          />
        </svg>
      </Link>
      {/* Auth Button */}
      <button
        onClick={() => session ? signOut() : signIn('google')}
        className="w-6 h-6 text-white hover:scale-110 hover:text-red-900 transition-transform duration-300 cursor-pointer"
        aria-label={session ? 'Sign Out' : 'Sign In with Google'}
      >
        {session ? (
          // filled profile icon (logged in)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            {/* Head */}
            <circle cx="12" cy="8" r="4" />
            
            {/* Shoulders */}
            <path d="M4 20c0-3 3.6-5.5 8-5.5s8 2.5 8 5.5v1H4v-1z" />
          </svg>
        ) : (
          // Profile icon outline (logged out)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            {/* Head */}
            <circle cx="12" cy="8" r="4" />
            
            {/* Shoulders */}
            <path d="M4 20c0-3 3.6-5.5 8-5.5s8 2.5 8 5.5v1H4v-1z" />
          </svg>
        )}
      </button>
    </nav>
  );
};

export default NavLinks;
