import bcrypt from 'bcryptjs';
import { prisma } from './index';

async function demo() {
  const customerPassword = await bcrypt.hash('customer-demo-pass', 10);
  const customer = await prisma.customer.upsert({
    where: { email: 'demo.customer@al-safr.test' },
    update: {},
    create: {
      email: 'demo.customer@al-safr.test',
      hashedPassword: customerPassword,
      name: 'Demo Customer',
    },
  });

  const staffPassword = await bcrypt.hash('staff-demo-pass', 10);
  const staff = await prisma.staffUser.upsert({
    where: { email: 'demo.staff@al-safr.test' },
    update: {},
    create: {
      email: 'demo.staff@al-safr.test',
      hashedPassword: staffPassword,
      name: 'Demo Staff',
      role: 'SUPER_ADMIN',
    },
  });

  const fetchedCustomer = await prisma.customer.findUniqueOrThrow({ where: { email: customer.email } });
  const fetchedStaff = await prisma.staffUser.findUniqueOrThrow({ where: { email: staff.email } });

  if (fetchedCustomer.email !== customer.email) {
    throw new Error('FAIL: customer not fetchable by email');
  }
  if (fetchedStaff.email !== staff.email) {
    throw new Error('FAIL: staff not fetchable by email');
  }

  const wrongPasswordMatches = await bcrypt.compare('totally-wrong-password', fetchedStaff.hashedPassword);
  if (wrongPasswordMatches) {
    throw new Error('FAIL: wrong password matched staff hash');
  }

  console.log('demo() passed: customer + staff seeded, fetched, and password check verified.');

  // Sample catalogue content — admin create/edit/publish tooling is a later
  // phase, so for now the public listing is backed by these seeded rows.
  const samplePackages = [
    {
      slug: 'dubai-desert-and-skyline-5d',
      name: 'Dubai Desert & Skyline',
      destination: 'Dubai, UAE',
      summary: 'Burj Khalifa, desert safari, and Marina nightlife in one 5-day trip.',
      description:
        'Experience the best of Dubai: the world\'s tallest building, a golden-hour desert safari with BBQ dinner, and an evening dhow cruise along Dubai Marina.',
      durationDays: 5,
      priceUsd: 899,
      images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200'],
      inclusions: ['4-star hotel accommodation', 'Daily breakfast', 'Desert safari with BBQ dinner', 'Burj Khalifa (124th floor) tickets', 'Airport transfers'],
      exclusions: ['International flights', 'Visa fees', 'Travel insurance', 'Personal expenses'],
      itinerary: [
        { day: 1, title: 'Arrival & Marina Cruise', description: 'Airport pickup, hotel check-in, evening dhow cruise with dinner.' },
        { day: 2, title: 'City Tour & Burj Khalifa', description: 'Dubai Museum, Gold Souk, and sunset views from Burj Khalifa.' },
        { day: 3, title: 'Desert Safari', description: 'Dune bashing, camel riding, and a BBQ dinner under the stars.' },
        { day: 4, title: 'Leisure & Shopping', description: 'Free day for Dubai Mall, beaches, or optional Abu Dhabi day trip.' },
        { day: 5, title: 'Departure', description: 'Check-out and airport transfer.' },
      ],
    },
    {
      slug: 'kerala-backwaters-4d',
      name: 'Kerala Backwaters Escape',
      destination: 'Kerala, India',
      summary: 'Houseboat stays, tea gardens, and Ayurvedic wellness in God\'s Own Country.',
      description:
        'A relaxed 4-day trip through Kerala\'s backwaters and hill stations, including an overnight houseboat cruise and a traditional Ayurvedic massage.',
      durationDays: 4,
      priceUsd: 420,
      images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200'],
      inclusions: ['Houseboat overnight stay', 'All meals on houseboat', 'Ayurvedic massage session', 'Private car with driver'],
      exclusions: ['Flights to Kochi', 'Alcoholic beverages', 'Tips'],
      itinerary: [
        { day: 1, title: 'Kochi Arrival', description: 'Pickup from Kochi airport, Fort Kochi heritage walk.' },
        { day: 2, title: 'Munnar Tea Gardens', description: 'Drive to Munnar, visit tea plantations and viewpoints.' },
        { day: 3, title: 'Alleppey Houseboat', description: 'Board a private houseboat, cruise the backwaters overnight.' },
        { day: 4, title: 'Departure', description: 'Disembark and transfer to Kochi airport.' },
      ],
    },
    {
      slug: 'swiss-alps-highlights-6d',
      name: 'Swiss Alps Highlights',
      destination: 'Switzerland',
      summary: 'Zurich, Lucerne, and a scenic train ride through the Alps.',
      description:
        'Six days through Switzerland\'s most photogenic stops, including the Glacier Express and a cable car ride up Mount Titlis.',
      durationDays: 6,
      priceUsd: 2150,
      images: ['https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200'],
      inclusions: ['4-star hotels', 'Daily breakfast', 'Swiss Travel Pass', 'Mount Titlis cable car', 'Airport transfers'],
      exclusions: ['International flights', 'Lunch and dinner', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Arrival in Zurich', description: 'Check-in and a relaxed evening walking along Lake Zurich.' },
        { day: 2, title: 'Lucerne & Mount Titlis', description: 'Day trip to Lucerne, cable car to Mount Titlis for snow views.' },
        { day: 3, title: 'Interlaken', description: 'Scenic train to Interlaken, free time by the lakes.' },
        { day: 4, title: 'Jungfraujoch', description: 'Excursion to "Top of Europe" at Jungfraujoch.' },
        { day: 5, title: 'Glacier Express', description: 'Panoramic train ride through the Alps to Zermatt.' },
        { day: 6, title: 'Departure', description: 'Return to Zurich for departure.' },
      ],
    },
  ];

  for (const pkg of samplePackages) {
    await prisma.tourPackage.upsert({
      where: { slug: pkg.slug },
      update: {},
      create: pkg,
    });
  }

  const packageCount = await prisma.tourPackage.count({ where: { published: true } });
  if (packageCount < samplePackages.length) {
    throw new Error('FAIL: expected sample tour packages were not seeded');
  }

  console.log(`demo() passed: ${packageCount} published tour packages available.`);
}

demo()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
