import {Position} from "battlegrid/Position";
import {PowerVM} from "tokenizer/transform_power_ir_into_vm_representation";
import {AttributeCode} from "character_sheet/attributes";

export type CreatureData = {
    name: string
    level: number
    attributes: Record<AttributeCode, number>
    position: Position
    image: string
    movement: number
    hp_current: number
    hp_max: number
    powers: Array<PowerVM>
}
