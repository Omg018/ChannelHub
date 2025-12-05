import Link from 'next/link'
import React from 'react'

const Hero = () => {
    return (
        <div id='hero' className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
                    Connect with your team <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        like never before
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Experience real-time collaboration with crystal clear voice, video, and text.
                    Built for teams that move fast and break things.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href='/interface'>
                    <button className="px-8 py-4 text-base font-semibold bg-white text-black rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg shadow-white/10">
                        Start Chatting Now
                    </button>
                    </Link>
                    <button className="px-8 py-4 text-base font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 transition-all backdrop-blur-sm">
                        View Demo
                    </button>
                </div>

                
                <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Active Users', value: '10k+' },
                        { label: 'Messages Sent', value: '1M+' },
                        { label: 'Uptime', value: '99.9%' },
                        { label: 'Countries', value: '50+' },
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Hero