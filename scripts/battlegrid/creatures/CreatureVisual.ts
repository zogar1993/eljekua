import {Position} from "battlegrid/Position";

export type CreatureVisual = {
    place_at: (position: Position) => void
    receive_damage: (value: number) => void
}

export class VisualCreatureCreator {
    create({image, position, hp}: {
        image: string,
        position: Position,
        hp: { current: number, max: number }
    }): CreatureVisual {
        const html_creature = document.createElement("div")
        html_creature.classList.add("creature")
        html_creature.style.setProperty("--creature__image_color", image)

        html_creature.style.setProperty("--creature_position-x", `${position.x}`)
        html_creature.style.setProperty("--creature_position-y", `${position.y}`)

        html_creature.style.setProperty("--creature__lifebar_max-hp", `${hp.max}`)
        html_creature.style.setProperty("--creature__lifebar_current-hp", `${hp.current}`)

        const html_sprite = document.createElement("div")
        html_sprite.classList.add("creature__image")
        html_creature.appendChild(html_sprite)

        const html_lifebar = document.createElement("div")
        html_lifebar.classList.add("creature__lifebar")
        html_creature.appendChild(html_lifebar)

        const html_creatures = document.getElementById("creatures")!
        html_creatures.appendChild(html_creature)

        return {
            place_at: (position: Position) => {
                html_creature.style.setProperty("--creature_position-x", `${position.x}`)
                html_creature.style.setProperty("--creature_position-y", `${position.y}`)
            },
            receive_damage: (value: number) => {
                html_creature.style.setProperty("--creature__lifebar_current-hp", `${value}`)
            }
        }
    }
}
