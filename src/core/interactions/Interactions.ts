import type {OptionButton} from "core/battlegrid/creature_option/CreatureOption";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
import type {Position} from "core/battlegrid/Position";
import type {AttackSuccessChance} from "core/virtual_machine/instructions/interpreters/interpret_select_target";
export const INTERACTION_TYPE = {
    HIT_STATUS_SELECT: "select_hit_status",
    D20_ROLL_SELECT: "select_d20_roll",
    SELECT_TERRAIN: "select_terrain",
    SELECT_CREATURE: "select_creature",
    SELECT_AREA: "select_area",
    SELECT_PATH: "select_path",
    OPTION_SELECT: "select_option",
} as const

export type InteractionType = typeof INTERACTION_TYPE[keyof typeof INTERACTION_TYPE]

export type Interaction =
    InteractionsSelectTerrain
    | InteractionsSelectCreature
    | InteractionsSelectOption
    | InteractionsSelectHitStatus
    | InteractionsSelectD20Roll
    | InteractionsSelectPath
    | InteractionsSelectArea

export type InteractionsSelectHitStatus = {
    type: typeof INTERACTION_TYPE.HIT_STATUS_SELECT
    creature_ids: Array<number>
}

export type InteractionsSelectD20Roll = {
    type: typeof INTERACTION_TYPE.D20_ROLL_SELECT
    creature_ids: Array<number>
}

export type InteractionsSelectTerrain = {
    type: typeof INTERACTION_TYPE.SELECT_TERRAIN
    target_label: string
    clickable: Array<Position>
}

export type InteractionsSelectCreature = {
    type: typeof INTERACTION_TYPE.SELECT_CREATURE
    target_label: string
    clickable: Array<Position>
    get_target_for_position: (position: Position) => Creature
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
}

export type InteractionsSelectArea = {
    type: typeof INTERACTION_TYPE.SELECT_AREA
    target_label: string
    clickable: Array<Position>
    get_area_for_position: (position: Position) => Array<Position>
    get_targets_for_position: (position: Position) => Array<Creature>
    get_attack_hit_chance_against: (creature: Creature) => AttackSuccessChance | null
}

export type InteractionsSelectPath = {
    type: typeof INTERACTION_TYPE.SELECT_PATH
    target_label: string
    clickable: Array<Position>
    get_path_to_destination: (position: Position) => Array<Position>
    footprint: number
}

type InteractionsSelectOption = {
    type: typeof INTERACTION_TYPE.OPTION_SELECT
    available_options: Array<OptionButton>
}

export type InteractionSelection =
    InteractionSelectionSelectTerrain
    | InteractionSelectionSelectCreature
    | InteractionSelectionSelectOption
    | InteractionSelectionSelectHitStatus
    | InteractionSelectionSelectD20Roll
    | InteractionSelectionSelectPath
    | InteractionSelectionSelectArea

export type InteractionSelectionSelectHitStatus = {
    type: typeof INTERACTION_TYPE.HIT_STATUS_SELECT
    attack_rolls: Array<{ creature_id: number, hit_status: HitStatus }>
}

export type InteractionSelectionSelectD20Roll = {
    type: typeof INTERACTION_TYPE.D20_ROLL_SELECT
    d20_rolls: Array<{ creature_id: number, value: number }>
}

export type InteractionSelectionSelectTerrain = {
    type: typeof INTERACTION_TYPE.SELECT_TERRAIN
    position: Position
}

export type InteractionSelectionSelectCreature = {
    type: typeof INTERACTION_TYPE.SELECT_CREATURE
    creature_id: number
}

export type InteractionSelectionSelectArea = {
    type: typeof INTERACTION_TYPE.SELECT_AREA
    center: Position
}

export type InteractionSelectionSelectPath = {
    type: typeof INTERACTION_TYPE.SELECT_PATH
    path: Array<Position>
}

export type InteractionSelectionSelectOption = {
    type: typeof INTERACTION_TYPE.OPTION_SELECT
    option: string
}
