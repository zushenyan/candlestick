describe('Dropdown', () => {
  it('change the dropdown value', () => {
    cy.visit('/widget').get('select').select('BTC').should('have.value', 'BTC');
  });
});

describe('WebSocket button', () => {
  it('should change text', () => {
    const btn = cy.visit('/widget').get('button');
    btn.wait(1000).should('have.text', 'disconnect');
    btn.click().should('have.text', 'reconnect');
    btn.click().wait(1000).should('have.text', 'disconnect');
  });
});
