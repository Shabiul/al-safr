'use client';

import React from 'react';
import Link from 'next/link';
import { X, Percent, Phone } from 'lucide-react';

interface DiscountPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountPopup: React.FC<DiscountPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Exclusive discounts"
      className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full max-w-sm rounded-2xl p-6 text-center space-y-4 soft-border soft-shadow relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white soft-border"
          style={{ backgroundColor: 'var(--color-ticket-orange)' }}
        >
          <Percent className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900">Want exclusive discounts?</h3>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
            Call or message us directly and we&apos;ll see what we can do — travellers who book through our team
            often get <strong>5–20% off</strong> on top of the fare shown here.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Link
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="focus-ring soft-press flex-1 py-2.5 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 soft-border soft-shadow-sm"
            style={{ backgroundColor: 'var(--color-ticket-orange)' }}
          >
            <Phone className="w-4 h-4" />
            Contact us
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex-1 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
