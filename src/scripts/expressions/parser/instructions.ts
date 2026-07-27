import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {DefenseCode} from "scripts/character_sheet/get_creature_defense";
import {StatusDurationValue} from "scripts/types";
import {ActionType} from "scripts/battlegrid/creatures/ActionType";

export const INSTRUCTION_TYPE = {
    ATTACK_DICE_ROLL: "attack_dice_roll",
    ATTACK_ROLL_CONSEQUENCE: "attack_roll_consequence",
    CONDITION: "condition",
    APPLY_DAMAGE: "apply_damage",
    MOVE: "move",
    SHIFT: "shift",
    OPTIONS: "options",
    SAVE_VARIABLE: "save_variable",
    SAVE_NUMBER_AS_RESOLVED: "save_number_as_resolved",
    ADD_POWERS_AS_OPTIONS: "add_powers_as_options",
    EXECUTE_POWER: "execute_power",
    FORCE_MOVEMENT: "force_movement",
    APPLY_STATUS: "apply_status",
    SELECT_TARGET: "select_target",
    EXPEND_ACTION: "expend_action",
    END_TURN: "end_turn",
} as const

export type InstructionAttackDiceRoll = {
    type: typeof INSTRUCTION_TYPE.ATTACK_DICE_ROLL
    attack: AstNode
    defense: DefenseCode
    defender: string
}

export type InstructionAttackRollConsequence = {
//TODO this duplication of defender should be not needed
    defender: string
    type: typeof INSTRUCTION_TYPE.ATTACK_ROLL_CONSEQUENCE
    hit: Array<Instruction>
    miss: Array<Instruction>
}

export type InstructionCondition = {
    type: typeof INSTRUCTION_TYPE.CONDITION,
    condition: AstNode,
    instructions_true: Array<Instruction>
    instructions_false: Array<Instruction>
}

export type InstructionApplyDamage = {
    type: typeof INSTRUCTION_TYPE.APPLY_DAMAGE
    value: AstNode
    target: string
    half_damage: boolean
    damage_types: Array<string>
}

export type InstructionMovement = {
    type: typeof INSTRUCTION_TYPE.MOVE | typeof INSTRUCTION_TYPE.SHIFT
    target: string
    destination: string
}

export type InstructionOptions = {
    type: typeof INSTRUCTION_TYPE.OPTIONS,
    options: Array<InstructionOptionsItem>,
}

export type InstructionOptionsItem = { text: string, instructions: Array<Instruction>, condition?: AstNode }

export type InstructionSaveVariable = {
    type: typeof INSTRUCTION_TYPE.SAVE_VARIABLE,
    value: AstNode,
    label: string
}

export type InstructionSaveResolvedNumber = {
    type: typeof INSTRUCTION_TYPE.SAVE_NUMBER_AS_RESOLVED,
    value: AstNode,
    label: string
}

export type InstructionAddPowers = {
    type: typeof INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
    creature: AstNode,
    cost: "normal" | "opportunity" | "free_attack",
    filter: "turn" | "melee_basic_attack"
}

export type InstructionExecutePower = {
    type: typeof INSTRUCTION_TYPE.EXECUTE_POWER,
    power: string,
    initialization?: Array<{from: string, to: string}>,
}

export type InstructionForceMovement = {
    type: typeof INSTRUCTION_TYPE.FORCE_MOVEMENT,
    movement_type: "push" | "pull" | "slide",
    target: AstNode,
    destination: AstNode
}

export type InstructionApplyStatus = {
    type: typeof INSTRUCTION_TYPE.APPLY_STATUS,
    target: AstNode,
    duration: Array<StatusDurationValue>
    status: {
        type: "grant_combat_advantage",
        against: AstNode,
    } | {
        type: "gain_resistance"
        value: AstNode
        against: AstNode,
    } | {
        type: "gain_attack_bonus"
        value: AstNode
        against: AstNode,
    }
}

export type Instruction =
    InstructionApplyDamage |
    InstructionSelectTarget |
    InstructionCondition |
    InstructionMovement |
    InstructionOptions |
    InstructionSaveVariable |
    InstructionSaveResolvedNumber |
    InstructionAddPowers |
    InstructionExecutePower |
    InstructionApplyStatus |
    InstructionForceMovement |
    InstructionExpendAction |
    InstructionEndTurn |
    InstructionAttackDiceRoll |
    InstructionAttackRollConsequence

export type InstructionSelectTarget =
    InstructionSelectTargetRanged |
    InstructionSelectTargetMelee |
    InstructionSelectTargetAreaBurst |
    InstructionSelectTargetMovement |
    InstructionSelectTargetPush

export type InstructionSelectTargetRanged = {
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET,
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: AstNode
    target_label: string
    exclude: Array<AstNode>
}

export type InstructionSelectTargetMelee = {
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "creature"
    amount: 1,
    exclude: Array<AstNode>
    target_label: string
}

export type InstructionSelectTargetAreaBurst = {
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET,
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: AstNode
    radius: number
    target_label: string
}

export type InstructionSelectTargetMovement = {
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET
    targeting_type: "movement"
    distance: AstNode
    target_label: string
    destination_requirement: AstNode | null
}

export type InstructionSelectTargetPush = {
    type: typeof INSTRUCTION_TYPE.SELECT_TARGET
    targeting_type: "push"
    distance: AstNode
    anchor: AstNode
    defender: AstNode
    target_label: string
}

export type InstructionExpendAction = {
    type: typeof INSTRUCTION_TYPE.EXPEND_ACTION
    action_type: ActionType
}

export type InstructionEndTurn = {
    type: typeof INSTRUCTION_TYPE.END_TURN
}