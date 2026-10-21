import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export type ConnectAuthor = {
  stripeConnectAccountId: string | null;
  stripeConnectOnboarded: boolean;
  stripeConnectType: string | null;
};

/** Standard = the author's own Stripe account (direct charges). Anything else is a legacy Express account. */
export function isStandardConnect(author: Pick<ConnectAuthor, "stripeConnectType">): boolean {
  return author.stripeConnectType === "standard";
}

// Direct charges calculate tax on the author's own account, which fails unless they
// activated Stripe Tax (origin address + registrations). Only turn it on when they have.
async function standardAccountTaxActive(accountId: string): Promise<boolean> {
  try {
    const settings = await stripe.tax.settings.retrieve({}, { stripeAccount: accountId });
    return settings.status === "active";
  } catch {
    return false;
  }
}

/**
 * How to create a Checkout Session for an author's sale, depending on how they're connected:
 *  - Standard: direct charge on the author's own account; AuthorLoft never holds the funds
 *    and only collects the optional application fee.
 *  - Legacy Express: destination charge on the platform, transferred to the author.
 *  - Not connected: charge stays on the platform account (as before).
 */
export async function getConnectCheckoutConfig(author: ConnectAuthor, platformFeeCents: number) {
  const accountId = author.stripeConnectAccountId;
  if (!accountId || !author.stripeConnectOnboarded) {
    return { requestOptions: undefined, paymentIntentData: undefined, automaticTax: true };
  }

  if (isStandardConnect(author)) {
    const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData | undefined =
      platformFeeCents > 0 ? { application_fee_amount: platformFeeCents } : undefined;
    return {
      requestOptions: { stripeAccount: accountId } as Stripe.RequestOptions,
      paymentIntentData,
      automaticTax: await standardAccountTaxActive(accountId),
    };
  }

  return {
    requestOptions: undefined,
    paymentIntentData: {
      application_fee_amount: platformFeeCents,
      transfer_data: { destination: accountId },
    } as Stripe.Checkout.SessionCreateParams.PaymentIntentData,
    automaticTax: true,
  };
}
