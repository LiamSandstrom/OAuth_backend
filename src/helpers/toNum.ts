export const toNum = (v: unknown): number | undefined =>
    typeof v !== "string" || v.trim() === "" || isNaN(Number(v)) ? undefined : Number(v)
