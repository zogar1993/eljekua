import type {GameQueries} from "core/game_state/GameQueries";
import type {GameState} from "core/game_state/GameState";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";

export const is_creature_targetable = ({creature, attacker, game_queries, game_state}: {
    creature: Creature
    attacker: Creature
    game_queries: GameQueries
    game_state: GameState
}): boolean => {
    for (const rule of creature.constant_rules) {
        if (rule.type !== "restrict_targeting")
            continue
        if (are_creatures_allied(attacker, creature))
            continue

        const {vm_state} = game_state
        const targets = game_state.creatures.get_all()
            .filter(target => !are_creatures_allied(attacker, target))

        vm_state.set_variable(SYSTEM_KEYWORD.TRIGGER_ACTIVATOR, {type: "creatures", value: [attacker]})
        vm_state.set_variable(SYSTEM_KEYWORD.TRIGGER_OWNER, {type: "creatures", value: [creature]})
        vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: targets})

        const targetable = EXPR.as_boolean(game_queries.evaluate(rule.targetable_when))

        if (!targetable)
            return false
    }

    return true
}
