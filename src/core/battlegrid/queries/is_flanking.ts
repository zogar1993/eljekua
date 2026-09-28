import type {Creature} from "core/battlegrid/creatures/Creature";
import {get_flanker_positions} from "core/battlegrid/position/get_flanker_positions";
import {are_creatures_allied} from "core/battlegrid/creatures/are_creatures_allied";
import type {BattleGrid} from "core/battlegrid/BattleGrid";

export const is_flanking = ({attacker, defender, battle_grid}: {
    attacker: Creature,
    defender: Creature,
    battle_grid: BattleGrid
}) => {
    if (are_creatures_allied(attacker, defender)) return false

    const positions = get_flanker_positions({
        attacker_position: attacker.data.position,
        defender_position: defender.data.position,
        battle_grid
    })

    const occupied = positions.filter(position => battle_grid.is_terrain_occupied(position))
    const flank_partners = occupied.map(battle_grid.get_creature_by_position)

    return flank_partners.some(flank_partner => are_creatures_allied(attacker, flank_partner))
}