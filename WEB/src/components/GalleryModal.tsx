'use client';

import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
}

// Decorative photo gallery — real photos, honestly captioned by what's
// actually shown in each shot rather than tied to any specific bookable
// package (that's what the Tour Packages catalogue is for).
const GALLERY_ITEMS = [
  { src: '/uixshuvo/panoramic_boats.jpg', label: 'Tropical archipelago' },
  { src: '/uixshuvo/gallery_mountain.jpg', label: 'Alpine chalets' },
  { src: '/uixshuvo/gallery_bungalows.jpg', label: 'Overwater lagoon' },
  { src: '/uixshuvo/dest_obsidian.jpg', label: 'Coastal cliffside town' },
  { src: '/uixshuvo/dest_dunes.jpg', label: 'White sand beach' },
  { src: '/uixshuvo/gallery_lagoon.jpg', label: 'Emerald cove' },
];

export const GalleryModal: React.FC<GalleryModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#1c1817] rounded-3xl p-6 max-w-3xl w-full text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#f36f0f] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Al-Safr Travel Gallery</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            A glimpse of where we take our travellers
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GALLERY_ITEMS.map((item) => (
              <div key={item.src} className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[10px] font-bold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
