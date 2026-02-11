import { SDKTelemetry } from './NetworkClient';

export const DEFAULT_MAX_BATCH_SIZE = 15;
export const DEFAULT_INTERVAL_DURATION_MS = 800;

type EventLoggerArgs = {
  maxBatchSize: number;
  intervalDurationMs: number;
  logEventURL: string;
};

export class EventLogger {
  private maxBatchSize: number;
  private logEventURL: string;
  private batch: Record<string, unknown>[];

  constructor(args: EventLoggerArgs) {
    this.maxBatchSize = args.maxBatchSize;
    this.logEventURL = args.logEventURL;
    // TODO: If we create more than one of these, we'll want a mechanism to clean up the intervals
    setInterval(this.flush.bind(this), args.intervalDurationMs);
    this.batch = [];
  }

  logEvent(telemetry: SDKTelemetry, event: Record<string, unknown>) {
    this.batch.push({ telemetry, event });
    if (this.batch.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  async flush() {
    if (!this.batch.length) {
      return;
    }
    const batchToSubmit = this.batch;
    this.batch = [];
    try {
      await fetch(this.logEventURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchToSubmit),
      });
    } catch {
      // Silently ignore fetch errors
    }
  }
}
