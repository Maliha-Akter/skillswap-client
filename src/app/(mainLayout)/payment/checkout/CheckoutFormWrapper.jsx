'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

function DiscreteCheckoutForm({ amount, taskId, proposalId, clientSecret, freelancerEmail }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState(freelancerEmail || '');
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
          email: email
        },
      },
    });

    setIsProcessing(false);

    if (result.error) {
      setErrorMessage(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      router.push(`/dashboard/client/payments/success?session_id=${result.paymentIntent.id}&proposal_id=${proposalId}&task_id=${taskId}`);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit} className="space-y-5">
      {/* 1. Email Field */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Billing Email Address</label>
        <input 
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="client@example.com"
          className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-700 outline-none transition-colors"
        />
      </div>

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