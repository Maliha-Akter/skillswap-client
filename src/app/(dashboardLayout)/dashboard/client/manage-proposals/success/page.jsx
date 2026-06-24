import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
 // Make sure this path points to your lib/stripe

export default async function Success({ searchParams }) {
  const { session_id, task_id, proposal_id } = await searchParams;

  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }

  // Retrieve the session exactly like your documentation example
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent'],
  });

  // Check the status using Stripe's exact properties
  if (session.status === 'open') {
    return redirect('/');
  }

  if (session.status === 'complete') {
    /**
     * 🚨 DATABASE UPDATE REGION
     * Put your MongoDB updates here using task_id and proposal_id
     */
    
    return (
      <section className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full">
          <div className="text-teal-400 text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold uppercase tracking-wider mb-2">
            Payment Confirmed
          </h1>
          <p className="text-zinc-400 text-sm mb-6">
            We appreciate your business! Amount Processed: ${(session.amount_total / 100).toFixed(2)} USD.
          </p>
          <a 
            href="/dashboard/client" 
            className="inline-block w-full py-3 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
          >
            Go to Dashboard
          </a>
        </div>
      </section>
    );
  }
}