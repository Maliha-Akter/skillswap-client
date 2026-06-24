import { redirect } from 'next/navigation';
import CheckoutFormWrapper from './CheckoutFormWrapper';

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const { 
    client_secret, 
    proposal_id, 
    task_id, 
    amount, 
    task_title,
    freelancer_email,
    estimated_days,
    cover_note,
    status,
    submitted_at
  } = params;

  if (!proposal_id || !task_id) {
    return redirect('/dashboard/client/proposals');
  }

  const displayAmount = amount || "97";
  const displayTitle = task_title || "Alibaba Task";

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 md:p-8 selection:bg-amber-500/30">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-8">
        
        {/* Left Panel: Transaction Breakdown & Proposal Data */}
        <div className="md:col-span-5 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider uppercase text-xs">
            <span className="p-1.5 bg-amber-500/10 rounded-lg">⛊</span> TaskHive Secure Checkout
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-black tracking-tight">${displayAmount}</div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Total due today</div>
          </div>

          <div className="border-t border-zinc-900 pt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Task Title</span>
              <span className="font-semibold text-zinc-300 truncate max-w-[180px]">{displayTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Freelancer</span>
              <span className="font-mono text-zinc-300">{freelancer_email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Estimated Delivery</span>
              <span className="text-zinc-300 font-semibold">{estimated_days ? `${estimated_days} Days` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Proposal State</span>
              <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">{status || 'Pending'}</span>
            </div>
            {submitted_at && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Submitted On</span>
                <span className="text-zinc-400 text-[11px]">{new Date(submitted_at).toLocaleDateString()}</span>
              </div>
            )}
            
            {cover_note && (
              <div className="border-t border-zinc-900/60 pt-3 mt-1">
                <span className="text-zinc-500 block mb-1">Cover Note:</span>
                <p className="text-zinc-400 bg-zinc-950/50 p-2.5 rounded-lg border border-zinc-900 text-[11px] leading-relaxed italic max-h-24 overflow-y-auto">
                  "{cover_note}"
                </p>
              </div>
            )}

            <div className="flex justify-between border-t border-zinc-900/60 pt-3 text-sm font-bold">
              <span className="text-zinc-300">Total Charged</span>
              <span className="text-zinc-100">${displayAmount}</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Separate Input Fields */}
        <div className="md:col-span-7 bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-2xl">
          <h2 className="text-md font-bold tracking-wide uppercase text-zinc-200 mb-6 flex items-center gap-2">
            💳 Payment Details
          </h2>
          
          <CheckoutFormWrapper 
            amount={displayAmount} 
            taskId={task_id} 
            proposalId={proposal_id} 
            clientSecret={client_secret}
            freelancerEmail={freelancer_email}
          />
        </div>

      </div>
    </div>
  );
}