import {create_event_manager} from "stdlib/event_manager";
import type {AvailableInteractions} from "scripts/battlegrid/player_turn_handler/PlayerTurnHandler";
import type {Creature} from "scripts/battlegrid/creatures/Creature";
import type {Instruction} from "scripts/expressions/parser/instructions";
import type {Expr} from "scripts/expressions/evaluator/types";
import type {InstructionFrame} from "scripts/battlegrid/player_turn_handler/TurnState";

export const create_game_events = () => ({
    on_available_interactions_changed: create_event_manager<AvailableInteractions>(),
    on_creature_added_to_game: create_event_manager<Creature>(),
    on_acting_creature_changed: create_event_manager<Creature | null>(),

    //Turn State Events
    on_turn_state_cleared: create_event_manager(),
    on_instruction_frame_added: create_event_manager<InstructionFrame>(),
    on_instructions_prepended: create_event_manager<Array<Instruction>>(),
    on_instruction_consumed: create_event_manager<Instruction>(),
    on_instruction_frame_popped: create_event_manager(),
    on_turn_state_variable_set: create_event_manager<[string, Expr]>()
})

export type GameEvents = ReturnType<typeof create_game_events>