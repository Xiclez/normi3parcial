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
      cy.get("[data-cy^='secuencia-maquina-']").should('have.length', pokemonSequence.length);

      // Esperar 5 segundos y verificar que la secuencia se reemplaza por Dittos
      cy.wait(5000);
      cy.get("[data-cy^='secuencia-maquina-']").should('have.length', pokemonSequence.length)
        .each(($img) => {
          cy.wrap($img).should('have.attr', 'src', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png'); // URL de Ditto
        });
    });
  });
});

describe('PokeMemo App - Interacciones y Secuencia', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.intercept('POST', 'https://poke-memo-app-9528044356ae.herokuapp.com/enviarSecuencia').as('enviarSecuencia');
  });

  it('valida que al hacer clic en un Pokémon se agregue a la secuencia', () => {
    cy.get('.start-button').click();
    cy.wait('@enviarSecuencia'); 
    cy.wait(5000); 
  
    // Obtenemos la URL de la imagen del primer Pokémon disponible
    cy.get('.button-container img[alt="Button Image"]').first().then(($img) => {
      const imgSrc = $img.attr('src');
  
      cy.get('.button-container img[alt="Button Image"]').first().click();
  
      cy.log(imgSrc); // Imprime la URL de la imagen en la consola de Cypress
  
      // Verificamos que la imagen del Pokémon seleccionado esté en la secuencia
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

    // Verificamos que la secuencia a enviar esté vacía
    cy.get('.pokemon-image-secuencia')
      .find('img[alt="Button Image"]')
      .should('have.length', 0);
  });

  it('valida que el botón "Enviar Secuencia" aparezca solo cuando las secuencias son iguales', () => {
    cy.get('.start-button').click(); 
    cy.wait('@enviarSecuencia');

    // Verificamos que el botón "Enviar Secuencia" no está visible al inicio
    cy.get('.play-button').should('not.be.visible');

    // Agregamos Pokémon a la secuencia hasta que coincida con la secuencia a memorizar
    cy.get('.button-container img[alt="Button Image"]').each(($img) => {
      cy.wrap($img).click();
      cy.get('.play-button').should('not.be.visible'); // El botón no debería aparecer hasta que las secuencias sean iguales
    });

    // Verificamos que el botón "Enviar Secuencia" aparece cuando las secuencias son iguales
    cy.get('.play-button').should('be.visible');
  });

  it('valida que la secuencia se envíe en la petición POST', () => {
    cy.get('.start-button').click(); 
    cy.wait('@enviarSecuencia');

    // Agregamos Pokémon a la secuencia hasta que coincida con la secuencia a memorizar
    cy.get('.button-container img[alt="Button Image"]').each(($img) => {
      cy.wrap($img).click();
    });

    // Hacemos clic en el botón "Enviar Secuencia"
    cy.get('.play-button').click();

    // Verificamos que la petición POST se haya realizado con la secuencia correcta
    cy.wait('@enviarSecuencia').then((interception) => {
      expect(interception.request.body.pokemons).to.have.length.gt(0); // La secuencia no debe estar vacía
      // Aquí podrías agregar más aserciones para validar el contenido exacto de la secuencia enviada
    });
  });
});

