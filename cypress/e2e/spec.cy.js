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
    cy.get('.start-button').should('be.visible');
  });
});

describe('PokeMemo App - Secuencia Inicial', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/'); 
    cy.intercept('POST', 'https://poke-memo-app-9528044356ae.herokuapp.com/enviarSecuencia').as('enviarSecuencia');
  });

  it('intercepta la llamada al jugar y valida la secuencia', () => {
    cy.get('.start-button').click();

    cy.wait('@enviarSecuencia').then((interception) => {
      const pokemonSequence = interception.response.body.pokemonSequence;
      
      cy.get("[data-cy^='secuencia-maquina-']").should('have.length', pokemonSequence.length);

      cy.wait(5000);
      cy.get("[data-cy^='secuencia-maquina-']").should('have.length', pokemonSequence.length)
        .each(($img) => {
          cy.wrap($img).should('have.attr', 'src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png'); // URL de Ditto
        });
    });
  });
});

describe('PokeMemo App - Creación y envío de secuencia', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.intercept('POST', 'https://poke-memo-app-9528044356ae.herokuapp.com/enviarSecuencia').as('enviarSecuencia');
  });

  it('valida que al hacer clic en un Pokémon se agregue a la secuencia', () => {
    cy.get('.start-button').click();
    cy.wait('@enviarSecuencia'); 
    cy.wait(5000); 
  
    cy.get('.button-container img[alt="Button Image"]').first().then(($img) => {
      const imgSrc = $img.attr('src');
  
      cy.get('.button-container img[alt="Button Image"]').first().click();
  
      cy.log(imgSrc); 
  
      cy.get('.pokemon-image-secuencia')
        .should('have.length', 1)
        .should('have.attr', 'src', imgSrc);
    });


  });
  
  

  it('valida que al hacer clic en un Pokémon de la secuencia se remueva', () => {
    cy.get('.start-button').click();
    cy.wait('@enviarSecuencia'); 
    cy.wait(5000);
    cy.get('.button-container img[alt="Button Image"]').first().click();
    cy.wait(1000);

    cy.get('.button-container img[alt="Button Image"]').first().click();

    cy.get('.pokemon-image-secuencia')
      .find('img[alt="Button Image"]')
      .should('have.length', 0);
  });

  it('valida que el botón "Enviar Secuencia" aparezca solo cuando las secuencias son iguales', () => {
    cy.get('.start-button').click(); 
    cy.wait('@enviarSecuencia');
    cy.wait(5000);
    cy.get('.play-button').should('not.be.visible');

    cy.get('.button-container img[alt="Button Image"]').first().click();
    cy.get('.play-button').should('be.visible'); 
  });

  it('valida que la secuencia se envíe en la petición POST', () => {
    cy.get('.start-button').click(); 
    cy.wait('@enviarSecuencia');
    cy.wait(5000);
    cy.get('.button-container img[alt="Button Image"]').first().click();

    cy.get('.play-button').click();

    cy.wait('@enviarSecuencia').then((interception) => {
      expect(interception.request.body.pokemons).to.have.length.gt(0); 
    });
  });
});

describe('PokeMemo App - Finalización del Juego', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.intercept('POST', 'https://poke-memo-app-9528044356ae.herokuapp.com/enviarSecuencia').as('enviarSecuencia');
  });

  it('valida que al finalizar el juego se muestre el puntaje', () => {
    cy.get('.start-button').click();
    cy.wait(5000);
    // Jugar varias rondas hasta que el juego termine
      cy.wait('@enviarSecuencia').then((interception) => {
        const pokemonSequence = interception.response.body.pokemonSequence;
        cy.get('.button-container img[alt="Button Image"]').last().click();
          
        cy.wait(5000);
        cy.get('.play-button').click();
      });
    

    // Verificar que el juego ha terminado y se muestra el puntaje
    cy.contains('GAME OVER').should('be.visible');
    cy.contains('Puntaje:').should('be.visible');
    
    // Verificar que el puntaje sea un número (puedes ser más específico si conoces la lógica de cálculo del puntaje)
    cy.get('h2:contains("Puntaje:")').invoke('text')
      .then(puntajeText => puntajeText.replace('Puntaje: ', ''))
      .should('match', /^[0-9]+$/); // Verificar que sea un número entero positivo
  });
});
