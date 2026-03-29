export interface TelemetryEvent {
  name: string;
  payload?: Record<string, unknown>;
}

export function createTelemetryEvent(
  name: string,
  payload?: Record<string, unknown>,
): TelemetryEvent {
  return { name, payload };
}
