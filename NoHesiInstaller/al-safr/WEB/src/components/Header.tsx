'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, Globe, Menu, X, Ticket, Home, LayoutGrid, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '@/services/flightData';

type MainTab = 'home' | 'services' | 'bookings';

interface HeaderProps {
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  apiStatus: 'idle' | 'loading' | 'success' | 'error';
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const TABS: { id: MainTab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'services', label: 'Services', icon: LayoutGrid },
  { id: 'bookings', label: 'My Trips', icon: Ticket },
];

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  apiStatus,
  activeTab,
  onTabChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Contact strip */}
      <div className="w-full text-xs text-slate-300 hidden sm:block" style={{ backgroundColor: '#04182c' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <a href="tel:+919900517604" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              +91 99005 17604
            </a>
            <a href="mailto:luckysaj@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3 h-3" />
              luckysaj@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            A.M. Plaza, Hospital Road, Shivaji Nagar, Bengaluru 560001
          </div>
        </div>
      </div>

      <div className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => {
            onTabChange('home');
            setIsMenuOpen(false);
          }}
          className="focus-ring rounded-lg flex items-center gap-2.5 shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
            <Plane className="w-4.5 h-4.5 -rotate-45" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-900">Al-Safr</span>
          {apiStatus !== 'idle' && (
            <span
              aria-hidden="true"
              className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === 'success' ? 'bg-emerald-500' : apiStatus === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
          )}
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-ring px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="currency-select" className="sr-only">
              Currency
            </label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="focus-ring bg-transparent text-sm font-medium text-slate-700 cursor-pointer"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {CURRENCIES[c as CurrencyCode].label}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/get-a-quote"
            className="focus-ring hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Get a Quote
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            className="focus-ring lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMenuOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`focus-ring w-full px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <div className="flex items-center gap-1.5 px-3.5 py-2.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <label htmlFor="currency-select-mobile" className="sr-only">
              Currency
            </label>
            <select
              id="currency-select-mobile"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
              className="focus-ring bg-transparent text-sm font-medium text-slate-700"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>
                  {CURRENCIES[c as CurrencyCode].label}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/get-a-quote"
            onClick={() => setIsMenuOpen(false)}
            className="focus-ring flex items-center justify-center gap-1.5 mx-3.5 mt-2 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            Get a Quote
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
      </div>
    </header>
  );
};
