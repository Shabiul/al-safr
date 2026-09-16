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
    {
      slug: 'paris-romance-4d',
      name: 'Paris Romance',
      destination: 'Paris, France',
      summary: 'Eiffel Tower, the Louvre, and a Seine river cruise.',
      description:
        'A classic 4-day Paris getaway: the Eiffel Tower, world-class art at the Louvre, Montmartre\'s cobbled streets, and an evening Seine river cruise.',
      durationDays: 4,
      priceUsd: 1180,
      images: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200'],
      inclusions: ['4-star hotel accommodation', 'Daily breakfast', 'Skip-the-line Louvre tickets', 'Seine river cruise', 'Airport transfers'],
      exclusions: ['International flights', 'Lunch and dinner', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Arrival & Eiffel Tower', description: 'Check-in, evening at the Eiffel Tower and Trocadéro gardens.' },
        { day: 2, title: 'The Louvre & Île de la Cité', description: 'Louvre Museum, Notre-Dame exterior, Sainte-Chapelle.' },
        { day: 3, title: 'Montmartre & Seine Cruise', description: 'Sacré-Cœur, artist squares, evening river cruise.' },
        { day: 4, title: 'Departure', description: 'Free morning for shopping, airport transfer.' },
      ],
    },
    {
      slug: 'bali-island-getaway-5d',
      name: 'Bali Island Getaway',
      destination: 'Bali, Indonesia',
      summary: 'Rice terraces, beach clubs, and Uluwatu\'s cliffside temples.',
      description:
        'Five days across Bali\'s highlights: Ubud\'s rice terraces and monkey forest, beach time in Seminyak, and a sunset visit to Uluwatu Temple.',
      durationDays: 5,
      priceUsd: 640,
      images: ['https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200'],
      inclusions: ['4-star resort accommodation', 'Daily breakfast', 'Private driver for 2 days', 'Uluwatu Temple sunset tour', 'Airport transfers'],
      exclusions: ['International flights', 'Visa on arrival fee', 'Spa treatments'],
      itinerary: [
        { day: 1, title: 'Arrival in Denpasar', description: 'Transfer to Seminyak, evening beach walk.' },
        { day: 2, title: 'Ubud Highlights', description: 'Tegallalang rice terraces, Sacred Monkey Forest, local art villages.' },
        { day: 3, title: 'Beach Day', description: 'Free day at Seminyak or Canggu beach clubs.' },
        { day: 4, title: 'Uluwatu Temple', description: 'Cliffside temple visit, Kecak fire dance at sunset.' },
        { day: 5, title: 'Departure', description: 'Free morning, transfer to airport.' },
      ],
    },
    {
      slug: 'maldives-overwater-4d',
      name: 'Maldives Overwater Escape',
      destination: 'Maldives',
      summary: 'Overwater villa, snorkeling, and private sandbank picnic.',
      description:
        'A 4-day tropical escape in an overwater villa, with snorkeling among coral reefs and a private sandbank picnic.',
      durationDays: 4,
      priceUsd: 1850,
      images: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200'],
      inclusions: ['Overwater villa accommodation', 'All meals (full board)', 'Speedboat transfers', 'Snorkeling equipment', 'Sandbank picnic'],
      exclusions: ['International flights', 'Seaplane transfer surcharge (if applicable)', 'Alcoholic beverages'],
      itinerary: [
        { day: 1, title: 'Arrival', description: 'Speedboat transfer to resort, evening at leisure.' },
        { day: 2, title: 'Snorkeling & Reef Tour', description: 'Guided snorkeling trip to the house reef.' },
        { day: 3, title: 'Sandbank Picnic', description: 'Private picnic on a nearby sandbank.' },
        { day: 4, title: 'Departure', description: 'Morning at leisure, transfer to airport.' },
      ],
    },
    {
      slug: 'tokyo-modern-and-traditional-6d',
      name: 'Tokyo: Modern & Traditional',
      destination: 'Tokyo, Japan',
      summary: 'Shibuya crossing, Senso-ji Temple, and a day trip to Mount Fuji.',
      description:
        'Six days balancing Tokyo\'s neon-lit modern side with its traditional temples, plus a day trip to the Mount Fuji region.',
      durationDays: 6,
      priceUsd: 1980,
      images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200'],
      inclusions: ['4-star hotel accommodation', 'Daily breakfast', 'JR rail pass (regional)', 'Mount Fuji day trip', 'Airport transfers'],
      exclusions: ['International flights', 'Lunch and dinner', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Arrival in Tokyo', description: 'Check-in, evening at Shibuya Crossing and Shinjuku.' },
        { day: 2, title: 'Asakusa & Senso-ji', description: 'Senso-ji Temple, Nakamise shopping street, Tokyo Skytree.' },
        { day: 3, title: 'Akihabara & Harajuku', description: 'Anime/electronics district, Harajuku fashion streets.' },
        { day: 4, title: 'Mount Fuji Day Trip', description: 'Lake Kawaguchiko views and Mount Fuji 5th Station.' },
        { day: 5, title: 'Free Day', description: 'Optional Disneyland/DisneySea or teamLab digital art museum.' },
        { day: 6, title: 'Departure', description: 'Free morning, airport transfer.' },
      ],
    },
    {
      slug: 'santorini-sunset-4d',
      name: 'Santorini Sunset Escape',
      destination: 'Santorini, Greece',
      summary: 'Whitewashed villages, volcanic beaches, and the famous Oia sunset.',
      description:
        'Four days on Santorini: caldera-view towns, a volcanic-sand beach, and a boat trip to catch the island\'s legendary sunset from Oia.',
      durationDays: 4,
      priceUsd: 1050,
      images: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200'],
      inclusions: ['Caldera-view hotel accommodation', 'Daily breakfast', 'Catamaran sunset cruise', 'Airport/port transfers'],
      exclusions: ['International flights', 'Lunch and dinner', 'Wine tasting tours'],
      itinerary: [
        { day: 1, title: 'Arrival in Fira', description: 'Check-in, evening walk along the caldera rim.' },
        { day: 2, title: 'Oia & Sunset', description: 'Explore Oia\'s blue-domed churches, watch the famous sunset.' },
        { day: 3, title: 'Catamaran Cruise', description: 'Sail past volcanic hot springs and Red Beach, swim stops.' },
        { day: 4, title: 'Departure', description: 'Free morning, transfer to the airport.' },
      ],
    },
    {
      slug: 'thailand-bangkok-phuket-6d',
      name: 'Thailand: Bangkok & Phuket',
      destination: 'Thailand',
      summary: 'Grand Palace temples in Bangkok, then island beaches in Phuket.',
      description:
        'Six days combining Bangkok\'s temples and street food with beach relaxation and an island-hopping speedboat tour from Phuket.',
      durationDays: 6,
      priceUsd: 780,
      images: ['https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200'],
      inclusions: ['4-star hotel accommodation (both cities)', 'Daily breakfast', 'Domestic flight Bangkok–Phuket', 'Phi Phi Islands speedboat tour', 'Airport transfers'],
      exclusions: ['International flights', 'Lunch and dinner', 'Travel insurance'],
      itinerary: [
        { day: 1, title: 'Arrival in Bangkok', description: 'Check-in, evening at Asiatique riverside market.' },
        { day: 2, title: 'Grand Palace & Temples', description: 'Grand Palace, Wat Pho, Wat Arun.' },
        { day: 3, title: 'Fly to Phuket', description: 'Domestic flight, evening at Patong Beach.' },
        { day: 4, title: 'Phi Phi Islands', description: 'Full-day speedboat tour to Phi Phi and Maya Bay.' },
        { day: 5, title: 'Beach Day', description: 'Free day to relax at the resort or explore Old Phuket Town.' },
        { day: 6, title: 'Departure', description: 'Transfer to Phuket airport.' },
      ],
    },
    {
      slug: 'rajasthan-royal-heritage-7d',
      name: 'Rajasthan Royal Heritage',
      destination: 'Rajasthan, India',
      summary: 'Jaipur\'s forts, Udaipur\'s lakes, and Jodhpur\'s blue city.',
      description:
        'A seven-day journey through Rajasthan\'s royal history: Jaipur\'s Amber Fort, Udaipur\'s lake palaces, and Jodhpur\'s Mehrangarh Fort.',
      durationDays: 7,
      priceUsd: 690,
      images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200'],
      inclusions: ['Heritage hotel accommodation', 'Daily breakfast', 'Private air-conditioned car with driver', 'All monument entry fees', 'Airport transfers'],
      exclusions: ['International/domestic flights', 'Lunch and dinner', 'Camera fees at monuments'],
      itinerary: [
        { day: 1, title: 'Arrival in Jaipur', description: 'Check-in, evening at local bazaars.' },
        { day: 2, title: 'Amber Fort & City Palace', description: 'Amber Fort, City Palace, Hawa Mahal photo stop.' },
        { day: 3, title: 'Drive to Udaipur', description: 'Scenic drive, evening at leisure by Lake Pichola.' },
        { day: 4, title: 'Udaipur Lakes', description: 'City Palace Udaipur, boat ride on Lake Pichola.' },
        { day: 5, title: 'Drive to Jodhpur', description: 'Travel to the "Blue City", evening at Clock Tower market.' },
        { day: 6, title: 'Mehrangarh Fort', description: 'Explore Mehrangarh Fort and Jaswant Thada.' },
        { day: 7, title: 'Departure', description: 'Transfer to Jodhpur airport.' },
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
