import { EventEmitter } from "events";

const globalForEventBus = globalThis as unknown as { eventBus?: EventEmitter };

export const eventBus = globalForEventBus.eventBus ?? new EventEmitter().setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalForEventBus.eventBus = eventBus;
}
