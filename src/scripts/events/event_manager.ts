
type EventHandler<T = void> = [T] extends [void] ? () => void : (_: T) => void;

type EventManager<T = void> = {
    raise: [T] extends [void] ? () => void : (props: T) => void,
    add_handler: (handler: EventHandler<T>) => void,
}

export const create_event_manager = <T = void>(): EventManager<T> => {
    const handlers: Array<EventHandler<T>> = []

    return {
        raise: ((props?: T) => {
            for (const handler of handlers)
                (handler as (props: T) => void)(props as T)
        }) as EventManager<T>['raise'],
        add_handler: (handler: EventHandler<T>) => {
            handlers.push(handler)
        }
    }
}