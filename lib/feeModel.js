// lib/feeModel.js

export function calculateServiceFee(tipAmount) {
  if (tipAmount <= 10) return 1.0;
  if (tipAmount <= 20) return 1.3;
  if (tipAmount <= 30) return 1.6;
  if (tipAmount <= 35) return 1.8;
  if (tipAmount <= 50) return 2.0;
  return 2.5;
}

export function computeFinalAmounts(tipAmount, coverFee = true) {
  const serviceFee = calculateServiceFee(tipAmount);
  const total = coverFee ? tipAmount + serviceFee : tipAmount;
  const received = coverFee ? tipAmount : tipAmount - serviceFee;
  return {
    total: parseFloat(total.toFixed(2)),
    received: parseFloat(received.toFixed(2)),
    fee: parseFloat(serviceFee.toFixed(2))
  };
}
