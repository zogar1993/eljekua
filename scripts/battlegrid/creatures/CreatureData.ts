import type {Position} from "battlegrid/Position";
import type {PowerVM} from "expressions/tokenizer/transform_power_ir_into_vm_representation";
import type {AttributeCode} from "character_sheet/attributes";
import type {Size} from "creatures/SIZES";

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
