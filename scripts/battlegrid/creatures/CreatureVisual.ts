import {Position} from "battlegrid/Position";

export type CreatureVisual = {
    place_at: (position: Position) => void
    receive_damage: ({hp, damage}: {hp: number, damage: number}) => void
    display_miss: () => void
}

export class VisualCreatureCreator {
    create({image, position, hp}: {
        image: string,
        position: Position,
        hp: { current: number, max: number }
    }): CreatureVisual {
        const creature = document.createElement("div")
        creature.classList.add("creature")
        creature.style.setProperty("--creature__image", image)

        creature.style.setProperty("--creature_position-x", `${position.x}`)
        creature.style.setProperty("--creature_position-y", `${position.y}`)

        creature.style.setProperty("--creature__lifebar_max-hp", `${hp.max}`)
        creature.style.setProperty("--creature__lifebar_current-hp", `${hp.current}`)

        creature.style.setProperty("--fading-text_animation-duration", `${FADING_TEXT_ANIMATION_DURATION}ms`)

        const sprite = document.createElement("div")
        sprite.classList.add("creature__image")
        creature.appendChild(sprite)

        const lifebar = document.createElement("div")
        lifebar.classList.add("creature__lifebar")
        creature.appendChild(lifebar)

        const html_creatures = document.getElementById("creatures")!
        html_creatures.appendChild(creature)

        return {
            place_at: (position: Position) => {
                creature.style.setProperty("--creature_position-x", `${position.x}`)
                creature.style.setProperty("--creature_position-y", `${position.y}`)
            },
            receive_damage: ({hp, damage}: {hp: number, damage: number}) => {
                creature.style.setProperty("--creature__lifebar_current-hp", `${hp}`)

                const fading_number = document.createElement("div")
                fading_number.classList.add("fading-number")
                fading_number.textContent = `${damage}`
                creature.appendChild(fading_number)

                setTimeout(() => fading_number.remove(), FADING_TEXT_ANIMATION_DURATION)
            },
            display_miss: () => {
                const fading_miss = document.createElement("div")
                fading_miss.classList.add("fading-miss")
                fading_miss.textContent = `miss`
                creature.appendChild(fading_miss)

                setTimeout(() => fading_miss.remove(), FADING_TEXT_ANIMATION_DURATION)
            }
        }
    }
}

const FADING_TEXT_ANIMATION_DURATION = 1500