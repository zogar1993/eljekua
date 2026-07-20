import {Position} from "scripts/battlegrid/Position";
import {CreatureData} from "scripts/battlegrid/creatures/CreatureData";
import {SIZE} from "scripts/creatures/SIZES";
import {create_html_element} from "web_components/utils/create_html_element";

export type CreatureVisual = {
    place_at: (position: Position) => void
    move_one_square: (position: Position) => number
    push_to: (position: Position) => number
    receive_damage: ({hp, damage}: { hp: number, damage: number }) => number
    display_miss: () => number
    display_hit_chance: ({attack, defense, chance}: {
        attack: number,
        defense: number,
        chance: number
    }) => void
    remove_hit_chance: () => void
}

export const create_visual_creature = (data: CreatureData): CreatureVisual => {
    const html_creature = create_html_element("div", "creature")

    html_creature.setAttribute("id", data.name.toLowerCase())
    html_creature.style.setProperty("--creature__image", data.image)

    html_creature.style.setProperty("--creature_size", `${SIZE[data.size]}`)

    html_creature.style.setProperty("--creature_position-x", `${data.position.x}`)
    html_creature.style.setProperty("--creature_position-y", `${data.position.y}`)

    html_creature.style.setProperty("--creature__lifebar_max-hp", `${data.hp_max}`)
    html_creature.style.setProperty("--creature__lifebar_current-hp", `${data.hp_current}`)

    html_creature.style.setProperty("--fading-text_animation-duration", `${FADING_TEXT_ANIMATION_DURATION}ms`)

    const html_sprite = create_html_element("div", "creature__image")
    html_creature.appendChild(html_sprite)

    const html_lifebar = create_html_element("div", "creature__lifebar")
    html_creature.appendChild(html_lifebar)

    const html_creatures = document.getElementById("creatures")!
    html_creatures.appendChild(html_creature)

    const set_position_at = ({x, y}: Position) => {
        html_creature.style.setProperty("--creature_position-x", `${x}`)
        html_creature.style.setProperty("--creature_position-y", `${y}`)
        html_creature.setAttribute("x", `${x}`)
        html_creature.setAttribute("y", `${y}`)
    }

    return {
        place_at: (position: Position) => {
            set_position_at(position)
        },
        move_one_square: (position: Position) => {
            html_creature.style.setProperty("--creature__position-animation-duration", `${MOVEMENT_ANIMATION_DURATION}ms`)
            set_position_at(position)
            return MOVEMENT_ANIMATION_DURATION
        },
        push_to: (position: Position) => {
            html_creature.style.setProperty("--creature__position-animation-duration", `${PUSH_ANIMATION_DURATION}ms`)
            set_position_at(position)
            return PUSH_ANIMATION_DURATION
        },
        receive_damage: ({hp, damage}: { hp: number, damage: number }) => {
            html_creature.style.setProperty("--creature__lifebar_current-hp", `${hp}`)

            const fading_number = create_html_element("div", "fading-number")
            fading_number.textContent = `${damage}`
            html_creature.appendChild(fading_number)

            setTimeout(() => fading_number.remove(), FADING_TEXT_ANIMATION_DURATION)
            return FADING_TEXT_ANIMATION_DURATION / 2
        },
        display_miss: () => {
            const fading_miss = create_html_element("div", "fading-miss")
            fading_miss.textContent = `miss`
            html_creature.appendChild(fading_miss)

            setTimeout(() => fading_miss.remove(), FADING_TEXT_ANIMATION_DURATION)
            return FADING_TEXT_ANIMATION_DURATION / 2
        },
        display_hit_chance: ({attack, defense, chance}: {
            attack: number,
            defense: number,
            chance: number
        }) => {
            const hit_chance = create_html_element("div", "hit-chance")
            hit_chance.textContent = `${attack} vs ${defense}: ${chance}%`
            html_creature.appendChild(hit_chance)
        },
        remove_hit_chance: () => {
            const hit_chance = html_creature.querySelector(".hit-chance")
            hit_chance?.remove()
        },
    }
}

const FADING_TEXT_ANIMATION_DURATION = 1500
const MOVEMENT_ANIMATION_DURATION = 500
const PUSH_ANIMATION_DURATION = 500
