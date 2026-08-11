import type {Position} from "core/battlegrid/Position";
import type {Power} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {AttributeCode} from "core/character_sheet/attributes";
import type {Size} from "core/battlegrid/creatures/SIZES";

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
    powers: Array<Power>
}
