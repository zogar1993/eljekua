import {BattleGrid} from "core/battlegrid/BattleGrid";
import {create_battle_grid_visual} from "web/battle_grid/BattleGridVisual";
import {create_visual_square, SquareVisual} from "web/battle_grid/squares/SquareVisual";
import {
    Position,
    PositionFootprintOne, positions_of_same_footprint_equal,
    transform_position_to_f1,
    transform_positions_to_f1
} from "core/battlegrid/Position";
import {SQUARE_HIGHLIGHT, SquareHighlight} from "web/battle_grid/squares/SquareHighlight";
import {bound_minmax} from "stdlib/bound_minmax";
import {get_creature_defense} from "core/character_sheet/get_creature_defense";
import {EXPR} from "core/expressions/evaluator/EXPR";
import {INSTRUCTION_TYPE} from "core/expressions/parser/instructions";
import {Expr} from "core/expressions/evaluator/types";
import {AstNode} from "core/expressions/parser/nodes/AstNode";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {
    ClickableCoordinate,
    get_position_by_coordinate,
    nullable_positions_equal
} from "web/battle_grid/coordinates/ClickableCoordinate";
import {GameEvents} from "core/events/GameEvents";
import {create_visual_creature} from "web/creature/CreatureVisual";
import {AnimationQueue} from "core/AnimationQueue";
import {assert_is_not_null} from "stdlib/assert";
import {Creature} from "core/battlegrid/creatures/Creature";
import {
    Interaction,
    InteractionsSelectPath,
    InteractionsSelectPosition,
    PlayerTurnHandler,
    Targets
} from "core/instruction_loop";

