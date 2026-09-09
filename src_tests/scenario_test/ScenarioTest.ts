import type {Position} from "core/battlegrid/Position";
import type {AttributeCode} from "core/character_sheet/attributes";
import type {Size} from "core/battlegrid/creatures/SIZES";
import type {PowerSetName} from "scenario_test/resolve_creature_setup";

export const SCENARIO_STEP_TYPE = {
    ADD_CREATURE: "add_creature",
    START_BATTLE: "start_battle",
    SET_TURN: "set_turn",
    INTERACTION: "interaction",
    EXPECT: "expect",
} as const

export type ScenarioStepType = typeof SCENARIO_STEP_TYPE[keyof typeof SCENARIO_STEP_TYPE]

export const EXPECTATION_TYPE = {
    CREATURE_POSITION: "creature_position",
    CREATURE_HP: "creature_hp",
    CURRENT_TURN: "current_turn",
    ATTACK_LOG: "attack_log_entry",
} as const

export type ExpectationType = typeof EXPECTATION_TYPE[keyof typeof EXPECTATION_TYPE]

export const SCENARIO_HIT_STATUS = {
    MISS: "miss",
    HIT: "hit",
    CRIT: "crit",
} as const

export type ScenarioHitStatusName = typeof SCENARIO_HIT_STATUS[keyof typeof SCENARIO_HIT_STATUS]

export type ScenarioCreatureSetup = {
    name: string
    template?: string | null
    position: Position
    size?: Size
    image?: string
    movement?: number
    hp_current?: number
    hp_max?: number
    level?: number
    team?: number | null
    attributes?: Record<AttributeCode, number>
    power_sets?: Array<PowerSetName>
    archetypes?: Array<string>
}

export type ScenarioSerializableInteractionSelection =
    ScenarioInteractionSelectOption
    | ScenarioInteractionSelectPath
    | ScenarioInteractionSelectTerrain
    | ScenarioInteractionSelectCreature
    | ScenarioInteractionSelectArea
    | ScenarioInteractionSelectHitStatus

export type ScenarioInteractionSelectOption = {
    type: "select_option"
    option: string
}

export type ScenarioInteractionSelectPath = {
    type: "select_path"
    path: Array<Position>
}

export type ScenarioInteractionSelectTerrain = {
    type: "select_terrain"
    position: Position
}

export type ScenarioInteractionSelectCreature = {
    type: "select_creature"
    creature_name: string
}

export type ScenarioInteractionSelectArea = {
    type: "select_area"
    center: Position
}

export type ScenarioInteractionSelectHitStatus = {
    type: "select_hit_status"
    attack_rolls: Array<{ creature_name: string, hit_status: ScenarioHitStatusName }>
}

export type ScenarioStepAddCreature = {
    type: typeof SCENARIO_STEP_TYPE.ADD_CREATURE
    creature: ScenarioCreatureSetup
}

export type ScenarioStepStartBattle = {
    type: typeof SCENARIO_STEP_TYPE.START_BATTLE
}

export type ScenarioStepSetTurn = {
    type: typeof SCENARIO_STEP_TYPE.SET_TURN
    creature_name: string
}

export type ScenarioStepInteraction = {
    type: typeof SCENARIO_STEP_TYPE.INTERACTION
    selection: ScenarioSerializableInteractionSelection
}

export type ExpectationCreaturePosition = {
    type: typeof EXPECTATION_TYPE.CREATURE_POSITION
    creature_name: string
    position: Position
}

export type ExpectationCreatureHp = {
    type: typeof EXPECTATION_TYPE.CREATURE_HP
    creature_name: string
    hp_current: number
}

export type ExpectationCurrentTurn = {
    type: typeof EXPECTATION_TYPE.CURRENT_TURN
    creature_name: string
}

export type ExpectationAttackLogEntry = {
    type: typeof EXPECTATION_TYPE.ATTACK_LOG
    attacker: string
    target: string
    power_name: string
}

export type ScenarioExpectation =
    ExpectationCreaturePosition
    | ExpectationCreatureHp
    | ExpectationCurrentTurn
    | ExpectationAttackLogEntry

export type ScenarioStepExpect = {
    type: typeof SCENARIO_STEP_TYPE.EXPECT
    expectation: ScenarioExpectation
}

export type ScenarioStep =
    ScenarioStepAddCreature
    | ScenarioStepStartBattle
    | ScenarioStepSetTurn
    | ScenarioStepInteraction
    | ScenarioStepExpect

export type ScenarioTest = {
    name: string
    battle_grid_size: { x: number, y: number }
    steps: Array<ScenarioStep>
}

export type ScenarioRunFailure = {
    step_index: number
    message: string
}

export type ScenarioRunResult = {
    passed: boolean
    failures: Array<ScenarioRunFailure>
}

export type AttackLogEntry = {
    attacker: string
    target: string
    power_name: string
}

export const create_empty_scenario = ({
                                          name = "untitled_scenario",
                                          battle_grid_size = {x: 10, y: 10},
                                      }: {
    name?: string
    battle_grid_size?: { x: number, y: number }
} = {}): ScenarioTest => ({
    name,
    battle_grid_size,
    steps: [],
})
