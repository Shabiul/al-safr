import { NextResponse } from 'next/server';
import { registerCustomer, EmailAlreadyRegisteredError } from '@/lib/registerCustomer';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password and name are required' }, { status: 400 });
  }

  try {
    const customer = await registerCustomer(email, password, name);
    return NextResponse.json(customer);
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
