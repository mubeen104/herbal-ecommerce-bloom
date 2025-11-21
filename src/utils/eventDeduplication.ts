interface EventFingerprint {
  hash: string;
  timestamp: number;
}

class EventDeduplicationManager {
  private events: Map<string, EventFingerprint> = new Map();
  private ttl = 5000; // 5 seconds TTL for deduplication
  private storageKey = 'pixel_event_dedup';
  private transactionIds: Set<string> = new Set();
  private cleanupInterval?: number;

  constructor() {
    this.loadFromStorage();
    this.startCleanup();
  }

  private generateHash(eventType: string, data: any): string {
    const sortedData = JSON.stringify(data, Object.keys(data).sort());
    const str = `${eventType}_${sortedData}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${hash}_${eventType}`;
  }

  shouldTrack(eventType: string, data: any): boolean {
    const hash = this.generateHash(eventType, data);
    const existing = this.events.get(hash);

    if (!existing) {
      this.events.set(hash, {
        hash,
        timestamp: Date.now()
      });
      this.saveToStorage();
      return true;
    }

    // Check if event is still within TTL
    const age = Date.now() - existing.timestamp;
    if (age > this.ttl) {
      // Event is old enough, allow tracking again
      this.events.set(hash, {
        hash,
        timestamp: Date.now()
      });
      this.saveToStorage();
      return true;
    }

    // Event is duplicate within TTL window
    return false;
  }

  trackPurchase(orderId: string, data: any): boolean {
    // Check if this transaction was already tracked
    if (this.transactionIds.has(orderId)) {
      console.warn(`Purchase event for order ${orderId} already tracked`);
      return false;
    }

    // Mark transaction as tracked IMMEDIATELY to prevent race condition
    this.transactionIds.add(orderId);

    // Also add to event deduplication
    const hash = this.generateHash('purchase', { ...data, order_id: orderId });
    this.events.set(hash, {
      hash,
      timestamp: Date.now()
    });

    this.saveToStorage();
    return true;
  }

  isTransactionTracked(orderId: string): boolean {
    return this.transactionIds.has(orderId);
  }

  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);

        // Restore events
        if (data.events) {
          Object.entries(data.events).forEach(([key, value]: [string, any]) => {
            this.events.set(key, value);
          });
        }

        // Restore transaction IDs
        if (data.transactionIds) {
          this.transactionIds = new Set(data.transactionIds);
        }
      }
    } catch (error) {
      console.warn('Failed to load deduplication data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        events: Object.fromEntries(this.events),
        transactionIds: Array.from(this.transactionIds)
      };
      sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save deduplication data to storage:', error);
    }
  }

  private startCleanup(): void {
    // Clear existing interval first
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clean up old events every 10 seconds
    this.cleanupInterval = window.setInterval(() => {
      const now = Date.now();
      const toDelete: string[] = [];

      this.events.forEach((event, hash) => {
        if (now - event.timestamp > this.ttl) {
          toDelete.push(hash);
        }
      });

      toDelete.forEach(hash => this.events.delete(hash));

      if (toDelete.length > 0) {
        this.saveToStorage();
      }
    }, 10000);
  }

  clear(): void {
    this.events.clear();
    this.transactionIds.clear();
    sessionStorage.removeItem(this.storageKey);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }

  setTTL(milliseconds: number): void {
    this.ttl = milliseconds;
  }
}

export const eventDeduplication = new EventDeduplicationManager();
