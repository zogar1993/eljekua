// scripts/board.ts
var Board = class {
  constructor() {
    this.BOARD_HEIGHT = 10;
    this.BOARD_WIDTH = 10;
    this.get_cell = ({ x, y }) => this.board[y][x];
    this.get_all_cells = () => this.board.flatMap((x) => x);
    const board2 = document.querySelector(".board");
    this.board = Array.from(
      { length: this.BOARD_HEIGHT },
      (_, y) => {
        const row = document.createElement("div");
        row.classList.add("board__row");
        board2.appendChild(row);
        return Array.from({ length: this.BOARD_WIDTH }, (_2, x) => {
          const cell = document.createElement("div");
          cell.classList.add("board__cell");
          cell.dataset["x"] = `${x}`;
          cell.dataset["y"] = `${y}`;
          row.appendChild(cell);
          return {
            html_element: cell,
            position: { x, y },
            character: null
          };
        });
      }
    );
  }
  *get_area_burst({ origin, radius }) {
    const lower_x = Math.max(0, origin.x - radius);
    const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + radius);
    const lower_y = Math.max(0, origin.y - radius);
    const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + radius);
    for (let x = lower_x; x <= upper_x; x++)
      for (let y = lower_y; y <= upper_y; y++)
        yield this.get_cell({ x, y });
  }
  *get_move_area({ origin, distance }) {
    const lower_x = Math.max(0, origin.x - distance);
    const upper_x = Math.min(this.BOARD_WIDTH - 1, origin.x + distance);
    const lower_y = Math.max(0, origin.y - distance);
    const upper_y = Math.min(this.BOARD_HEIGHT - 1, origin.y + distance);
    for (let x = lower_x; x <= upper_x; x++)
      for (let y = lower_y; y <= upper_y; y++) {
        if (origin.x === x && origin.y === y) continue;
        yield this.get_cell({ x, y });
      }
  }
  clear_indicators() {
    this.get_all_cells().forEach((cell) => {
      delete cell.html_element.dataset["indicator"];
    });
  }
};

// scripts/powers/basic.ts
var shift = {
  name: "Shift",
  action: "movement",
  targeting: {
    type: "movement",
    distance: 1,
    target_type: "terrain",
    terrain_prerequisite: "unoccupied",
    amount: 1
  },
  happenings: [
    {
      type: "shift",
      target: "owner",
      destination: "target"
    }
  ]
};
var BASIC_MOVEMENT_ACTIONS = [shift];

// scripts/main.ts
var board = new Board();
board.get_all_cells().forEach(
  (cell) => cell.html_element.addEventListener("click", () => {
    if (selected_character === null) {
      if (cell.character)
        select_character(cell);
    } else {
      if (cell.html_element.dataset["indicator"] === "available-target")
        move_character(cell);
    }
  })
);
var get_in_range = (range) => {
  if (selected_character === null) throw Error("Character cannot be null");
  if (range.type === "movement") {
    const distance = "owner.movement" === range.distance ? selected_character.movement : Number(range.distance);
    return board.get_move_area({ origin: selected_character.position, distance });
  }
  throw `Range "${range.type}" not supported`;
};
var filter_targets = ({ target, cell }) => {
  if (target.target_type === "terrain")
    return !cell.character;
  throw `Target "${target.type}" not supported`;
};
function build_action_button(action) {
  const button = document.createElement("button");
  button.addEventListener("click", () => {
    [...get_in_range(action.targeting)].filter((cell) => filter_targets({
      target: action.targeting,
      cell
    })).forEach((cell) => {
      cell.html_element.dataset["indicator"] = "available-target";
    });
    clear_actions_menu();
  });
  button.innerText = action.name;
  return button;
}
function build_actions_menu() {
  const cancel = document.createElement("button");
  cancel.addEventListener("click", () => {
    selected_character = null;
    board.clear_indicators();
    clear_actions_menu();
  });
  cancel.innerText = "Cancel";
  const buttons = BASIC_MOVEMENT_ACTIONS.map(build_action_button);
  const actions_menu = document.querySelector("#actions_menu");
  buttons.forEach((button) => actions_menu.appendChild(button));
  actions_menu.appendChild(cancel);
}
function select_character(cell) {
  selected_character = cell.character;
  cell.html_element.dataset["indicator"] = "selected";
  build_actions_menu();
}
function move_character(cell) {
  if (selected_character === null) throw Error("Character cannot be null");
  const old_position = board.get_cell(selected_character.position);
  old_position.character = null;
  cell.character = selected_character;
  selected_character.position = cell.position;
  const html_creature = selected_character.html_creature;
  if (html_creature === void 0) throw Error("selected_character.html_creature cannot be null");
  html_creature.style.setProperty("--creature_position-x", `${selected_character.position.x}`);
  html_creature.style.setProperty("--creature_position-y", `${selected_character.position.y}`);
  selected_character = null;
  board.clear_indicators();
}
var selected_character = null;
function clear_actions_menu() {
  const buttons = document.querySelectorAll("#actions_menu > button");
  buttons.forEach((button) => button.remove());
}
function place_character(creature) {
  const cell = board.get_cell(creature.position);
  cell.character = creature;
  const html_creature = document.createElement("div");
  html_creature.style.setProperty("--creature__image_color", creature.image);
  html_creature.classList.add("creature");
  html_creature.style.setProperty("--creature_position-x", `${creature.position.x}`);
  html_creature.style.setProperty("--creature_position-y", `${creature.position.y}`);
  html_creature.style.setProperty("--creature__lifebar_max-hp", `${creature.max_hp}`);
  html_creature.style.setProperty("--creature__lifebar_current-hp", `${creature.hp}`);
  const html_sprite = document.createElement("div");
  html_sprite.style.setProperty("--creature__image_color", creature.image);
  html_sprite.classList.add("creature__image");
  html_creature.appendChild(html_sprite);
  const html_lifebar = document.createElement("div");
  html_lifebar.classList.add("creature__lifebar");
  html_creature.appendChild(html_lifebar);
  const html_creatures = document.getElementById("creatures");
  html_creatures.appendChild(html_creature);
  creature.html_creature = html_creature;
}
var player = { position: { x: 1, y: 2 }, image: "blue", movement: 5, hp: 7, max_hp: 10 };
var enemy = { position: { x: 5, y: 5 }, image: "orange", movement: 2, hp: 10, max_hp: 10 };
place_character(player);
place_character(enemy);
