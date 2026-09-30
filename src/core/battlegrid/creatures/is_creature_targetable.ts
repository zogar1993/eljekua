import type {GameQueries} from "core/game_state/GameQueries";
import type {GameState} from "core/game_state/GameState";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";
import {SYSTEM_KEYWORD} from "core/virtual_machine/expressions/AST_NODE";
import {EXPR} from "core/virtual_machine/expressions/EXPR";
import type {Expr} from "core/virtual_machine/expressions/types";

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
        const saved_owner = vm_state.get_variable(SYSTEM_KEYWORD.OWNER)
        const saved_attacker = vm_state.has_variable(SYSTEM_KEYWORD.ATTACKER)
            ? vm_state.get_variable(SYSTEM_KEYWORD.ATTACKER)
            : null
        const saved_targets = vm_state.has_variable(SYSTEM_KEYWORD.TARGETS)
            ? vm_state.get_variable(SYSTEM_KEYWORD.TARGETS)
            : null

        const targets = game_state.creatures.get_all()
            .filter(target => !are_creatures_allied(attacker, target))

        vm_state.set_variable(SYSTEM_KEYWORD.ATTACKER, {type: "creatures", value: [attacker]})
        vm_state.set_variable(SYSTEM_KEYWORD.OWNER, {type: "creatures", value: [creature]})
        vm_state.set_variable(SYSTEM_KEYWORD.TARGETS, {type: "creatures", value: targets})

        const targetable = EXPR.as_boolean(game_queries.evaluate(rule.targetable_when))

        vm_state.set_variable(SYSTEM_KEYWORD.OWNER, saved_owner)
        restore_variable({vm_state, name: SYSTEM_KEYWORD.ATTACKER, value: saved_attacker})
        restore_variable({vm_state, name: SYSTEM_KEYWORD.TARGETS, value: saved_targets})

        if (!targetable)
            return false
    }

    return true
}

//TODO this restore variable hack is not very clean, find another way
const restore_variable = ({vm_state, name, value}: {
    vm_state: GameState["vm_state"]
    name: string
    value: Expr | null
}) => {
    if (value !== null)
        vm_state.set_variable(name, value)
}
