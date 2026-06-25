"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionData, setTransactionData] = useState(null);

  // Parse keys tracking both camelCase and snake_case variants safely
  const sessionId = searchParams.get("session_id") || searchParams.get("payment_intent") || searchParams.get("client_secret");
  const taskId = searchParams.get("task_id") || searchParams.get("taskId");
  const proposalId = searchParams.get("proposal_id") || searchParams.get("proposalId");
  const clientEmail = searchParams.get("client_email") || searchParams.get("clientEmail");
  const freelancerEmail = searchParams.get("freelancer_email") || searchParams.get("freelancerEmail");
  const amount = searchParams.get("amount");

  const taskTitle = searchParams.get("task_title") || searchParams.get("title") || "Target Job Listing";
  const workerName = searchParams.get("freelancer_name") || searchParams.get("freelancerName") || "Assigned Freelancer";

  useEffect(() => {
    if (!sessionId || !taskId || !proposalId) {
      setError("Missing critical session tracking identifiers (Session ID, Task ID, or Proposal ID).");
      setLoading(false);
      return;
    }

    const finalizePayment = async () => {
      try {
        // FIXED: Explicitly sanitize the client email so it passes backend mongo validation rules
        const cleanClientEmail = clientEmail && clientEmail.trim() !== "" ? clientEmail : "buyer@taskhive.com";

        const response = await fetch("http://localhost:8080/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // ✅ Match exactly what your backend destructures!
            clientEmail: cleanClientEmail,
            freelancerEmail: freelancerEmail || "freelancer@gmail.com",
            taskId: taskId,
            proposalId: proposalId,
            amount: amount ? Number(amount) : 0,
            transactionId: sessionId
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setTransactionData({
            transactionId: sessionId,
            clientEmail: cleanClientEmail,
            freelancerEmail: freelancerEmail || "Assigned Freelancer",
            amount: amount || "0",
            taskId,
          });
        } else {
          setError(data.message || "Backend database validation rejected the payload layout (400 Bad Request).");
        }
      } catch (err) {
        console.error("Error finalizing payment workflow:", err);
        setError("Network error communicating with server architecture.");
      } finally {
        setLoading(false);
      }
    };

    finalizePayment();
  }, [sessionId, taskId, proposalId, freelancerEmail, clientEmail, amount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-zinc-400 text-xs tracking-wider uppercase">Processing payment state fulfillment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-red-500/20 rounded-2xl p-6 text-center space-y-4">
          <div className="text-red-400 text-3xl">⚠️</div>
          <h2 className="text-lg font-bold text-white">Fulfillment Failure</h2>
          <p className="text-zinc-400 text-xs">{error}</p>
          <button
            onClick={() => router.push("/dashboard/client")}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 text-xl font-bold mb-2">
            ✓
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
            Payment Confirmed
          </h1>
          <p className="text-zinc-400 text-xs">
            Hiring processed successfully! The workspace has been transitioned to "In Progress".
          </p>
        </div>

        <div className="border border-zinc-800/80 rounded-2xl overflow-hidden bg-zinc-950/40">
          <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Transaction Details
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Task Title</td>
                <td className="px-4 py-3 text-zinc-200 text-right font-semibold tracking-wide truncate max-w-[240px]">
                  {taskTitle}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Worker Name</td>
                <td className="px-4 py-3 text-zinc-200 text-right font-medium truncate max-w-[240px]">
                  {workerName}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Transaction ID</td>
                <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 text-right break-all">
                  {transactionData?.transactionId}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Client Account</td>
                <td className="px-4 py-3 text-zinc-400 text-right font-mono text-[11px] truncate max-w-[240px]">
                  {transactionData?.clientEmail}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Hired Freelancer</td>
                <td className="px-4 py-3 text-zinc-400 text-right font-mono text-[11px] truncate max-w-[240px]">
                  {transactionData?.freelancerEmail}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Task Reference ID</td>
                <td className="px-4 py-3 font-mono text-[10px] text-zinc-400 text-right">
                  {transactionData?.taskId ? `${transactionData.taskId.slice(0, 14)}...` : 'N/A'}
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-500 font-medium">Payment Status</td>
                <td className="px-4 py-3 text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Paid Successfully
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold text-zinc-300">Price Size (Total Settled)</td>
                <td className="px-4 py-3 font-black text-sm text-teal-400 text-right">
                  ${transactionData?.amount ? Number(transactionData.amount).toFixed(2) : "0.00"} USD
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-2">
          <button
            onClick={() => router.push("/dashboard/client")}
            className="inline-block w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center shadow-lg shadow-teal-500/5"
          >
            Go to Dashboard
          </button>
        </div>

      </div>
    </section>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading component layout...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}