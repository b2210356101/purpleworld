// utils/date.ts
export function parseBackendDate(arr: number[]): Date {
    const [year, month, day, hour, minute, second] = arr;
    return new Date(year, month - 1, day, hour, minute, second);
}