class AnimationQueueClass {
    animations: Array<() => number> = []

    add_animation = (animation: () => number) => {
        if (this.animations.length > 0) {
            this.animations.push(animation)
            return
        }

        this.animations.push(animation)
        this.play_next_animation()
    }

    private play_next_animation = () => {
        if (this.animations.length === 0)
            return

        const time = this.animations[0]()
        setTimeout(() => {
            this.animations = this.animations.slice(1)
            this.play_next_animation()
        }, time)
    }
}

export const AnimationQueue = new AnimationQueueClass()
