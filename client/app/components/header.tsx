
"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import axios from 'axios';

const Header = () => {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ username: string; img: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
            axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => {
                    setUser(res.data);
                    console.log(res.data);
                })
                .catch(err => {
                    console.error("Error verifying user:", err);
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                });
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname === '/interface') return null;

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>

                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            ChannelHub
                        </span>
                    </div> </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <a href="#hero" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="#about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Features</a>
                    <a href="#" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Community</a>

                </nav>


                <div className="flex items-center gap-4">
                    {isLoggedIn && user ? (
                        <>
                            <div className="flex items-center gap-3">

                                <img src={user.img} alt={user.username} className='w-10 h-10 rounded-full border border-white/20' />
                                <span className="text-sm font-medium text-white hidden sm:block">{user.username}</span>
                            </div>
                            <button

                                onClick={() => {
                                    localStorage.removeItem('token');
                                    setIsLoggedIn(false);
                                    setUser(null);
                                    window.location.reload();
                                }}
                                className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer  "
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/auth/signup" className="px-5 py-2.5 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header