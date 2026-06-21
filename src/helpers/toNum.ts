export const toNum = (v: unknown): number | undefined =>
    isNaN(Number(v)) ? undefined : Number(v)
