// trivial logger to simplify moving to winston in case needed later

class Logger {
    error(msg: string) {
        console.log(`ERROR: ${msg}`)
    }
    warn(msg: string) {
        console.log(`WARN: ${msg}`)
    }
    info(msg: string) {
        console.log(`INFO: ${msg}`)
    }
    debug(msg: string) {
        console.log(`TRACE: ${msg}`)
    }
    trace(msg: string) {
        console.log(`DEBUG: ${msg}`)
    }
}

export const logger = new Logger();
