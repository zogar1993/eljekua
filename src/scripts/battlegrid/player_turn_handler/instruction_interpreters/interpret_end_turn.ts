import {
    InterpretInstructionProps
} from "scripts/battlegrid/player_turn_handler/instruction_interpreters/InterpretInstructionProps";
import {InstructionEndTurn} from "scripts/expressions/parser/instructions";
import {Creature} from "scripts/battlegrid/creatures/Creature";
import {ACTION_TYPE} from "scripts/battlegrid/creatures/ActionType";
import {BattleGrid} from "scripts/battlegrid/BattleGrid";

export const interpret_end_turn = ({
                                       battle_grid,
                                       initiative_order,
                                   }: InterpretInstructionProps<InstructionEndTurn>) => {
    run_end_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})

    initiative_order.next_turn()

    run_start_of_turn_hooks({current_turn_creature: initiative_order.get_current_creature(), battle_grid})
}

const run_end_of_turn_hooks = ({current_turn_creature, battle_grid}: {
    current_turn_creature: Creature,
    battle_grid: BattleGrid
}) => {
    for (const creature of battle_grid.creatures) {
        creature.remove_statuses({type: "turn_end", creature: current_turn_creature})
    }
}

export const run_start_of_turn_hooks = ({current_turn_creature, battle_grid}: {
    current_turn_creature: Creature,
    battle_grid: BattleGrid
}) => {
    for (const creature of battle_grid.creatures) {
        if (creature === current_turn_creature)
            creature.set_available_actions([ACTION_TYPE.STANDARD, ACTION_TYPE.MOVEMENT, ACTION_TYPE.MINOR])
        else
            creature.set_available_actions([ACTION_TYPE.OPPORTUNITY])

        creature.remove_statuses({type: "turn_start", creature: current_turn_creature})

        for (const status of creature.statuses)
            for (const duration of status.durations)
                if (duration.until === "next_turn_end" && creature === duration.creature)
                    duration.until = "turn_end"
    }
}
