import { StaticPageShell } from '@/components/StaticPageShell';

export const metadata = {
  title: 'Terms & Conditions | Al-Safr',
  description: 'The terms that apply to using the Al-Safr booking platform.',
};

export default function TermsPage() {
  return (
    <StaticPageShell title="Terms & Conditions" subtitle="Last updated: September 2026">
      <div className="prose-sm space-y-6 text-slate-600 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          This is a general terms document written for Al-Safr&apos;s current features. It has not been reviewed by a
          lawyer and should be checked against applicable consumer-protection and travel-trade law before real bookings
          and payments go live on this platform.
        </p>

        <div>
          <h2>1. What Al-Safr currently is</h2>
          <p>
            Al-Safr is a search and enquiry platform operated by Al Safar Tours N Travels. Today, it lets you search
            live flight fares, hotel rates, and car rental pricing from third-party suppliers, browse our tour
            packages, and submit contact or quote requests. It does not yet process payments or issue tickets directly
            — bookings made through a quote request are confirmed and paid for separately, through our team.
          </p>
        </div>

        <div>
          <h2>2. Accuracy of pricing</h2>
          <ul>
            <li>Flight, hotel, and car rental prices are pulled live from third-party suppliers at the moment of your search and can change before a booking is confirmed.</li>
            <li>Tour package prices are set by us and are per person on the basis stated on each package&apos;s page.</li>
            <li>We do not guarantee that a price shown at search time will still be available when you contact us to book.</li>
          </ul>
        </div>

        <div>
          <h2>3. Coverage limits</h2>
          <p>
            Some services have geographic limits — for example, our current car rental supplier does not cover India,
            the UAE, or the US. Where a limit applies, we aim to state it clearly before you search rather than after.
          </p>
        </div>

        <div>
          <h2>4. Your account</h2>
          <p>
            If you register an account, you&apos;re responsible for keeping your password confidential and for all
            activity under your account.
          </p>
        </div>

        <div>
          <h2>5. Governing law</h2>
          <p>These terms are governed by the laws of India, with courts in Bengaluru, Karnataka having jurisdiction.</p>
        </div>

        <div>
          <h2>6. Contact us</h2>
          <p>
            Questions about these terms: <a href="mailto:luckysaj@gmail.com" className="text-brand-700 font-medium">luckysaj@gmail.com</a> or{' '}
            <a href="tel:+919900517604" className="text-brand-700 font-medium">+91 99005 17604</a>.
          </p>
        </div>
      </div>
    </StaticPageShell>
  );
}
