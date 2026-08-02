import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Landing = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) navigate('/home')
    }, [user, navigate])

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-25"></div>
            </div>

            {/* Floating decorative dots */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
            <div className="absolute top-10 right-40 w-20 h-20 bg-blue-500 rounded-full blur-3xl opacity-15 pointer-events-none"></div>

            {/* Main content */}
            <div className="relative z-10 text-center px-6 max-w-lg">

                <div className="text-6xl mb-6">🎬</div>

                <h1 className="text-5xl font-bold tracking-tight mb-4">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        CineDrip
                    </span>
                </h1>

                <p className="text-gray-400 text-lg leading-relaxed mb-10">
                    Your vibe. Your movies.<br />
                    No algorithm BS. Just cinema.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
                    >
                        get started →
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="border border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:border-white/40 transition-colors bg-white/5"
                    >
                        sign in
                    </button>
                </div>

                <p className="text-xs text-gray-600 mt-8">
                    no ads. no tracking. just films.
                </p>
            </div>
        </div>
    )
}

export default Landing
