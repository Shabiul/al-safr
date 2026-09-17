'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TourPackageFormData {
  id?: string;
  slug: string;
  name: string;
  destination: string;
  summary: string;
  description: string;
  durationDays: number;
  priceUsd: number;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  published: boolean;
}

const EMPTY: TourPackageFormData = {
  slug: '',
  name: '',
  destination: '',
  summary: '',
  description: '',
  durationDays: 3,
  priceUsd: 500,
  images: [''],
  inclusions: [''],
  exclusions: [''],
  itinerary: [{ day: 1, title: '', description: '' }],
  published: true,
};

function listToLines(items: string[]): string {
  return items.filter(Boolean).join('\n');
}

function linesToList(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

export function TourPackageForm({ initial }: { initial?: TourPackageFormData }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState<TourPackageFormData>(initial ?? EMPTY);
  const [imagesText, setImagesText] = useState(listToLines(initial?.images ?? EMPTY.images));
  const [inclusionsText, setInclusionsText] = useState(listToLines(initial?.inclusions ?? EMPTY.inclusions));
  const [exclusionsText, setExclusionsText] = useState(listToLines(initial?.exclusions ?? EMPTY.exclusions));
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(initial?.itinerary ?? EMPTY.itinerary);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateItineraryDay = (index: number, patch: Partial<ItineraryDay>) => {
    setItinerary((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  };

  const addItineraryDay = () => {
    setItinerary((prev) => [...prev, { day: prev.length + 1, title: '', description: '' }]);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      ...form,
      images: linesToList(imagesText),
      inclusions: linesToList(inclusionsText),
      exclusions: linesToList(exclusionsText),
      itinerary,
    };

    try {
      const res = await fetch(isEdit ? `/api/tour-packages/${initial!.id}` : '/api/tour-packages', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      router.push('/tour-packages');
      router.refresh();
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Slug (URL-friendly, unique)</span>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Destination</span>
          <input
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Duration (days)</span>
          <input
            type="number"
            min={1}
            required
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Price (USD, per person)</span>
          <input
            type="number"
            min={0}
            required
            value={form.priceUsd}
            onChange={(e) => setForm({ ...form, priceUsd: Number(e.target.value) })}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-xs font-medium text-slate-500">Summary (one line, shown on cards)</span>
        <input
          required
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs font-medium text-slate-500">Full description</span>
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-xs font-medium text-slate-500">Image URLs (one per line, first is the cover)</span>
        <textarea
          rows={2}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono resize-none"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Inclusions (one per line)</span>
          <textarea
            rows={4}
            value={inclusionsText}
            onChange={(e) => setInclusionsText(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Exclusions (one per line)</span>
          <textarea
            rows={4}
            value={exclusionsText}
            onChange={(e) => setExclusionsText(e.target.value)}
            className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none"
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Itinerary</span>
          <button
            type="button"
            onClick={addItineraryDay}
            className="focus-ring flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Add day
          </button>
        </div>
        {itinerary.map((day, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Day {day.day}</span>
              {itinerary.length > 1 && (
                <button type="button" onClick={() => removeItineraryDay(i)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              placeholder="Title"
              value={day.title}
              onChange={(e) => updateItineraryDay(i, { title: e.target.value })}
              className="focus-ring w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm"
            />
            <input
              placeholder="Description"
              value={day.description}
              onChange={(e) => updateItineraryDay(i, { description: e.target.value })}
              className="focus-ring w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="rounded accent-brand-600"
        />
        <span className="text-sm text-slate-700">Published (visible on the public site)</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="focus-ring px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
      >
        {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create package'}
      </button>
    </form>
  );
}
