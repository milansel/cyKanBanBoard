/// <reference types="cypress" />

describe("Kanban board test", () => {
  beforeEach(() => {
    cy.visit("https://kanban-board-two.vercel.app");
    cy.fixture("data.json").as("data");
  });

  it("Create and remove empty tickets", function () {
    // adding tickets to kanban board
    cy.get('[data-testid="add-ticket-button"]')
      .as("addButton")
      .each((button, i) => {
        cy.wrap(button).click();

        // assert ticket is added on a list
        const columnId = this.data.columnId;

        cy.get('[data-testid="ticket"]')
          .as("ticket")
          .find("textarea")
          .should("have.attr", "columnid", columnId[i])
          .and("have.attr", "placeholder", "Add your text here");
        cy.log("**Ticket is added to the list**");

        // assert backgroundColor for the ticket
        const color = this.data.backgroundColor;
        cy.get("@ticket").should("have.css", "background-color", color[i]);
        cy.log(`**Background color is as expected: ${color[i]}**`);

        // counter on the list
        cy.get('[class="sc-fzozJi dteCCc"]')
          .eq(i)
          .as("counter")
          .invoke("text")
          .should("eql", "(1)");
        cy.log(`**Counter on the list ${columnId[i]} is equal to 1**`);

        cy.wrap(button).click();
        cy.get("@counter").invoke("text").should("eql", "(2)");
        cy.log(`**Counter on the list ${columnId[i]} is equal to 2**`);

        // assert ticket is empty
        cy.get("@ticket")
          .find("span")
          .eq(1)
          .invoke("text")
          .should("eql", "[Empty ticket]");
        cy.log("**Ticket is empty**");

        cy.get('[data-testid="delete-ticket-button"]').each((removeTicket) => {
          cy.wrap(removeTicket).click({ force: true });
        });
        cy.get("@ticket").should("not.exist");
        cy.get("@counter").invoke("text").should("eql", "(0)");
        cy.log("**Ticket is removed**");
      });
  });

  it("Add and search filled tickets", function () {
    cy.wrap(this.data.items).each((item, i) => {
      cy.get('[class="sc-AxheI dNrDWH"]')
        .find('[data-testid="add-ticket-button"]')
        .as("addToDoButton")
        .click();

      cy.get('[data-testid="ticket"]')
        .as("ticket")
        .find("textarea")
        .type(item)
        .type("{enter}");

      cy.get("@ticket").find("span").eq(1).should("have.text", item);
      cy.log(`**Ticket text is: ${item}**`);

      // search the ticket
      cy.get('[data-testid="search"]').type(item);
      cy.get("@ticket")
        .find("span")
        .eq(1)
        .should("exist")
        .and("have.text", item);
      cy.log(`**Ticket ${item} is searched**`);

      // counter on toDo list
      cy.get('[class="sc-fzozJi dteCCc"]')
        .eq(0)
        .as("counter")
        .invoke("text")
        .should("eql", "(1)");
      cy.log("**Counter on the list is equal to 1**");

      // clear search field
      cy.get('[data-testid="search"]').clear();

      // assert counter is changed
      cy.get("@counter")
        .invoke("text")
        .should("eql", "(" + (i + 1) + ")");
      cy.log(`**Counter after clearing search is changed to: ${i + 1}**`);
    });
  });

  it("Drag&drop and rename ticket", function () {
    // create some ticket
    cy.get('[class="sc-AxheI dNrDWH"]')
      .find('[data-testid="add-ticket-button"]')
      .as("addToDoButton")
      .click();

    cy.get('[data-testid="ticket"]')
      .as("ticket")
      .find("textarea")
      .type(this.data.items[0])
      .type("{enter}");

    cy.get("@ticket")
      .find("span")
      .eq(1)
      .should("have.text", this.data.items[0]);
    cy.log(`**Ticket text is: ${this.data.items[0]}**`);

    // drag & drop item to In progress column
    const dataTransfer = new DataTransfer();
    cy.get("@ticket").eq(0).trigger("dragstart", { dataTransfer });
    cy.get('[class="sc-fzoLsD bmXcrz"]').trigger("drop", { dataTransfer });

    const color = this.data.backgroundColor;
    cy.get("@ticket").should("have.css", "background-color", color[1]);
    cy.log(`**Background color is changed to: ${color[1]}**`);

    cy.get('[class="sc-fzozJi dteCCc"]')
      .eq(1)
      .as("counter")
      .invoke("text")
      .should("eql", "(1)");
    cy.log("**Counter on In Progress list is equal to 1**");

    // drag & drop item to Done column
    cy.get("@ticket").eq(0).trigger("dragstart", { dataTransfer });
    cy.get('[class="sc-fzoLsD iFWCam"]').trigger("drop", { dataTransfer });

    cy.get("@ticket").should("have.css", "background-color", color[2]);
    cy.log(`**Background color is changed to: ${color[2]}**`);

    cy.get('[class="sc-fzozJi dteCCc"]')
      .eq(2)
      .as("counter")
      .invoke("text")
      .should("eql", "(1)");
    cy.log("**Counter on the Done list is equal to 1**");

    // rename ticket
    cy.get("@ticket").dblclick().type(" done").type("{enter}");
    cy.get("@ticket")
      .find("span")
      .eq(1)
      .should("have.text", this.data.items[0] + " done");
    cy.log(`**Ticket is renamed to ${this.data.items[0] + " done"}**`);

    cy.get('[data-testid="delete-ticket-button"]').click({ force: true });
    cy.get("@ticket").should("not.exist");
    cy.log("**Ticket removed**");
  });
});
