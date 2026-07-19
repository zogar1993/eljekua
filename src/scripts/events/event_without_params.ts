type EventManagerWithoutParams = { raise: () => void, add_handler: (handler: () => void) => void }

export const create_event_without_params = (): EventManagerWithoutParams => {
    const handlers: Array<() => void> = []

    return {
        raise: () => {
            for (const handler of handlers)
                handler()
        },
        add_handler: (handler: () => void) => {
            handlers.push(handler)
        }
    }
}