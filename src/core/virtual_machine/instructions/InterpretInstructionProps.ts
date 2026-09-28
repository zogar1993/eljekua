import type {GameQueries} from "core/game_state/GameQueries";
import type {Instruction} from "core/virtual_machine/instructions/instructions";
import type {GameEvents} from "core/events/GameEvents";
import type {GameState} from "core/game_state/GameState";

export type InterpretInstructionProps<T extends Instruction> = {
    instruction: T
    game_state: GameState
    game_queries: GameQueries
    game_events: GameEvents
}