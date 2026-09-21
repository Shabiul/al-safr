import { StaticPageShell } from '@/components/StaticPageShell';
import { GALLERY_ITEMS } from '@/services/galleryData';

export const metadata = {
  title: 'Gallery | Al-Safr',
  description: 'A glimpse of where Al-Safr takes its travellers.',
};

export default function GalleryPage() {
  return (
    <StaticPageShell title="Travel Gallery" subtitle="A glimpse of where we take our travellers" wide>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.src} className="relative aspect-video rounded-2xl overflow-hidden soft-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-sm font-bold text-white">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </StaticPageShell>
  );
}
