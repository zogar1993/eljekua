import {Position} from "battlegrid/Position";
import {PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";

export type CreatureData = {
    name: string
    level: number
    attributes: Record<"str" | "con" | "dex" | "int" | "wis" | "cha", number>
    position: Position
    image: string
    movement: number
    hp_current: number
    hp_max: number
    powers: Array<PowerVM>
}
