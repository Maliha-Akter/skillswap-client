'use client';

import React, { useState } from 'react';
// ✅ FIXED: Added useSearchParams hook import
import { useRouter, useSearchParams } from 'next/navigation'; 
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const inputStyleOptions = {
  style: {
    base: {
      fontSize: '14px',
      color: '#e4e4e7',
      fontFamily: 'monospace, sans-serif',
      '::placeholder': { color: '#52525b' },
    },
    invalid: { color: '#ef4444' },
  },
};

// We receive props here. If the parent doesn't pass clientEmail, we fallback to reading searchParams below.
function DiscreteCheckoutForm({ amount, taskId, proposalId, clientSecret, freelancerEmail, clientEmail: propClientEmail }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  // ✅ FIXED: Safely invoke the Next.js hook
  const searchParams = useSearchParams();
  
  // ✅ FIXED: Use the URL parameter if the prop didn't supply it
  const finalClientEmail = propClientEmail || searchParams.get('client_email') || '';

  const [isProcessing, setIsProcessing] = useState(false);
  const [cardName, setCardName] = useState('');

  // Use the validated fallback state value for the billing form details
  const [email, setEmail] = useState(finalClientEmail);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    setErrorMessage('');

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: cardName,
          email: email || finalClientEmail // Ensure fallback email value is committed
        },
      },
    });

    setIsProcessing(false);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {

      // Verified non-empty data check object log
      console.log("🚀 Redirecting to success page with data:", {
        proposalId,
        taskId,
        freelancerEmail,
        clientEmail: finalClientEmail, 
        amount
      });

      // ✅ FIXED: Swapped variable reference to finalClientEmail
      router.push(
        `/dashboard/client/payments/success?session_id=${result.paymentIntent.id}&proposal_id=${proposalId}&task_id=${taskId}&freelancer_email=${encodeURIComponent(freelancerEmail)}&client_email=${encodeURIComponent(finalClientEmail)}&amount=${amount}`
      );
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-5">
      {/* 1. Email Field */}


      {/* 2. Cardholder Name */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Cardholder Name</label>
        <input
          type="text"
          required
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Doe"
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
        />
      </div>

      {/* 3. Discrete Card Number Input */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Card Number</label>
        <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus-within:border-amber-500/50 transition-colors">
          <CardNumberElement options={inputStyleOptions} />
        </div>
      </div>

      {/* 4. Row layout split for Expiry and Security CVC elements */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Expiry Date</label>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus-within:border-amber-500/50 transition-colors">
            <CardExpiryElement options={inputStyleOptions} />
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">CVC</label>
          <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus-within:border-amber-500/50 transition-colors">
            <CardCvcElement options={inputStyleOptions} />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3 font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-xl flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
        ) : (
          `🔒 Securely Pay $${amount}`
        )}
      </button>
    </form>
  );
}

export default function CheckoutFormWrapper(props) {
  return (
    <Elements stripe={stripePromise}>
      <DiscreteCheckoutForm {...props} />
    </Elements>
  );
}