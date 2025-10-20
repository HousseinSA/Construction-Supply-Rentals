'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, X, Truck } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import AuthButtons from '@/components/ui/AuthButtons';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('common');

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              <span className="text-primary">Rent</span>Pro
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Equipment</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Services</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">About</a>
            <a href="#" className="text-gray-700 hover:text-primary font-medium transition-colors">Contact</a>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden md:block">
              <AuthButtons />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-primary font-medium px-2 py-1 transition-colors">Equipment</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium px-2 py-1 transition-colors">Services</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium px-2 py-1 transition-colors">About</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium px-2 py-1 transition-colors">Contact</a>
              <div className="pt-4 border-t border-gray-200">
                <AuthButtons />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}