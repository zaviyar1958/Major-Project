import React from 'react'
import { Home, ArrowLeft, Search, AlertTriangle, Compass } from 'lucide-react'

const NotFoundPage = () => {
  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen w-full bg-blue-300 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-blue-200 blur-sm -z-10">
            404
          </div>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          The page you're looking for seems to have wandered off into the digital wilderness. 
          Don't worry, even the best explorers sometimes take a wrong turn!
        </p>

        {/* Suggestions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-gray-700 font-medium">Quick suggestions:</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer">
              Home
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors cursor-pointer">
              About
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors cursor-pointer">
              Contact
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors cursor-pointer">
              Services
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Go Home
          </button>

          <button
            onClick={handleGoBack}
            className="group flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-200 hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center items-center space-x-8 opacity-60">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-100"></div>
          <Compass className="w-6 h-6 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
        </div>

        {/* Help text */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Lost? Try checking the URL or contact our support team.</p>
        </div>
      </div>

      {/* Background decorations */}
      <div className="fixed top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="fixed top-32 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="fixed bottom-20 left-20 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      <div className="fixed bottom-32 right-10 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-700"></div>
    </div>
  )
}

export default NotFoundPage
