// Shared client-side configuration.
//
// The dashboard talks to its own Express server on the same origin. Integrations
// with a separate local gateway are opt-in: set VITE_GATEWAY_URL at build time
// to expose the "open gateway" links, otherwise they stay hidden.

export const GATEWAY_URL: string = import.meta.env.VITE_GATEWAY_URL || '';

export const GATEWAY_LINKS_ENABLED: boolean = GATEWAY_URL.length > 0;
