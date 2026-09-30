import type {AstNode} from "core/expressions/parser/nodes/AstNode";
import type {Creature} from "core/battlegrid/creatures/Creature";
import type {ExprNumberResolved} from "core/virtual_machine/expressions/types";

export type CreatureRule =
    CreatureRuleGrantCombatAdvantage |
    CreatureRuleGainResistance |
    CreatureRuleGainVulnerability |
    CreatureRuleGainAttackBonus |
    CreatureRuleRestrictTargeting

export type CreatureRuleGrantCombatAdvantage = {
    type: "grant_combat_advantage"
    against_creatures: Array<Creature> | null
}

export type CreatureRuleGainResistance = {
    type: "gain_resistance"
    value: ExprNumberResolved
    against_creatures: Array<Creature> | null
    against_damage_types: Array<string> | null
}

export type CreatureRuleGainVulnerability = {
    type: "gain_vulnerability"
    value: ExprNumberResolved
    against_creatures: Array<Creature> | null
    against_damage_types: Array<string> | null
}

export type CreatureRuleGainAttackBonus = {
    type: "gain_attack_bonus"
    value: ExprNumberResolved
    against_creatures: Array<Creature> | null
}

export type CreatureRuleRestrictTargeting = {
    type: "restrict_targeting"
    targetable_when: AstNode
}

export type CreatureRuleDamageModifier = CreatureRuleGainResistance | CreatureRuleGainVulnerability

export const create_gain_resistance_rule = (value: number, ...against_damage_types: Array<string>): CreatureRuleGainResistance => ({
    type: "gain_resistance",
    value: {type: "number_resolved", value, description: "gain resistance"},
    against_creatures: null,
    against_damage_types: against_damage_types.length > 0 ? against_damage_types : null,
})

export const create_gain_vulnerability_rule = (value: number, ...against_damage_types: Array<string>): CreatureRuleGainVulnerability => ({
    type: "gain_vulnerability",
    value: {type: "number_resolved", value, description: "gain vulnerability"},
    against_creatures: null,
    against_damage_types: against_damage_types.length > 0 ? against_damage_types : null,
})

export const creature_rule_applies_to_damage_type = (
    rule: CreatureRuleDamageModifier,
    damage_type: string | null,
): boolean => {
    if (damage_type === null)
        return rule.against_damage_types === null
    return rule.against_damage_types === null || rule.against_damage_types.includes(damage_type)
}

export const creature_rule_applies_to_attacker = ({rule, attacker}: {
    rule: CreatureRuleGrantCombatAdvantage | CreatureRuleGainResistance | CreatureRuleGainVulnerability | CreatureRuleGainAttackBonus
    attacker: Creature
}): boolean =>
    rule.against_creatures === null || rule.against_creatures.includes(attacker)
