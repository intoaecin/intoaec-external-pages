type Listener = (...args: any[]) => void;

class BrowserEventEmitter {
  private readonly listeners = new Map<string, Set<Listener>>();

  on(eventName: string, listener: Listener) {
    const eventListeners = this.listeners.get(eventName) ?? new Set<Listener>();
    eventListeners.add(listener);
    this.listeners.set(eventName, eventListeners);
    return this;
  }

  removeListener(eventName: string, listener: Listener) {
    const eventListeners = this.listeners.get(eventName);
    eventListeners?.delete(listener);
    if (eventListeners?.size === 0) this.listeners.delete(eventName);
    return this;
  }

  off(eventName: string, listener: Listener) {
    return this.removeListener(eventName, listener);
  }

  emit(eventName: string, ...args: any[]) {
    for (const listener of this.listeners.get(eventName) ?? []) {
      listener(...args);
    }
    return this.listeners.has(eventName);
  }
}

export const macroEventEmitter = new BrowserEventEmitter();
export const textEditorEventEmitter = new BrowserEventEmitter();
export const AIGeneratorEventEmitter = new BrowserEventEmitter();
