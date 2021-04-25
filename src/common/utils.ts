export function errorToStr(exc): string {
    return exc.message || `${exc}`;
}

interface BasicEmitter {
    emit(event: string, ...args: any[]): any;
    on(event: string, ...args: any[]): any;
    removeListener(event: string, func: any): any;
}

export function makeEmitterAPI<T extends object>(emitter: BasicEmitter): T {
    return new Proxy({} as T, {
        get: (target, method: string) => {
            return (...args: any[]) => emitter.emit(method, ...args);
        }
    });
}

export function connectEventsListener<T extends object>(emitter: BasicEmitter, listener: T) {
    for (const method in listener) {
        emitter.on(method, listener[method]);
    }
}

export function removeEventsListener<T extends object>(emitter: BasicEmitter, listener: T) {
    for (const method in listener) {
        emitter.removeListener(method, listener[method]);
    }
}
