import type {Position} from "core/battlegrid/Position";
import type {Power} from "core/expressions/parser/transform_power_ir_into_vm_representation";
import type {AttributeCode} from "core/character_sheet/attributes";
import type {Size} from "core/battlegrid/creatures/SIZES";
import type {ConstantEffect} from "core/battlegrid/creatures/Creature";

export type CreatureData = {
    name: string
    template: string | null
    level: number
    size: Size
    attributes: Record<AttributeCode, number>
    position: Position
    image: string
    movement: number
    hp_current: number
    hp_max: number
    team: number | null
    archetypes: Array<string>
    constant_effects: Array<ConstantEffect>
    powers: Array<Power>
}
