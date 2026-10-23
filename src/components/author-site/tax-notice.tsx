/** Shown under every buyer-facing checkout button: prices are before tax, which Stripe works out at checkout. */
export function TaxNotice({ className = "text-center" }: { className?: string }) {
  return (
    <p className={`text-xs text-gray-400 ${className}`}>
      Prices don&apos;t include sales tax or VAT. Any tax that applies is calculated at checkout.
    </p>
  );
}
