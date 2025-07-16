import {OnPositionEvent, Position} from "battlegrid/Position";
import {CreatureData} from "battlegrid/creatures/CreatureData";

export type CreatureVisual = {
    place_at: (position: Position) => void
    move_one_square: (position: Position) => number
    receive_damage: ({hp, damage}: {hp: number, damage: number}) => number
    display_miss: () => number
    display_hit_chance_on_hover: ({attack, defense, chance}: {attack: number, defense: number, chance: number}) => void
    remove_hit_chance_on_hover: () => void
}

export class VisualCreatureCreator {
    onClickHandlers: Array<OnPositionEvent> = []
    onHoverHandlers: Array<OnPositionEvent> = []

    create(data: CreatureData): CreatureVisual {
        const html_creature = document.createElement("div")

        html_creature.setAttribute("id", data.name.toLowerCase())
        html_creature.classList.add("creature")
        html_creature.style.setProperty("--creature__image", data.image)

        html_creature.style.setProperty("--creature_position-x", `${data.position.x}`)
        html_creature.style.setProperty("--creature_position-y", `${data.position.y}`)

        html_creature.style.setProperty("--creature__lifebar_max-hp", `${data.hp_max}`)
        html_creature.style.setProperty("--creature__lifebar_current-hp", `${data.hp_current}`)

        html_creature.style.setProperty("--fading-text_animation-duration", `${FADING_TEXT_ANIMATION_DURATION}ms`)

        const html_sprite = document.createElement("div")
        html_sprite.classList.add("creature__image")
        html_creature.appendChild(html_sprite)

        const html_lifebar = document.createElement("div")
        html_lifebar.classList.add("creature__lifebar")
        html_creature.appendChild(html_lifebar)

        const html_creatures = document.getElementById("creatures")!
        html_creatures.appendChild(html_creature)

        html_creature.addEventListener("click", () => this.onClickHandlers.forEach(
            handler => handler({position: data.position})
        ))

        html_creature.addEventListener("mouseenter", () => this.onHoverHandlers.forEach(
            handler => handler({position: data.position})
        ))

        return {
            place_at: (position: Position) => {
                html_creature.style.setProperty("--creature_position-x", `${position.x}`)
                html_creature.style.setProperty("--creature_position-y", `${position.y}`)
            },
            move_one_square: (position: Position) => {
                html_creature.style.setProperty("--creature_position-x", `${position.x}`)
                html_creature.style.setProperty("--creature_position-y", `${position.y}`)
                html_creature.style.setProperty("--creature__position-animation-duration", `${MOVEMENT_ANIMATION_DURATION}ms`)
                return MOVEMENT_ANIMATION_DURATION
            },
            receive_damage: ({hp, damage}: {hp: number, damage: number}) => {
                html_creature.style.setProperty("--creature__lifebar_current-hp", `${hp}`)

                const fading_number = document.createElement("div")
                fading_number.classList.add("fading-number")
                fading_number.textContent = `${damage}`
                html_creature.appendChild(fading_number)

                setTimeout(() => fading_number.remove(), FADING_TEXT_ANIMATION_DURATION)
                return FADING_TEXT_ANIMATION_DURATION / 2
            },
            display_miss: () => {
                const fading_miss = document.createElement("div")
                fading_miss.classList.add("fading-miss")
                fading_miss.textContent = `miss`
                html_creature.appendChild(fading_miss)

                setTimeout(() => fading_miss.remove(), FADING_TEXT_ANIMATION_DURATION)
                return FADING_TEXT_ANIMATION_DURATION / 2
            },
            display_hit_chance_on_hover: ({attack, defense, chance}: {attack: number, defense: number, chance: number}) => {
                const hit_chance = document.createElement("div")
                hit_chance.classList.add("hit-chance")
                hit_chance.textContent = `${attack} vs ${defense}: ${chance}%`
                html_creature.appendChild(hit_chance)
            },
            remove_hit_chance_on_hover: () => {
                const hit_chance = html_creature.querySelector(".hit-chance")
                hit_chance?.remove()
            }
        }
    }

    addOnCreatureClickEvent = (onClick: OnPositionEvent) => {
        this.onClickHandlers.push(onClick)
    }

    addOnCreatureHoverEvent = (onHover: OnPositionEvent) => {
        this.onHoverHandlers.push(onHover)
    }
}

const FADING_TEXT_ANIMATION_DURATION = 1500
const MOVEMENT_ANIMATION_DURATION = 500