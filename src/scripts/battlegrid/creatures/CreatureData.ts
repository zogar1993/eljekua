import type {Position} from "scripts/battlegrid/Position";
import type {PowerVM} from "scripts/expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {AttributeCode} from "scripts/character_sheet/attributes";
import type {Size} from "scripts/creatures/SIZES";

export type CreatureData = {
    name: string
    level: number
    size: Size
    attributes: Record<AttributeCode, number>
    position: Position
    image: string
    movement: number
    hp_current: number
    hp_max: number
    team: number | null
    powers: Array<PowerVM>
}
