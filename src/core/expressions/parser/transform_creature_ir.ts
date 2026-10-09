import {to_ast} from "core/expressions/parser/to_ast";
import type {CreatureRule} from "core/battlegrid/creatures/creature_rule";
import type {Modifier} from "core/battlegrid/creatures/Modifier";
import type {IRCreatureRule, IRModifier} from "core/types";

export const transform_creature_rule = (rule: IRCreatureRule): CreatureRule => {
    if (rule.type === "restrict_targeting") {
        return {
            type: "restrict_targeting",
            targetable_when: to_ast(rule.targetable_when),
        }
    }
    return rule
}

export const transform_modifier = (modifier: IRModifier): Modifier => ({
    name: modifier.name,
    type: modifier.type,
    value: to_ast(modifier.value),
})
