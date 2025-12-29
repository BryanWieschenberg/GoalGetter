export const TIMEZONES = Intl.supportedValuesOf("timeZone");

export function getEffectiveTimezone(userTimezone: string | null): string {
    if (!userTimezone || userTimezone === "system") {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return userTimezone;
}
