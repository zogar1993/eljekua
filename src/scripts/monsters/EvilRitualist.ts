const evil_ritualist = {
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
    hp: 1, //TODO a missed attack never damages a minion.
    defenses: {
        ac: 15,
        fortitude: 13,
        reflex: 14,
        will: 13
    },
    speed: 6,
    powers: [
        {
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
                        type: "apply_damage",
                        value: "4",
                        target: "primary_target"
                    }
                ]
            },
        }
    ],
    attributes: {
        str: 10,
        con: 10,
        dex: 16,
        int: 10,
        wis: 10,
        cha: 10
    },
    triggers: [
        {
            name: "Unholy Vigor",
            type: "immediate_reaction",
            intercepts: "critical_hit",
            conditions: [
                `$lower_or_equal($distance($triggerer(),owner),5)`,
                `$or($is_ally($triggerer()),$is_monster_template(owner.template))`,
            ]
            //TODO melee basic attack against an adyacent enemy
        }
    ]
}
