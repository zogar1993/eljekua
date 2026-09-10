export const create_auto_save_scheduler = ({
                                                 persist,
                                                 delay_ms = 300,
                                             }: {
    persist: () => Promise<void>
    delay_ms?: number
}) => {
    let suppress_auto_save = false
    let auto_save_timer: ReturnType<typeof setTimeout> | undefined
    let save_in_flight: Promise<void> | undefined

    const schedule_auto_save = () => {
        if (suppress_auto_save)
            return

        if (auto_save_timer !== undefined)
            clearTimeout(auto_save_timer)

        auto_save_timer = setTimeout(() => {
            auto_save_timer = undefined
            save_in_flight = persist().finally(() => {
                save_in_flight = undefined
            })
        }, delay_ms)
    }

    const flush_auto_save = async () => {
        if (auto_save_timer !== undefined) {
            clearTimeout(auto_save_timer)
            auto_save_timer = undefined
        }

        if (save_in_flight)
            await save_in_flight
        else if (!suppress_auto_save)
            await persist()
    }

    const run_without_auto_save = async <T>(fn: () => T | Promise<T>): Promise<T> => {
        suppress_auto_save = true
        if (auto_save_timer !== undefined) {
            clearTimeout(auto_save_timer)
            auto_save_timer = undefined
        }

        try {
            return await fn()
        } finally {
            suppress_auto_save = false
        }
    }

    const cancel_pending_save = async () => {
        if (auto_save_timer !== undefined) {
            clearTimeout(auto_save_timer)
            auto_save_timer = undefined
        }

        if (save_in_flight)
            await save_in_flight
    }

    return {
        schedule_auto_save,
        flush_auto_save,
        run_without_auto_save,
        cancel_pending_save,
    }
}
