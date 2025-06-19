import {Position} from "battlegrid/Position";

export type CreatureData = {
    name: string
    level: number
    attributes: Record<"str" | "con" | "dex" | "int" | "wis" | "cha", number>
    position: Position
    image: string
    movement: number
    hp_current: number
    hp_max: number
}
