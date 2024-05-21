describe('PokeMemo App - Validación Ventana Inicial', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/'); 
  });

  it('valida el título y textos de la aplicación', () => {
    cy.get('#TITLE1').should('have.text','¿Eres el mejor maestro pokemon del mundo?')
    cy.get('#TITLE2').should('have.text','Memoriza la mayor cantidad de Pokemons y demuestralo!!')
    cy.get('#TITLE3').should('have.text','Equipo elegido para esta ronda:')


  });

  it('valida la carga del equipo inicial de 6 Pokémon', () => {
    cy.get('.button-container').should('be.visible');
  
    cy.get('.button-container').find('img[alt="Button Image"]')
      .each(($img) => {
        cy.wrap($img).should('be.visible')
          .and('have.prop', 'naturalWidth')
          .should('be.gt', 0);
      })
      .its('length') 
      .should('eq', 6); 
  });

  it('valida la existencia del botón de jugar', () => {
    // Verificar que el botón de inicio existe y es visible
    cy.get('.start-button').should('be.visible');
  });
});

describe('PokeMemo App - Secuencia Máquina', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/'); 
    cy.intercept('POST', 'https://poke-memo-app-9528044356ae.herokuapp.com/enviarSecuencia').as('enviarSecuencia');
  });

  it('intercepta la llamada al jugar y valida la secuencia', () => {
    cy.get('.start-button').click();

    cy.wait('@enviarSecuencia').then((interception) => {
      const pokemonSequence = interception.response.body.pokemonSequence;
      
      // Verificar que la secuencia se renderiza
      cy.get('img[src*="pokemon"]').should('have.length', pokemonSequence.length);

      // Esperar 5 segundos y verificar que la secuencia se reemplaza por Dittos
      cy.wait(5000);
      cy.get('img[src*="pokemon"]').should('have.length', pokemonSequence.length)
        .each(($img) => {
          cy.wrap($img).should('have.attr', 'src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png'); // URL de Ditto
        });
    });
  });
});