export const initialize_battle_grid_ui = ({
                                              battle_grid,
                                              player_turn_handler,
                                              turn_state,
                                              game_events,
                                          }: {
    battle_grid: BattleGrid,
    player_turn_handler: PlayerTurnHandler,
    turn_state: TurnState,
    game_events: GameEvents,
}) => {
    const {size} = battle_grid
    const click_overlay = create_battle_grid_visual({width: size.x, height: size.y})
    const board = battle_grid.board.map(row => row.map(({position: {x, y}}) => create_visual_square({x, y})))

    const highlighted: Record<SquareHighlight, Set<SquareVisual>> = {
        [SQUARE_HIGHLIGHT.SELECTED]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.AREA]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.PATH]: new Set<SquareVisual>(),
        [SQUARE_HIGHLIGHT.CLICKABLE]: new Set<SquareVisual>()
    }
    const hovered = new Set<SquareVisual>()

    const get_square = ({x, y}: PositionFootprintOne) => {
        if (x < 0 || x >= size.x || y < 0 || y >= size.y)
            throw (`position {x:${x}, y:${y}} is out of the battle grid dimensions (width:${size.x}, height:${size.y})`)
        return board[y][x]
    }

    const get_squares = (position: Position) => {
        return transform_position_to_f1(position).map(p => get_square(p))
    }

    const set_highlights = ({positions, highlight}: { positions: Array<Position>, highlight: SquareHighlight }) => {
        const squares = positions.flatMap(position => get_squares(position))
        squares.forEach(square => square.set_highlight(highlight))
        squares.forEach(square => highlighted[highlight].add(square))
    }

    const switch_highlights = ({from, to}: { from: SquareHighlight, to: SquareHighlight }) => {
        highlighted[from].forEach(square => square.set_highlight(to))
        highlighted[from].forEach(square => highlighted[to].add(square))
        highlighted[from].clear()
    }

    const clear_highlights = ({highlight}: { highlight: SquareHighlight }) => {
        const squares = highlighted[highlight]
        squares.forEach(square => square.set_highlight(null))
        squares.clear()
    }

    const set_hovers = ({positions}: { positions: Array<Position> }) => {
        const squares = positions.flatMap(position => get_squares(position))
        squares.forEach(square => square.set_interaction_status("hover"))
        squares.forEach(square => hovered.add(square))
    }

    const clear_hovers = () => {
        hovered.forEach(square => square.set_interaction_status("none"))
        hovered.clear()
    }

    const clear_visual_selection = () => {
        clear_highlights({highlight: SQUARE_HIGHLIGHT.CLICKABLE})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.PATH})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.AREA})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.SELECTED})
        /*
                        if (targets) {
                            if (targets.type === "creatures") {
                                const creatures = targets.value

                                creatures.forEach(creature => creature.events.is_untargeted.raise())
                            }
                        }

             */
    }

    function set_selected_indicator() {
        const position = turn_state.get_acting_creature().data.position
        set_highlights({positions: [position], highlight: "selected"})
    }


    let latest_position: Position | null = null

    click_overlay.addOnMouseMoveHandler(coordinate => {
        const interactions = player_turn_handler.get_interaction()

        if (!is_click_coordinate_interaction(interactions)) return

        // If outside the clickable positions, then returns null.
        // There is math involved in checking what the most likely target is,
        // which makes sense particularly whenever the click position is not footprint 1.
        const position = coordinate && get_position_by_coordinate({positions: interactions.clickable, coordinate})

        if (nullable_positions_equal(latest_position, position)) return
        latest_position = position

        switch_highlights({from: SQUARE_HIGHLIGHT.PATH, to: SQUARE_HIGHLIGHT.CLICKABLE})
        switch_highlights({from: SQUARE_HIGHLIGHT.AREA, to: SQUARE_HIGHLIGHT.CLICKABLE})
        clear_hovers()

        if (position === null) return

        if (interactions.type === "select_path") {
            const path = interactions.get_path_to_destination(position)
            set_highlights({positions: path, highlight: SQUARE_HIGHLIGHT.PATH})
            set_hovers({positions: transform_position_to_f1(position)})
        } else if (interactions.type === "position_select") {
            /*
                    const highlighted_positions = selection_context.highlighted.map(({position}) => position)

                    for (const position of highlighted_positions) {
                        get_square(position).set_interaction_status("none")
                        get_square(position).set_highlight("none")
                    }

             */

            for (const creature of battle_grid.creatures)
                creature.events.is_untargeted.raise()

            //interactions.get_targets_for_position(position)
            //show_attack_success_chance_if_needed({selection_context, evaluate_ast, turn_state})
            set_hovers({positions: transform_position_to_f1(position)})
        }
    })

    click_overlay.addOnClickHandler(coordinate => {
        const interactions = player_turn_handler.get_interaction()
        if (!is_click_coordinate_interaction(interactions)) return

        const position = get_position_by_coordinate({coordinate, positions: interactions.clickable})
        if (position === null) return

        if (interactions.type === "select_path") {
            const path = interactions.get_path_to_destination(position)
            interactions.select(path)
        } else if (interactions.type === "position_select") {
            interactions.select(position)
        }
    })

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions === null) {
            clear_visual_selection()
            return
        }

        set_selected_indicator()

        if (interactions.type === "select_path") {
            set_highlights({positions: interactions.clickable, highlight: SQUARE_HIGHLIGHT.CLICKABLE})
        } else if (interactions.type === "position_select") {
            set_highlights({positions: interactions.clickable, highlight: SQUARE_HIGHLIGHT.CLICKABLE})

            /* TODO reactivate path highlighting
                        for (const {position, highlight} of interactions.highlighted)
                            set_highlight({positions: [position], highlight})
             */
        }
    })

    return {
        click_overlay,
        board,
    }
}

/* TODO activate success chance again
const show_attack_success_chance_if_needed = ({turn_state, selection_context, evaluate_ast}: {
    turn_state: TurnState,
    selection_context: AvailableInteractionsSelectPosition,
    evaluate_ast: (node: AstNode) => Expr
}) => {
    const next_instruction = turn_state.peek_instruction()
    const needs_roll = next_instruction.type === INSTRUCTION_TYPE.ATTACK_DICE_ROLL
    if (needs_roll && selection_context.target) {
        if (selection_context.target.type !== "creatures")
            throw Error("an attack roll needs to target creatures")

        const creatures = selection_context.target.value
        creatures.forEach(defender => {
            const attacker = next_instruction.attack
            const attack = EXPR.as_number(evaluate_ast(attacker))

            const defense_code = next_instruction.defense
            const defense = get_creature_defense({creature: defender, defense_code}).value

            const chance = bound_minmax(0, (attack + 20 - defense + 1) * 5, 100)

            defender.events.is_targeted.raise({attack, defense, chance})
        })
    }
}
 */

type InteractionClickCoordinate = InteractionsSelectPosition | InteractionsSelectPath
const CLICK_COORDINATE_INTERACTIONS: Array<Interaction["type"]> = ["position_select", "select_path"]

const is_click_coordinate_interaction = (interaction: Interaction | null): interaction is InteractionClickCoordinate => {
    return interaction !== null && CLICK_COORDINATE_INTERACTIONS.includes(interaction.type)
}