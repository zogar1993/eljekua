class AnimationQueueClass {
    animations: Array<() => number> = []
    on_animation_start_handlers: Array<() => void> = []
    on_animation_end_handlers: Array<() => void> = []


    add_animation = (animation: () => number) => {
        if (this.animations.length > 0) {
            this.animations.push(animation)
            return
        }

        this.on_animation_start_handlers.forEach(handler => handler())

        this.animations.push(animation)
        this.play_next_animation()
    }

    private play_next_animation = () => {
        if (this.animations.length === 0) {
            this.on_animation_end_handlers.forEach(handler => handler())
            return
        }

        const time = this.animations[0]()
        setTimeout(() => {
            this.animations = this.animations.slice(1)
            this.play_next_animation()
        }, time)
    }

    add_on_animation_start_handler = (handler: () => void) => {
        this.on_animation_start_handlers.push(handler)
    }

    add_on_animation_end_handler = (handler: () => void) => {
        this.on_animation_end_handlers.push(handler)
    }
}

export const AnimationQueue = new AnimationQueueClass()