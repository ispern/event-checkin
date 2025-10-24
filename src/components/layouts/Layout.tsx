import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
          © 2024 Event Check-in System
        </div>
      </footer>
    </div>
  )
}

export default Layout