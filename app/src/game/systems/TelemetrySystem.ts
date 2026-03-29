import { createTelemetryEvent, type TelemetryEvent } from "./telemetryMath.ts";

export class TelemetrySystem {
  private readonly events: TelemetryEvent[] = [];

  track(name: string, payload?: Record<string, unknown>): void {
    this.events.push(createTelemetryEvent(name, payload));
  }

  getEvents(): TelemetryEvent[] {
    return this.events;
  }
}
