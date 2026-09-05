import {create_event_manager} from "stdlib/event_manager";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {Expr, ExprNumberResolved} from "core/virtual_machine/expressions/types";
import type {InstructionFrame} from "core/virtual_machine/VMState";
import type {Interaction} from "core/instruction_loop";
import type {Position} from "core/battlegrid/Position";
import type {HitStatus} from "core/virtual_machine/expressions/constants/HitStatus";
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

export type CreatureAttackedEvent = {
    creature: Creature
    attack: ExprNumberResolved
    hit_status: HitStatus
    defender: Creature
    defense: ExprNumberResolved
    instruction: InstructionAttackDiceRoll
    power_name: string
}

export type InitiativeEntryAddedEvent = {
    creature: Creature
    initiative: ExprNumberResolved
    index: number
}

//TODO a null event feels wrong
export type AvailableActionsChangedEvent = (Interaction & { creature: Creature }) | null

export type InstructionFrameAddedEvent = {
    frame: InstructionFrame
    variables: Map<string, Expr>
}

export const create_game_events = () => ({
    on_available_interactions_changed: create_event_manager<AvailableActionsChangedEvent>(),
    on_creature_added_to_game: create_event_manager<Creature>(),

    on_creature_moved: create_event_manager<CreatureMovedEvent>(),
    on_creature_received_damage: create_event_manager<CreatureReceivedDamageEvent>(),
    on_creature_missed: create_event_manager<Creature>(),
    on_creature_attacked: create_event_manager<CreatureAttackedEvent>(),
    on_creature_available_actions_changed: create_event_manager<Creature>(),

    on_initiative_entry_added: create_event_manager<InitiativeEntryAddedEvent>(),
    on_initiative_current_creature_changed: create_event_manager<Creature>(),

    // VM State Events
    on_vm_state_cleared: create_event_manager(),
    on_instruction_frame_added: create_event_manager<InstructionFrameAddedEvent>(),
    on_instruction_pointer_changed: create_event_manager<InstructionFrame>(),
    on_instruction_frame_popped: create_event_manager(),
    on_vm_variable_set: create_event_manager<[string, Expr]>()
})

export type GameEvents = ReturnType<typeof create_game_events>
