import type {Creature} from "core/battlegrid/creatures/Creature";
import {creature_rule_applies_to_attacker} from "core/battlegrid/creatures/creature_rule";
import type {BattleGrid} from "core/battlegrid/BattleGrid";
import {is_flanking} from "core/battlegrid/queries/is_flanking";

export const has_combat_advantage = ({attacker, defender, battle_grid}: {
    attacker: Creature,
    defender: Creature,
    battle_grid: BattleGrid,
}) =>
    is_flanking({attacker, defender, battle_grid}) ||
    defender.statuses.some(({rule}) =>
        rule.type === "grant_combat_advantage" && creature_rule_applies_to_attacker({rule, attacker}))
