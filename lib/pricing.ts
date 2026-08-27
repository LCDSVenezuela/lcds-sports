export function calculateBcvBs(referenceUsd: number, rateBcv: number) {
  return referenceUsd * rateBcv;
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
