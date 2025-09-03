import { forzar_tirada, iniciar, personaje } from "../funciones"

describe('Cleave', () => {
  it('Cuando haya un solo objetivo, se descarta el ataque secundario', () => {
    cy.visit('http://127.0.0.1:8080/index.html')

    forzar_tirada(20, 20)
    personaje("Bob", { "x": 0, "y": 0 })
    personaje("Yeims", { "x": 1, "y": 1 })
    personaje("Maik", { "x": 3, "y": 3 })
    iniciar()

    cy.contains('button', 'Cleave').click();
    cy.get('[id="actions_menu"]').should('be.not.visible');
    forzar_tirada(20, 20)
    forzar_tirada(4, 4)
    cy.get('[id="yeims"]').click();

    cy.get('[creature-id="bob"]').should('not.have.attr', 'current-turn');
    cy.get('div.action-log__line').should('contain.text', ") hits against Yeims's ac (");

  })

  it('Cuando haya un segundo objetivo, lo atacará automáticamente', () => {
    cy.visit('http://127.0.0.1:8080/index.html')

    forzar_tirada(20, 20)
    personaje("Bob", { "x": 0, "y": 0 })
    personaje("Yeims", { "x": 1, "y": 0 })
    personaje("Maik", { "x": 0, "y": 1 })
    iniciar()

    cy.contains('button', 'Cleave').click();
    cy.get('[id="actions_menu"]').should('be.not.visible');
    forzar_tirada(20, 20)
    forzar_tirada(4, 4)
    cy.get('[id="yeims"]').click();

    cy.get('[creature-id="bob"]').should('not.have.attr', 'current-turn');
    cy.get('div.action-log__line').should('contain.text', "Yeims was dealt");
    cy.get('div.action-log__line').should('contain.text', "Maik was dealt");
  })


  it('Cuando haya más de un objetivo secundario disponible, deberás elegir manualmente entre los objetivos', () => {
    cy.visit('http://127.0.0.1:8080/index.html')

    forzar_tirada(20, 20)
    personaje("Bob", { "x": 1, "y": 1 })
    personaje("Yeims", { "x": 2, "y": 1 }) //derecha
    personaje("Jenri", { "x": 0, "y": 1 }) //izquierda
    personaje("Maik", { "x": 1, "y": 0 }) //arriba
    iniciar()

    cy.contains('button', 'Cleave').click();
    cy.get('[id="actions_menu"]').should('be.not.visible');
    forzar_tirada(20, 20)
    forzar_tirada(4, 4)
    cy.get('[id="jenri"]').click(); // Primary target
    cy.get('[id="maik"]').click(); // Secondary target

    cy.get('[creature-id="bob"]').should('not.have.attr', 'current-turn');
    cy.get('div.action-log__line').should('contain.text', "Jenri was dealt");
    cy.get('div.action-log__line').should('contain.text', "Maik was dealt");
  })


  it('Si no hay objetivos disponibles, no estará habilitada la accion', () => {
    cy.visit('http://127.0.0.1:8080/index.html')

    forzar_tirada(20, 20)
    personaje("Bob", { "x": 0, "y": 0 })
    personaje("Yeims", { "x": 4, "y": 1 })
    personaje("Maik", { "x": 2, "y": 3 })
    iniciar()

    cy.contains('button', 'Cleave').should('be.visible').should('be.disabled'); //Asegura que el botón no esté visible y esté deshabilitado

  })
})
