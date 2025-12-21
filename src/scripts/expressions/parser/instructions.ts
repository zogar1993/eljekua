import {AstNode} from "scripts/expressions/parser/nodes/AstNode";
import {DefenseCode} from "scripts/character_sheet/get_creature_defense";
import {StatusDurationValue} from "scripts/types";
import {HitStatus} from "scripts/battlegrid/player_turn_handler/HitStatus";
import {ActionType} from "scripts/battlegrid/creatures/ActionType";

export type InstructionAttackRoll = {
    type: "attack_roll"
    attack: AstNode
    defense: DefenseCode
    defender: string
    before_instructions: Array<Instruction>
    hit: Array<Instruction>
    miss: Array<Instruction>
}

export type InstructionCondition = {
    type: "condition",
    condition: AstNode,
    instructions_true: Array<Instruction>
    instructions_false: Array<Instruction>
}

export type InstructionApplyDamage = {
    type: "apply_damage"
    value: AstNode
    target: string
    half_damage: boolean
    damage_types: Array<string>
}

export type InstructionMovement = {
    type: "move" | "shift"
    target: string
    destination: string
}

export type InstructionOptions = {
    type: "options",
    options: Array<InstructionOptionsItem>,
}

export type InstructionOptionsItem = { text: string, instructions: Array<Instruction>, condition?: AstNode }

export type InstructionSaveVariable = {
    type: "save_variable",
    value: AstNode,
    label: string
}

export type InstructionSaveResolvedNumber = {
    type: "save_number_as_resolved",
    value: AstNode,
    label: string
}

export type InstructionAddPowers = {
    type: "add_powers",
    creature: string
}

export type InstructionExecutePower = {
    type: "execute_power",
    power: string
}

export type InstructionForceMovement = {
    type: "force_movement",
    movement_type: "push" | "pull" | "slide",
    target: AstNode,
    destination: AstNode
}

export type InstructionSetPowerFrameHitStatus = {
    type: "set_power_frame_hit_status"
    value: HitStatus
}

export type InstructionApplyStatus = {
    type: "apply_status",
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
    InstructionAttackRoll |
    InstructionCondition |
    InstructionMovement |
    InstructionOptions |
    InstructionSaveVariable |
    InstructionSaveResolvedNumber |
    InstructionAddPowers |
    InstructionExecutePower |
    InstructionSetPowerFrameHitStatus |
    InstructionApplyStatus |
    InstructionForceMovement |
    InstructionExpendAction

export type InstructionSelectTarget =
    InstructionSelectTargetRanged |
    InstructionSelectTargetMelee |
    InstructionSelectTargetAreaBurst |
    InstructionSelectTargetMovement |
    InstructionSelectTargetPush

export type InstructionSelectTargetRanged = {
    type: "select_target",
    targeting_type: "ranged"
    target_type: "terrain" | "enemy" | "creature"
    terrain_prerequisite?: "unoccupied"
    amount: 1
    distance: AstNode
    target_label: string
    exclude: Array<AstNode>
}

export type InstructionSelectTargetMelee = {
    type: "select_target"
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "creature"
    amount: 1,
    exclude: Array<AstNode>
    target_label: string
}

export type InstructionSelectTargetAreaBurst = {
    type: "select_target",
    targeting_type: "area_burst"
    target_type: "creature"
    amount: "all"
    distance: AstNode
    radius: number
    target_label: string
}

export type InstructionSelectTargetMovement = {
    type: "select_target"
    targeting_type: "movement"
    distance: AstNode
    target_label: string
    destination_requirement: AstNode | null
}

export type InstructionSelectTargetPush = {
    type: "select_target"
    targeting_type: "push"
    distance: AstNode
    anchor: AstNode
    origin: AstNode
    target_label: string
}

export type InstructionExpendAction = {
    type: "expend_action"
    action_type: ActionType
}