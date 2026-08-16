import {create_event_manager} from "stdlib/event_manager";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Instruction} from "core/virtual_machine/instructions/instructions";
import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {InstructionFrame} from "core/battlegrid/player_turn_handler/TurnState";
import {Interaction} from "core/instruction_loop";
import type {Position} from "core/battlegrid/Position";
import type {HitStatus} from "core/battlegrid/player_turn_handler/HitStatus";
import type {InstructionAttackDiceRoll} from "core/virtual_machine/instructions/instructions";

export type CreatureMovedEvent = {
    creature: Creature
    position: Position
    movement_type: "move" | "push"
}

export type CreatureReceivedDamageEvent = {
    creature: Creature
    damage: ExprNumberResolved
}

export type CreatureTargetedEvent = {
    creature: Creature
    attack: number
    defense: number
    chance: number
}

export type CreatureAttackedEvent = {
    creature: Creature
    attack: ExprNumberResolved
    hit_status: HitStatus
    defender: Creature
    defense: ExprNumberResolved
    instruction: InstructionAttackDiceRoll
    power_name: string
}

export const create_game_events = () => ({
    on_available_interactions_changed: create_event_manager<Interaction | null>(),
    on_creature_added_to_game: create_event_manager<Creature>(),

    on_creature_moved: create_event_manager<CreatureMovedEvent>(),
    on_creature_received_damage: create_event_manager<CreatureReceivedDamageEvent>(),
    on_creature_targeted: create_event_manager<CreatureTargetedEvent>(),
    on_creature_untargeted: create_event_manager<Creature>(),
    on_creature_missed: create_event_manager<Creature>(),
    on_creature_attacked: create_event_manager<CreatureAttackedEvent>(),

    //Turn State Events
    on_turn_state_cleared: create_event_manager(),
    on_instruction_frame_added: create_event_manager<InstructionFrame>(),
    on_instructions_prepended: create_event_manager<Array<Instruction>>(),
    on_instruction_consumed: create_event_manager<Instruction>(),
    on_instruction_frame_popped: create_event_manager(),
    on_turn_state_variable_set: create_event_manager<[string, Expr]>()
})

export type GameEvents = ReturnType<typeof create_game_events>
