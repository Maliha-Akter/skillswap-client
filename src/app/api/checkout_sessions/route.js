// import { NextResponse } from 'next/server'
// import { headers } from 'next/headers'
// import { stripe } from '@/lib/stripe';

// export async function POST(request) {
//   try {
//     const headersList = await headers()
//     const origin = headersList.get('origin')

//     // 1. Read JSON parameters sent from our frontend button handler
//     const body = await request.json();
//     const { taskId, proposalId, amount, taskTitle } = body;

//     // Validation check to make sure parameters exist
//     if (!taskId || !proposalId || !amount) {
//       return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
//     }

//     // 2. Convert raw numeric bid amount into currency cents (e.g., $97 -> 9700)
//     const unitAmount = Math.round(parseFloat(amount) * 100);

//     // 3. Create Stripe Checkout Session dynamically
//     const session = await stripe.checkout.sessions.create({
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: taskTitle || "Payment of Freelancer", 
//               description: `Payment for proposal on task: ${taskTitle || "Target Job Listing"}`,
//             },
//             unit_amount: unitAmount, 
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment', 
//       success_url: `${origin}/dashboard/client/payments/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${origin}/dashboard/client/proposals`,
//       metadata: {
//         taskId,
//         proposalId,
//       },
//     });

//     // 4. Return the new session object containing the direct redirect URL string
//     return NextResponse.json({ url: session.url });

//   } catch (err) {
//     console.error("Stripe Checkout Error:", err);
//     return NextResponse.json(
//       { error: err.message },
//       { status: err.statusCode || 500 }
//     )
//   }
// }



import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    const { taskId, proposalId, amount, taskTitle } = body;

    // Validation check to make sure parameters exist
    if (!taskId || !proposalId || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Convert raw numeric bid amount into currency cents (e.g., $97 -> 9700)
    const unitAmount = Math.round(parseFloat(amount) * 100);

    // Create a PaymentIntent instead of a Checkout Session
    const paymentIntent = await stripe.paymentIntents.create({
      amount: unitAmount,
      currency: 'usd',
      metadata: {
        taskId,
        proposalId,
        taskTitle: taskTitle || "Payment of Freelancer"
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the clientSecret so your frontend custom form can process the payment locally
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("Stripe PaymentIntent Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}