// Gemini pricing (USD per 1M tokens) as of late 2025.
// Update here when Google adjusts pricing.
// Cost is tracked in "microcents" where 1 microcent = $0.000001.
//   → 1 cent = 10,000 microcents
//   → 1 USD = 1,000,000 microcents

type ModelPricing = {
  inputUsdPerMillion:  number;
  outputUsdPerMillion: number;
};

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gemini-2.5-flash":      { inputUsdPerMillion: 0.30, outputUsdPerMillion: 2.50  },
  "gemini-2.5-flash-lite": { inputUsdPerMillion: 0.10, outputUsdPerMillion: 0.40  },
  "gemini-2.5-pro":        { inputUsdPerMillion: 1.25, outputUsdPerMillion: 10.00 },
};

/** Returns cost in micro-cents (integer). Falls back to Flash pricing on unknown model. */
export function calcCostMicroCents(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING["gemini-2.5-flash"];
  // microcents per token = (usdPerMillion / 1_000_000) * 1_000_000 microcents/USD = usdPerMillion
  const inputCost  = inputTokens  * pricing.inputUsdPerMillion;
  const outputCost = outputTokens * pricing.outputUsdPerMillion;
  return Math.round(inputCost + outputCost);
}

export function microCentsToUsd(microCents: number): number {
  return microCents / 1_000_000;
}
