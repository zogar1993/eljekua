import {Size} from "core/battlegrid/creatures/SIZES";
import {AttributeCode} from "core/character_sheet/attributes";
import {DefenseCode} from "core/character_sheet/get_creature_defense";
import {IRPower} from "core/types";
import {INSTRUCTION_TYPE} from "core/virtual_machine/instructions/instructions";

export type Monster = {
    template: string
    size: Size
    race: string
    keywords: Array<string>
    level: number
    xp: number
    archetypes: Array<string>
    initiative: number
    senses: Record<string, number>
    alignment: string
    languages: Array<string>
    hp: number
    defenses: Record<DefenseCode, number>
    speed: number
    powers: Array<IRPower>
    attributes: Record<AttributeCode, number>
}

const sacrificial_dagger: IRPower = {
    name: "Sacrificial Dagger",
    type: {
        action: "standard",
        cooldown: "at-will",
        attack: true,
    },
    targeting: {
        targeting_type: "melee_weapon",
        target_type: "enemy",
        amount: 1
    },
    roll: {
        attack: "6",
        defense: "ac",
        hit: [
            {
                type: INSTRUCTION_TYPE.APPLY_DAMAGE,
                value: "4",
                target: "primary_target"
            }
        ]
    },
}

//TODO add free attack expenditure
//TODO add immediate action lifecycle
//TODO add reaction placement in the instruction queue
//TODO ignored dont work properly as the immediate and oportunity defer
const unholy_vigor: IRPower = {
    name: "Unholy Vigor",
    type: {
        action: "free_attack",
        cooldown: "at-will",
        attack: true,
    },
    trigger: {
        type: "reaction",
        intercepts: ["critical_hit"],
        conditions: [
            `$is_lower_or_equal($distance(trigger_activator,trigger_owner),5)`,
            `$or($is_ally(trigger_activator, trigger_owner),$is_monster_template(trigger_owner, "Evil Ritualist"))`,
        ],
    },
    effect: [
        {
            type: INSTRUCTION_TYPE.ADD_POWERS_AS_OPTIONS,
            creature: "owner",
            cost: "free_attack",
            filter: "melee_basic_attack"
        }
    ]
}

const evil_ritualist: Monster = {
    template: "Evil Ritualist",
    size: "medium",
    race: "human",
    keywords: ["natural", "humanoid"],
    level: 1,
    xp: 25,
    archetypes: ["minion", "skirmisher"],
    initiative: 5,
    senses: {
        perception: 0
    },
    alignment: "unaligned",
    languages: [],
    hp: 1, //TODO P1 a missed attack never damages a minion.
    defenses: {
        ac: 15,
        fortitude: 13,
        reflex: 14,
        will: 13
    },
    speed: 6,
    powers: [
        sacrificial_dagger,
        unholy_vigor
    ],
    attributes: {
        str: 10,
        con: 10,
        dex: 16,
        int: 10,
        wis: 10,
        cha: 10
    }
}

export {evil_ritualist}