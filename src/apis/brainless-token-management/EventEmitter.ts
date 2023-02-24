interface Events {
  [key: string]: Set<Function> | undefined;
}

export default class EventEmitter {
  private events: Events;

  constructor() {
    this.events = {};
  }

  _getEventListByName(eventName: string) {
    if (typeof this.events[eventName] === 'undefined') {
      this.events[eventName] = new Set();
    }
    return this.events[eventName];
  }

  on(eventName: string, fn: Function) {
    this._getEventListByName(eventName)?.add(fn);
  }

  once(eventName: string, fn: Function) {
    const onceFn = (...args: any[]) => {
      this.removeListener(eventName, onceFn);
      fn.apply(this, args);
    };
    this.on(eventName, onceFn);
  }

  emit(eventName: string, ...args: any[]) {
    this._getEventListByName(eventName)?.forEach((fn: Function) => {
      fn?.apply(this, args);
    });
  }

  removeListener(eventName: string, fn: Function) {
    this._getEventListByName(eventName)?.delete(fn);
  }
}
