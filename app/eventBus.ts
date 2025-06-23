import { TransactionWithCategory } from "@/utils/supabase/supabase";

type Listener<T = unknown> = (payload: T) => void;

class EventBus<T> {
  private listeners: Record<string, Listener<T>[]> = {};

  on(event: string, listener: Listener<T>): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  off(event: string, listener: Listener<T>): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  emit(event: string, payload: T): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((listener) => listener(payload));
  }
}

export type TransactionEventBusPayload = {
  prev: TransactionWithCategory | null;
  current: TransactionWithCategory;
};
export const transactionEventBus = new EventBus<TransactionEventBusPayload>();
