import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; // 🌟 1. Required to read headers for auth
import { stripe } from '@/lib/stripe';
import { auth } from "@/lib/auth"; // 🌟 2. Import your server-side auth instance

export async function POST(request) {
  try {
    const headersList = await headers();

    // 🔒 Security Step A: Authenticate the user token on the Next.js server side
    const tokenData = await auth.api.getToken({
      headers: headersList,
    });
    
    if (!tokenData?.token) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    // 🔒 Security Step B: Fetch the active session to verify identity
    const session = await auth.api.getSession({
      headers: headersList,
    });
    const loggedInEmail = session?.user?.email;

    // Read JSON parameters sent from the frontend client
    const body = await request.json();
    const { taskId, proposalId, amount, taskTitle, clientEmail, freelancerEmail } = body;

    // 🔒 Security Step C: Cross-check identity to ensure they aren't spoofing another client
    if (!loggedInEmail || loggedInEmail !== clientEmail) {
      return NextResponse.json({ error: "Forbidden: You cannot create a checkout for another account." }, { status: 403 });
    }

    // Validation check to make sure core tracking fields exist
    if (!taskId || !proposalId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const unitAmount = Math.round(parseFloat(amount) * 100);

    // Secure PaymentIntent creation with validated metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: unitAmount,
      currency: 'usd',
      metadata: {
        taskId,
        proposalId,
        taskTitle: taskTitle || "Payment of Freelancer",
        clientEmail: loggedInEmail, // Use verified email directly for ironclad tracking
        freelancerEmail: freelancerEmail || ""
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("Stripe PaymentIntent Error:", err);
    return NextResponse.json({ error: err.message }, { status: err.statusCode || 500 });
  }
}