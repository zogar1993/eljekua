import type {CreatureData} from "core/battlegrid/creatures/CreatureData";
import type {Creature} from "core/battlegrid/creatures/Creature";
import {ATTRIBUTES} from "core/character_sheet/attributes";
import type {Position} from "core/battlegrid/Position";
import type {Creatures} from "core/creatures/Creatures";
import type {InstructionLoop} from "core/instruction_loop";
import type {VMState} from "core/virtual_machine/VMState";
import {INTERACTION_TYPE} from "core/interactions/Interactions";
import {HIT_STATUS} from "core/virtual_machine/expressions/constants/HitStatus";
import type {create_add_creature_to_game} from "core/use_cases/add_creature_to_game";
import type {create_set_current_turn_to_creature} from "core/use_cases/gameplay/set_current_turn_to_creature";

export type AttackLogEntry = { attacker: string, target: string, power_name: string }

export const create_creature_test_helpers = ({
    creatures,
    instruction_loop,
    vm_state,
    add_creature_to_game,
    set_current_turn_to_creature,
    attack_log,
    default_attribute_value = 14,
}: {
    creatures: Creatures
    instruction_loop: InstructionLoop
    vm_state: VMState
    add_creature_to_game: ReturnType<typeof create_add_creature_to_game>
    set_current_turn_to_creature: ReturnType<typeof create_set_current_turn_to_creature>
    attack_log?: Array<AttackLogEntry>
    default_attribute_value?: number
}) => {
    const get_creature_by_name = (creature_name: string) => {
        const creature = creatures.get_all().find(c => c.data.name === creature_name)
        if (!creature) throw Error(`creature name "${creature_name}" not found`)
        return creature
    }

    const given_a_creature_is_created = (c: Partial<CreatureData> & Pick<CreatureData, "position" | "name">) => {
        const data: CreatureData = {
            name: c.name || "",
            template: c.template ?? null,
            position: c.position,
            size: c.size ?? "medium",
            image: c.image ?? `url("/public/saber-and-pistol.svg")`,
            movement: c.movement ?? 5,
            hp_current: c.hp_current ?? 10,
            hp_max: c.hp_max ?? 10,
            level: c.level ?? 1,
            team: c.team ?? null,
            attributes: c.attributes ?? Object.fromEntries(
                Object.values(ATTRIBUTES).map(attr => [attr, default_attribute_value]),
            ) as Creature["data"]["attributes"],
            powers: c.powers ?? [],
            archetypes: c.archetypes ?? [],
            constant_effects: c.constant_effects ?? [],
        }

        add_creature_to_game({data})
    }

    const given_creature = (creature_name: string) => {
        const creature = get_creature_by_name(creature_name)

        return {
            is_in_its_turn: () => {
                set_current_turn_to_creature({creature})
                instruction_loop.run()
            },
        }
    }

    const when_creature = (creature_name: string) => {
        const creature = get_creature_by_name(creature_name)
        expect(vm_state.get_acting_creature().data.name).toEqual(creature.data.name)

        return {
            moves_through: (...positions: Array<Omit<Position, "footprint"> & { footprint?: Position["footprint"] }>) => {
                const path = positions.map(p => ({...p, footprint: p.footprint ?? 1}))
                instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: "Walk"})
                instruction_loop.select({type: INTERACTION_TYPE.SELECT_PATH, path: [creature.data.position, ...path]})
            },
            selects_action: (action_name: string) => {
                instruction_loop.select({type: INTERACTION_TYPE.OPTION_SELECT, option: action_name})
            },
            selects_target: (target_creature_name: string) => {
                const target = get_creature_by_name(target_creature_name)
                instruction_loop.select({type: INTERACTION_TYPE.SELECT_CREATURE, creature_id: target.id})
            },
            misses_attack_roll_against: (target_creature_name: string) => {
                const target = get_creature_by_name(target_creature_name)
                const attack_rolls = [{creature_id: target.id, hit_status: HIT_STATUS.MISS}]
                instruction_loop.select({type: INTERACTION_TYPE.HIT_STATUS_SELECT, attack_rolls})
            },
        }
    }

    const then_creature = (creature_name: string) => {
        const creature = get_creature_by_name(creature_name)

        return {
            is_at_position: (position: Omit<Position, "footprint">) => {
                expect(creature.data.position).toEqual({...position, footprint: 1})
            },
            has_hp: (hp_current: number) => {
                expect(creature.data.hp_current).toEqual(hp_current)
            },
            has_performed_action: (action_name: string, options: { target: string }) => {
                if (!attack_log) throw Error("attack_log is required for has_performed_action")
                expect(attack_log).toContainEqual({
                    attacker: creature_name,
                    target: options.target,
                    power_name: action_name,
                })
            },
        }
    }

    return {
        given_a_creature_is_created,
        given_creature,
        when_creature,
        then_creature,
    }
}
