import { forzar_tirada, iniciar, personaje } from "../funciones"

describe('Reaping Strike', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:8080/index.html')
    forzar_tirada(20, 20)
  })

  it('Si el ataque no falla', () => {
    personaje("Bob", { "x": 0, "y": 0 })
    personaje("Yeims", { "x": 1, "y": 1 })
    iniciar()

    cy.contains('button', 'Reaping Strike').click();
    cy.get('[id="actions_menu"]').should('be.not.visible');
    forzar_tirada(20, 20)
    forzar_tirada(4, 4)
    cy.get('[id="yeims"]').click();

    cy.get('[creature-id="bob"]').should('not.have.attr', 'current-turn');
    cy.get('div.action-log__line').should('contain.text', ") hits against Yeims's ac (");
    cy.get('div.action-log__line').should('contain.text', "Yeims was dealt ");

  })

  it('Si el ataque falla', () => {
    personaje("Bob", { "x": 0, "y": 0 })
    personaje("Yeims", { "x": 1, "y": 1 })
    iniciar()

    cy.contains('button', 'Reaping Strike').click();
    cy.get('[id="actions_menu"]').should('be.not.visible');
    forzar_tirada(20, 1)
    forzar_tirada(4, 4)
    cy.get('[id="yeims"]').click();

    cy.get('[creature-id="bob"]').should('not.have.attr', 'current-turn');
    cy.get('div.action-log__line').should('contain.text', ") misses against Yeims's ac (");
    cy.get('div.action-log__line').should('contain.text', "Yeims was dealt ");

  })
})
