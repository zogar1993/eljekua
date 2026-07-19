type EventHandler<T> = (_: T) => void;

type EventManagerWithParams<T> = { raise: (props: T) => void, add_handler: (handler: EventHandler<T>) => void }

export const create_event_with_params = <T>(): EventManagerWithParams<T> => {
    const handlers: Array<EventHandler<T>> = []

    return {
        raise: (props: T) => {
            for (const handler of handlers)
                handler(props)
        },
        add_handler: (handler: EventHandler<T>) => {
            handlers.push(handler)
        }
    }
}