import { StaticPageShell } from '@/components/StaticPageShell';

export const metadata = {
  title: 'Privacy Policy | Al-Safr',
  description: 'How Al-Safr Tours N Travels collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <StaticPageShell title="Privacy Policy" subtitle="Last updated: September 2026">
      <div className="prose-sm space-y-6 text-slate-600 leading-relaxed [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&>div+div]:pt-6 [&>div+div]:border-t-[3px] [&>div+div]:border-t-[color:var(--color-dark-ink-muted)]">
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-4">
          This is a general privacy policy written for Al-Safr&apos;s current features. It has not been reviewed by a
          lawyer and should be checked against applicable law (including India&apos;s DPDP Act) before this site is
          used to process real customer data at scale.
        </p>

        <div>
          <h2>1. Who we are</h2>
          <p>Al-Safr (السفر) is operated by Al Safar Tours N Travels, registered at No-06, Classic Complex, Opp Mahindra Apts, Near Wipro, Shikaripalya, Hulimangala Post, Bengaluru — 560105.</p>
        </div>

        <div>
          <h2>2. Information we collect</h2>
          <ul>
            <li>Account details you provide when registering: name and email address.</li>
            <li>Information you submit through our Contact and Get a Quote forms: name, email, phone number, and the content of your message.</li>
            <li>Search parameters you enter (origin/destination, dates, guest counts) — used to query our flight, hotel, and cab suppliers, and not stored beyond your session unless you submit a form.</li>
          </ul>
        </div>

        <div>
          <h2>3. How we use your information</h2>
          <ul>
            <li>To respond to quote requests and general enquiries.</li>
            <li>To create and manage your account, if you register.</li>
            <li>To search live pricing from our third-party suppliers (Google Flights, Booking.com, OpenSky Network) on your behalf — your search terms are sent to these suppliers to retrieve results, but we do not share your name, email, or phone number with them.</li>
          </ul>
        </div>

        <div>
          <h2>4. Third-party suppliers</h2>
          <p>
            Live prices and availability shown on Al-Safr come from third-party suppliers: Google Flights (via RapidAPI)
            for flights, Booking.com (via RapidAPI) for hotels and car rental, and OpenSky Network for live aircraft
            tracking. Each of these has its own privacy practices for the data involved in serving a search request.
          </p>
        </div>

        <div>
          <h2>5. Data retention</h2>
          <p>
            Contact and quote form submissions are retained so our team can follow up. Account passwords are stored
            hashed and are never visible to our staff in plain text.
          </p>
        </div>

        <div>
          <h2>6. Contact us</h2>
          <p>
            For any privacy questions, reach us at{' '}
            <a href="mailto:luckysaj@gmail.com" className="text-brand-700 font-medium">luckysaj@gmail.com</a> or{' '}
            <a href="tel:+918904563397" className="text-brand-700 font-medium">+91 89045 63397</a> (WhatsApp: +91 89045 63396).
          </p>
        </div>
      </div>
    </StaticPageShell>
  );
}
