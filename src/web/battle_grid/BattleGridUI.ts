import {BattleGrid} from "core/battlegrid/BattleGrid";
import {create_battle_grid_visual} from "web/battle_grid/BattleGridVisual";
import {create_visual_square, SquareVisual} from "web/battle_grid/squares/SquareVisual";
import {
    Position,
    PositionFootprintOne,
    transform_position_to_f1,
} from "core/battlegrid/Position";
import {SQUARE_HIGHLIGHT, SquareHighlight} from "web/battle_grid/squares/SquareHighlight";
import {TurnState} from "core/battlegrid/player_turn_handler/TurnState";
import {
    get_position_by_coordinate,
    nullable_positions_equal
} from "web/battle_grid/coordinates/ClickableCoordinate";
import {GameEvents} from "core/events/GameEvents";
import {
    Interaction,
    InteractionsSelectArea,
    InteractionsSelectPath,
    InteractionsSelectPosition,
    PlayerTurnHandler,
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

    const clear_attack_success_chances = () => {
        for (const creature of battle_grid.creatures)
            game_events.on_creature_untargeted.raise(creature)
    }

    const show_attack_success_chances_for_position = (
        interactions: InteractionsSelectPosition | InteractionsSelectArea,
        position: Position,
    ) => {
        clear_attack_success_chances()

        const targets = interactions.get_targets_for_position(position)
        if (targets.type !== "creatures") return

        for (const creature of targets.value) {
            const hit_chance = interactions.get_attack_hit_chance_against(creature)
            if (hit_chance === null) return;
            game_events.on_creature_targeted.raise({creature, ...hit_chance})
        }

    }

    const clear_visual_selection = () => {
        clear_highlights({highlight: SQUARE_HIGHLIGHT.CLICKABLE})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.PATH})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.AREA})
        clear_highlights({highlight: SQUARE_HIGHLIGHT.SELECTED})
        clear_attack_success_chances()
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

        if (position === null) {
            clear_attack_success_chances()
            return
        }

        if (interactions.type === "select_path") {
            const path = interactions.get_path_to_destination(position)
            set_highlights({positions: path, highlight: SQUARE_HIGHLIGHT.PATH})
        } else if (interactions.type === "select_area") {
            const area = interactions.get_area_for_position(position)
            set_highlights({positions: area, highlight: SQUARE_HIGHLIGHT.AREA})
            show_attack_success_chances_for_position(interactions, position)
        } else if (interactions.type === "position_select") {
            show_attack_success_chances_for_position(interactions, position)
        }
        set_hovers({positions: transform_position_to_f1(position)})
    })

    click_overlay.addOnClickHandler(coordinate => {
        const interactions = player_turn_handler.get_interaction()
        if (!is_click_coordinate_interaction(interactions)) return

        const position = get_position_by_coordinate({coordinate, positions: interactions.clickable})
        if (position === null) return

        if (interactions.type === "select_path") {
            const path = interactions.get_path_to_destination(position)
            interactions.select(path)
        } else if (interactions.type === "select_area" || interactions.type === "position_select") {
            interactions.select(position)
        }
    })

    game_events.on_available_interactions_changed.add_handler((interactions) => {
        if (interactions === null) {
            clear_visual_selection()
            return
        }

        clear_attack_success_chances()
        set_selected_indicator()

        if (interactions.type === "select_path"
            || interactions.type === "select_area"
            || interactions.type === "position_select") {
            set_highlights({positions: interactions.clickable, highlight: SQUARE_HIGHLIGHT.CLICKABLE})
        }
    })

    return {
        click_overlay,
        board,
    }
}

type InteractionClickCoordinate = InteractionsSelectPosition | InteractionsSelectPath | InteractionsSelectArea
const CLICK_COORDINATE_INTERACTIONS: Array<Interaction["type"]> = ["position_select", "select_path", "select_area"]

const is_click_coordinate_interaction = (interaction: Interaction | null): interaction is InteractionClickCoordinate => {
    return interaction !== null && CLICK_COORDINATE_INTERACTIONS.includes(interaction.type)
}
