import {tokenize} from "tokenizer/tokenize";
import {IRConsequence, is_explicit_targeting, Power} from "types";
import {Token} from "tokenizer/tokens/AnyToken";
import {ATTRIBUTE_CODES} from "character_sheet/attributes";

const PRIMARY_TARGET_LABEL = "primary_target"

export const transform_power_ir_into_vm_representation = (power: Power): PowerVM => {
    const consequences: Array<Consequence> = [
        transform_primary_targeting(power.targeting),
        ...(power.roll ? [transform_primary_roll(power.roll)] : []),
        ...(power.effect ? power.effect.map(transform_generic_consequence) : [])
    ]
    return {
        name: power.name,
        description: power.description,
        type: power.type,
        consequences: consequences
    }

}

export type PowerVM = {
    name: string
    description?: string
    type: {
        action: "standard" | "movement" | "minor" | "free"
        cooldown: "at-will" | "encounter" | "daily"
        attack: boolean
    }
    consequences: Array<Consequence>
}

export type ConsequenceSelectTarget =
    ConsequenceSelectTargetExplicitDistance |
    ConsequenceSelectTargetImplicitDistance

export type ConsequenceSelectTargetExplicitDistance = {
    type: "select_target"
    targeting_type: "movement" | "ranged"
    target_type: "enemy" | "terrain" | "creature" | "path"
    amount: 1,
    exclude: Array<string>
    label: string
    distance: Token
}

export type ConsequenceSelectTargetImplicitDistance = {
    type: "select_target"
    targeting_type: "adjacent" | "melee_weapon"
    target_type: "enemy" | "terrain" | "creature" | "path"
    amount: 1,
    exclude: Array<string>
    label: string
}

export type ConsequenceAttackRoll = {
    type: "attack_roll"
    attack: Token
    defense: string
    defender: string
    hit: Array<Consequence>
    miss: Array<Consequence>
}

export type ConsequenceCondition = {
    type: "condition",
    condition: Token,
    consequences_true: Array<Consequence>
    consequences_false: Array<Consequence>
}

export type ConsequenceApplyDamage = {
    type: "apply_damage"
    value: Token
    target: string
    half_damage: boolean
    damage_types: Array<string>
}

export type ConsequenceMovement = {
    type: "move" | "shift"
    target: string
    destination: string
}

export type ConsequenceOptions = {
    type: "options",
    options: Array<{ text: string, consequences: Array<Consequence> }>,
}

export type ConsequenceSavePosition = {
    type: "save_position",
    target: string,
    label: string
}

export type ConsequencePush = {
    type: "push",
    amount: Token,
    target: string
}

export type Consequence =
    ConsequenceApplyDamage |
    ConsequenceSelectTarget |
    ConsequenceAttackRoll |
    ConsequenceCondition |
    ConsequenceMovement |
    ConsequenceOptions |
    ConsequenceSavePosition |
    ConsequencePush

const transform_primary_targeting = (targeting: Power["targeting"]): ConsequenceSelectTarget => {
    if (is_explicit_targeting(targeting)) {
        return {
            type: "select_target",
            targeting_type: targeting.type,
            target_type: targeting.target_type,
            amount: targeting.amount,
            label: PRIMARY_TARGET_LABEL,
            exclude: [],
            distance: tokenize(targeting.distance)
        }
    } else {
        return {
            type: "select_target",
            targeting_type: targeting.type,
            target_type: targeting.target_type,
            amount: targeting.amount,
            label: PRIMARY_TARGET_LABEL,
            exclude: []
        }
    }
}

const transform_primary_roll = (roll: Required<Power>["roll"]): ConsequenceAttackRoll => {
    return {
        type: "attack_roll",
        attack: tokenize(standardize_attack(roll.attack)),
        defense: roll.defense,
        defender: PRIMARY_TARGET_LABEL,
        hit: roll.hit.map(transform_generic_consequence),
        miss: roll.miss ? roll.miss.map(transform_generic_consequence) : []
    }
}

const standardize_attack = (text: string) =>
    ATTRIBUTE_CODES.reduce((text, attribute) => text.replaceAll(attribute, `owner.${attribute}_mod_lvl`), text)

const transform_generic_consequence = (consequence: IRConsequence): Consequence => {
    switch (consequence.type) {
        case "apply_damage":
            return {
                type: "apply_damage",
                value: tokenize(consequence.value),
                target: consequence.target,
                damage_types: consequence.damage_types ?? [],
                half_damage: consequence.half_damage ?? false
            }
        case "select_target":
            return {
                type: "select_target",
                targeting_type: consequence.targeting.type,
                target_type: consequence.targeting.target_type,
                amount: consequence.targeting.amount,
                label: consequence.target_label,
                exclude: consequence.targeting.exclude ?? [],
            }
        case "move":
            return {
                type: "move",
                target: consequence.target,
                destination: consequence.destination
            }
        case "shift":
            return {
                type: "shift",
                target: consequence.target,
                destination: consequence.destination
            }
        case "condition":
            return {
                type: "condition",
                condition: tokenize(consequence.condition),
                consequences_true: consequence.consequences_true.map(transform_generic_consequence),
                consequences_false: consequence.consequences_false ? consequence.consequences_false.map(transform_generic_consequence) : []
            }
        case "options":
            return {
                type: "options",
                options: consequence.options.map(option => ({
                    text: option.text,
                    consequences: option.consequences.map(transform_generic_consequence)
                }))
            }
        case "save_position":
            return {
                type: "save_position",
                label: consequence.label,
                target: consequence.target
            }
        case "push":
            return {
                type: "push",
                amount: tokenize(consequence.amount),
                target: consequence.target
            }
        default:
            throw Error(`consequence invalid ${JSON.stringify(consequence)}`)
    }
}
