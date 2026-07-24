import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuth from '../hooks/useAuth'
import { authAPI } from '../api/client'

const Register = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.username || !formData.email || !formData.password) {
            toast.error('All fields are required.')
            return
        }

        setLoading(true)

        try {
            const response = await authAPI.register(formData)

            login(response.data.user, response.data.token)
            toast.success('Welcome to CineDrip! 🎬')

            if (response.data.user.isOnboarded) {
                navigate('/home')
            } else {
                navigate('/onboarding')
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed.'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-80 pointer-events-none"></div>

            {/* Form card */}
            <div className="relative z-10 bg-[#16161f] border border-white/10 rounded-2xl p-8 max-w-md w-full">

                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🎬</div>
                    <h1 className="text-2xl font-bold text-white mb-1">create account</h1>
                    <p className="text-gray-500 text-sm">join the drip</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="your_username"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all mt-2
                            ${loading
                                ? 'bg-gray-700 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                            }`}
                    >
                        {loading ? 'creating account...' : 'get started →'}
                    </button>

                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    already have an acc?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300">
                        sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}

export default Register
