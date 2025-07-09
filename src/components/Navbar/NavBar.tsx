"use client";

import { useState, useEffect } from 'react';
import NavLinks from './NavLinks';
import Link from 'next/link';
import SpinningLogo from './NewSpinningLogo';

const NavBar = () => {
    
    const [top, setTop] = useState(true); //const [top, setTop] = useState(!window.scrollY);
    const [isOpen, setIsOpen] = useState(false); //const [isOpen, setisOpen] = React.useState(false);
    
    const handleClick = () => setIsOpen(!isOpen); //function handleClick() { setisOpen(!isOpen); }
                                                        

    useEffect(() => {
      const scrollHandler = () => {
        setTop(window.pageYOffset <= 10);//window.pageYOffset > 10 ? setTop(false) : setTop(true)
      };
      window.addEventListener('scroll', scrollHandler);
      return () => window.removeEventListener('scroll', scrollHandler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <nav className={`fixed top-0 w-full z-30 transition duration-300 ease-in-out mb-16 ${!top && 'bg-black/60 shadow-lg'}`}>
            <div className="max-w-7xl mx-auto flex flex-row justify-between items-center px-4 py-2">
                <div className="flex flex-row justify-center md:px-12 md:mx-12 items-center text-center font-semibold">
                    <Link href="/#hero" aria-label="Home">
                        <SpinningLogo />
                    </Link>
                    
                </div>
                <button 
                    className="p-2 rounded-md text-white focus:outline-none lg:hidden z-40 relative" 
                    onClick={handleClick}
                    aria-label="Toggle menu"
                >
                    <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d={
                            isOpen
                                ? "M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                                : "M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                            }
                        />
                    </svg>
                </button>
                <div className='hidden space-x-6 lg:flex'>
                    <NavLinks />
                </div>

                <div
                    className={`fixed top-0 left-0 h-screen w-full z-30 backdrop-blur-md bg-white/30 shadow-xl transition-all duration-300 ease-in-out lg:hidden
                        ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}
                    `}
                >
                    <div className='flex flex-col justify-center items-center space-y-6 p-6 h-full'>
                        <NavLinks closeMenu={() => setIsOpen(false)} />
                    </div>
                </div>

            </div>
        </nav>
    )
    
}


export default NavBar;
