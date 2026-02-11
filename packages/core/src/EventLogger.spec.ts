import { EventLogger } from './EventLogger';

jest.useFakeTimers();
global.fetch = jest.fn();

const MOCK_TELEMETRY = {} as any;
const eventLoggerConfig = {
  maxBatchSize: 5,
  intervalDurationMs: 100,
  logEventURL: 'https://web.stytch.com/web/sdk/events',
};

describe('EventLogger', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  const expectPost = (body: unknown) => {
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching('/web/sdk/events'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('Logs events in a batch according to a set heartbeat duration', () => {
    const el = new EventLogger(eventLoggerConfig);
    el.logEvent(MOCK_TELEMETRY, { test: 'event1' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event2' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event3' });
    jest.advanceTimersByTime(100);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expectPost([
      { telemetry: {}, event: { test: 'event1' } },
      { telemetry: {}, event: { test: 'event2' } },
      { telemetry: {}, event: { test: 'event3' } },
    ]);
  });

  it('Does not post anything until there are events to log', () => {
    const el = new EventLogger(eventLoggerConfig);

    jest.advanceTimersByTime(500);
    expect(global.fetch).toHaveBeenCalledTimes(0);

    el.logEvent(MOCK_TELEMETRY, { test: 'event1' });
    jest.advanceTimersByTime(100);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expectPost([{ telemetry: {}, event: { test: 'event1' } }]);
  });

  it('Posts immediately if there are enough events in the batch', () => {
    const el = new EventLogger({
      ...eventLoggerConfig,
      maxBatchSize: 3,
    });
    el.logEvent(MOCK_TELEMETRY, { test: 'event1' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event2' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event3' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event4' });
    el.logEvent(MOCK_TELEMETRY, { test: 'event5' });

    // We added enough events to publish one batch immediately
    expect(global.fetch).toHaveBeenCalledTimes(1);

    expectPost([
      { telemetry: {}, event: { test: 'event1' } },
      { telemetry: {}, event: { test: 'event2' } },
      { telemetry: {}, event: { test: 'event3' } },
    ]);

    // But there should still be some left for when the clock rolls around again
    jest.advanceTimersByTime(100);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expectPost([
      { telemetry: {}, event: { test: 'event4' } },
      { telemetry: {}, event: { test: 'event5' } },
    ]);
  });
});
