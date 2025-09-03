import {FIGHTER_POWERS} from "powers/fighter"

export function forzar_tirada(caras, resultado) {
  cy.window().then((win) => {
    win.rig_dice_roll(caras, resultado)
  })
}

export function personaje(name, position) {
  cy.window().then((win) => {
    win.add_character({
      "name": name,
      "position": position,
      "image": `url(\"/public/war-axe.svg\")`,
      "movement": 5,
      "hp_current": 7,
      "hp_max": 10,
      "level": 2,
      "attributes": { "str": 14, "con": 14, "dex": 14, "int": 14, "wis": 14, "cha": 14 },
      "powers": FIGHTER_POWERS
    })
  })
}


export function iniciar() {
  cy.window().then((win) => {
    win.start()
  })
}