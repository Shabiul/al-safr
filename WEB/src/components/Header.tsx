'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plane,
  Globe,
  Menu,
  X,
  Ticket,
  Home,
  LayoutGrid,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Info,
  MessageCircle,
  ChevronDown,
  Search,
  Building2,
  Compass,
  Car,
  Images,
} from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '@/services/flightData';

type MainTab = 'home' | 'services' | 'bookings';
type ServiceId = 'book' | 'hotels' | 'tours' | 'cabs';

interface HeaderProps {
  currency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  apiStatus: 'idle' | 'loading' | 'success' | 'error';
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenBooking?: () => void;
  onSelectService?: (service: ServiceId) => void;
  onOpenGallery?: () => void;
}

const TABS: { id: MainTab; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookings', label: 'My Trips', icon: Ticket },
];

const SERVICE_MENU: { id: ServiceId; label: string; icon: React.ElementType }[] = [
  { id: 'book', label: 'Flights', icon: Search },
  { id: 'hotels', label: 'Hotels', icon: Building2 },
  { id: 'tours', label: 'Tour Packages', icon: Compass },
  { id: 'cabs', label: 'Cabs', icon: Car },
];

const PAGE_LINKS: { href: string; label: string; icon: React.ElementType }[] = [
  { href: '/about', label: 'About Us', icon: Info },
  { href: '/contact', label: 'Contact', icon: MessageCircle },
];

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  apiStatus,
  activeTab,
  onTabChange,
  onOpenBooking,
  onSelectService,
  onOpenGallery,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const servicesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 25);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesMenuRef.current && !servicesMenuRef.current.contains(e.target as Node)) {
        setIsServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectService = (service: ServiceId) => {
    setIsServicesMenuOpen(false);
    if (onSelectService) {
      onSelectService(service);
    } else {
      onTabChange('services');
    }
  };

  const handleBookNow = () => {
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      onTabChange('services');
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 w-full">
      {/* Top Contact & Office Info Strip */}
      <div
        className={`w-full text-xs text-[#f4f3ec]/90 transition-all duration-300 hidden sm:block ${
          scrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'h-8 py-1.5 opacity-100'
        }`}
        style={{ backgroundColor: '#1c1817' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 sm:gap-6">
            <a href="tel:+918904563397" className="flex items-center gap-1.5 hover:text-[#f36f0f] transition-colors">
              <Phone className="w-3 h-3 text-[#f36f0f]" />
              <span>+91 89045 63397</span>
            </a>
            <a
              href="https://wa.me/918904563396"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp: +91 89045 63396</span>
            </a>
            <a href="mailto:alsafartoursntravels@gmail.com" className="flex items-center gap-1.5 hover:text-[#f36f0f] transition-colors hidden md:flex">
              <Mail className="w-3 h-3 text-[#f36f0f]" />
              <span>alsafartoursntravels@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-[#f4f3ec]/75 truncate">
            <MapPin className="w-3 h-3 text-[#f36f0f] shrink-0" />
            <span className="truncate">Electronic City Phase I, Bengaluru 560100</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-[#f4f3ec]/95 backdrop-blur-md border-b border-[#1c1817]/10 shadow-sm'
            : 'bg-[#f4f3ec] border-b border-[#1c1817]/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo: Al-Safr (السفر) */}
          <button
            type="button"
            onClick={() => {
              onTabChange('home');
              setIsMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="focus-ring rounded-xl flex items-center gap-3 shrink-0 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f36f0f] text-white flex items-center justify-center shadow-md shadow-[#f36f0f]/20 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-[#1c1817]">
                  Al-Safr
                </span>
                <span className="text-[11px] font-bold text-[#f36f0f] font-arabic" dir="rtl">
                  (السفر)
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#1c1817]/55 uppercase tracking-wider block -mt-0.5">
                Tours N Travels • Est. 2009
              </span>
            </div>
            {apiStatus !== 'idle' && (
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full ml-1 ${
                  apiStatus === 'success' ? 'bg-emerald-500' : apiStatus === 'loading' ? 'bg-[#f36f0f] animate-pulse' : 'bg-rose-500'
                }`}
                title="Live Flight Telemetry Status"
              />
            )}
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Primary">
            {(() => {
              const Icon = TABS[0].icon;
              const isActive = activeTab === TABS[0].id;
              return (
                <button
                  type="button"
                  onClick={() => onTabChange(TABS[0].id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`focus-ring px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1c1817] text-white shadow-sm'
                      : 'text-[#1c1817]/75 hover:text-[#1c1817] hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f36f0f]' : 'text-[#1c1817]/60'}`} />
                  {TABS[0].label}
                </button>
              );
            })()}

            {/* Services dropdown */}
            <div ref={servicesMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsServicesMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={isServicesMenuOpen}
                className={`focus-ring px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#1c1817] text-white shadow-sm'
                    : 'text-[#1c1817]/75 hover:text-[#1c1817] hover:bg-[#1c1817]/5'
                }`}
              >
                <LayoutGrid className={`w-4 h-4 shrink-0 ${activeTab === 'services' ? 'text-[#f36f0f]' : 'text-[#1c1817]/60'}`} />
                Services
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isServicesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isServicesMenuOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl border border-[#1c1817]/10 shadow-lg overflow-hidden py-1.5"
                >
                  {SERVICE_MENU.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="menuitem"
                        onClick={() => handleSelectService(item.id)}
                        className="focus-ring w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-left text-[#1c1817]/80 hover:bg-[#f4f3ec] hover:text-[#1c1817] transition-colors cursor-pointer"
                      >
                        <ItemIcon className="w-4 h-4" style={{ color: '#f36f0f' }} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {(() => {
              const Icon = TABS[1].icon;
              const isActive = activeTab === TABS[1].id;
              return (
                <button
                  type="button"
                  onClick={() => onTabChange(TABS[1].id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`focus-ring px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1c1817] text-white shadow-sm'
                      : 'text-[#1c1817]/75 hover:text-[#1c1817] hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f36f0f]' : 'text-[#1c1817]/60'}`} />
                  {TABS[1].label}
                </button>
              );
            })()}

            {onOpenGallery && (
              <button
                type="button"
                onClick={onOpenGallery}
                className="focus-ring px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer text-[#1c1817]/75 hover:text-[#1c1817] hover:bg-[#1c1817]/5"
              >
                <Images className="w-4 h-4 shrink-0 text-[#1c1817]/60" />
                Gallery
              </button>
            )}

            {PAGE_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`focus-ring px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1c1817] text-white shadow-sm'
                      : 'text-[#1c1817]/75 hover:text-[#1c1817] hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#1c1817]/60" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#1c1817]/15 bg-white/60 px-3 py-1.5 text-xs font-bold text-[#1c1817] shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-[#f36f0f]" aria-hidden="true" />
              <label htmlFor="currency-select" className="sr-only">
                Currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="focus-ring bg-transparent text-xs font-bold text-[#1c1817] cursor-pointer"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].label} ({c})
                  </option>
                ))}
              </select>
            </div>

            {/* Get a Quote Button */}
            <Link
              href="/get-a-quote"
              className="focus-ring hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#1c1817]/20 hover:border-[#1c1817] text-xs font-bold text-[#1c1817] transition-colors"
            >
              <span>Get a Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Book Now Button */}
            <button
              type="button"
              onClick={handleBookNow}
              className="px-5 sm:px-6 py-2.5 rounded-full bg-[#f36f0f] hover:bg-[#dc6009] active:scale-98 text-white font-bold text-xs sm:text-sm tracking-wide orange-pill-glow transition-all cursor-pointer"
            >
              Book Now
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="w-10 h-10 rounded-full bg-[#1c1817] text-white flex lg:hidden items-center justify-center cursor-pointer shadow-xs"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-b border-[#1c1817]/10 bg-[#f4f3ec] px-5 py-4 space-y-3 shadow-xl">
          <div className="space-y-1">
            {(() => {
              const Icon = TABS[0].icon;
              const isActive = activeTab === TABS[0].id;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onTabChange(TABS[0].id);
                    setIsMenuOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${
                    isActive ? 'bg-[#1c1817] text-white' : 'text-[#1c1817]/80 hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f36f0f]' : ''}`} />
                  {TABS[0].label}
                </button>
              );
            })()}

            {/* Services accordion */}
            <button
              type="button"
              onClick={() => setIsMobileServicesOpen((v) => !v)}
              aria-expanded={isMobileServicesOpen}
              className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center justify-between gap-3 ${
                activeTab === 'services' ? 'bg-[#1c1817] text-white' : 'text-[#1c1817]/80 hover:bg-[#1c1817]/5'
              }`}
            >
              <span className="flex items-center gap-3">
                <LayoutGrid className={`w-4 h-4 ${activeTab === 'services' ? 'text-[#f36f0f]' : ''}`} />
                Services
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileServicesOpen && (
              <div className="pl-4 space-y-1">
                {SERVICE_MENU.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        handleSelectService(item.id);
                        setIsMenuOpen(false);
                        setIsMobileServicesOpen(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-[#1c1817]/70 hover:bg-[#1c1817]/5 transition-colors flex items-center gap-3"
                    >
                      <ItemIcon className="w-4 h-4" style={{ color: '#f36f0f' }} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {(() => {
              const Icon = TABS[1].icon;
              const isActive = activeTab === TABS[1].id;
              return (
                <button
                  type="button"
                  onClick={() => {
                    onTabChange(TABS[1].id);
                    setIsMenuOpen(false);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${
                    isActive ? 'bg-[#1c1817] text-white' : 'text-[#1c1817]/80 hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#f36f0f]' : ''}`} />
                  {TABS[1].label}
                </button>
              );
            })()}

            {onOpenGallery && (
              <button
                type="button"
                onClick={() => {
                  onOpenGallery();
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 text-[#1c1817]/80 hover:bg-[#1c1817]/5"
              >
                <Images className="w-4 h-4" />
                Gallery
              </button>
            )}

            {PAGE_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${
                    isActive ? 'bg-[#1c1817] text-white' : 'text-[#1c1817]/80 hover:bg-[#1c1817]/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1c1817]/10 flex flex-col gap-3">
            <div className="flex items-center justify-between px-2 text-xs font-bold text-[#1c1817]/75">
              <span>Currency:</span>
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent font-bold text-[#1c1817] cursor-pointer"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {CURRENCIES[c as CurrencyCode].label} ({c})
                  </option>
                ))}
              </select>
            </div>

            <Link
              href="/get-a-quote"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-white border border-[#1c1817]/20 text-center text-xs font-bold text-[#1c1817]"
            >
              Get a Quote
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                handleBookNow();
              }}
              className="w-full py-3 rounded-xl bg-[#f36f0f] text-white text-center text-xs font-bold orange-pill-glow"
            >
              Book Now
            </button>

            <div className="pt-3 border-t border-[#1c1817]/10 flex flex-col gap-2.5 text-xs">
              <a
                href="tel:+918904563397"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#1c1817]/10 text-[#1c1817] font-bold"
              >
                <Phone className="w-4 h-4 text-[#f36f0f]" />
                <span>Call: +91 89045 63397</span>
              </a>
              <a
                href="https://wa.me/918904563396"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: +91 89045 63396</span>
              </a>
              <div className="flex items-start gap-2 px-1 text-[#1c1817]/70 text-[11px] leading-snug">
                <MapPin className="w-3.5 h-3.5 text-[#f36f0f] shrink-0 mt-0.5" />
                <span>53/3, Abbaiah Reddy St, near Celebrity Arch, Doddathoguru, Electronic City Phase I, Bengaluru 560100</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
