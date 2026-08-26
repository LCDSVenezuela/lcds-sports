export const BCV_RATE = 250;

export function calculateBcvBs(referenceUsd: number) {
  return referenceUsd * BCV_RATE;
}

export function formatUsd(value: number) {
  return `$${value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatBs(value: number) {
  return `Bs. ${value.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}