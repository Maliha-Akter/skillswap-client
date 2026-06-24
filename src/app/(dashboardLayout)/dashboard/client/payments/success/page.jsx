import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export default async function Success({ searchParams }) {
  const { session_id, task_id, proposal_id } = await searchParams;

  if (!session_id) {
    throw new Error('Please provide a valid session_id / payment_intent_id (`pi_...`)');
  }

  try {
    // 🔍 RETRIEVE PAYMENT INTENT INSTEAD OF CHECKOUT SESSION
    const paymentIntent = await stripe.paymentIntents.retrieve(session_id);

    // Stripe Payment Intent success state check
    if (paymentIntent.status !== 'succeeded') {
      return redirect('/dashboard/client/proposals');
    }

    /**
     * 🚨 DATABASE UPDATE REGION
     * Put your MongoDB updates here using task_id and proposal_id
     * You can also use paymentIntent.amount for verification
     */

    // Extracting fields cleanly from Stripe's internal payment intent properties
    const priceSize = (paymentIntent.amount / 100).toFixed(2);
    
    // Fallbacks look at payment description fields or custom metadata configurations
    const taskTitle = paymentIntent.metadata?.taskTitle || paymentIntent.description || "Target Job Listing";
    const workerName = paymentIntent.metadata?.freelancerEmail || "Assigned Freelancer";

    return (
      <section className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl">
          
          {/* Success Badge */}
          <div className="text-teal-400 text-5xl mb-4 animate-bounce">✓</div>
          
          <h1 className="text-xl font-bold uppercase tracking-wider mb-2">
            Payment Confirmed
          </h1>
          
          <p className="text-zinc-400 text-sm mb-6">
            We appreciate your business! Your transaction has been completed successfully.
          </p>

          {/* New Transaction Summary Information Panel Layout */}
          <div className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-left text-xs font-mono flex flex-col gap-3 mb-6">
            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-500">TASK TITLE:</span>
              <span className="text-zinc-200 font-bold max-w-[180px] truncate">{taskTitle}</span>
            </div>

            <div className="flex justify-between items-center border-b border-zinc-800/60 pb-1.5">
              <span className="text-zinc-500">WORKER NAME:</span>
              <span className="text-zinc-200 max-w-[180px] truncate">{workerName}</span>
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-zinc-500">PRICE SIZE:</span>
              <span className="text-teal-400 font-bold">${priceSize} USD</span>
            </div>
          </div>

          {/* Action Navigation Control */}
          <a 
            href="/dashboard/client" 
            className="inline-block w-full py-3 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
          >
            Go to Dashboard
          </a>

        </div>
      </section>
    );

  } catch (error) {
    console.error("Stripe retrieval verification error:", error);
    return redirect('/dashboard/client/proposals');
  }
}