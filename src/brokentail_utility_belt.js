/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */
// Import TypeScript modules
import { registerSettings } from "./module/settings.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { CombatWindow } from "./module/combatWindow.js";
let combatWindow;
Hooks.once("ready", () => {
  combatWindow = new CombatWindow();
});
Hooks.on("updateCombatant", () => {
  combatWindow.render();
});
Hooks.on("updateCombat", () => {
  combatWindow.render();
});
/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
  console.log("brokentail-utility-belt | Initializing brokentail-utility-belt");
  // Assign custom classes and constants here
  // Register custom module settings
  registerSettings();
  // Preload Handlebars templates
  await preloadTemplates();
  // Register custom sheets (if any)
});
/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
  // Do anything after initialization but before
  // ready
});
/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
  // Do anything once the module is ready
});
Hooks.on("renderCombatTracker", (app, html) => {
  if (!game.combat) {
    return;
  }
  console.log("rendering combat track");
  const combatTrackerButton =
    '<a id=\'but-combatTrackerBtn\' title="Open Combat Tracker" data-control="openTracker">\n' +
    '                <i class="fas fa-external-link-alt"></i>\n' +
    "            </a>";
  if (game.user.isGM) {
    html.find("a.combat-create").after(combatTrackerButton);
  } else {
    const combatTrackerRow = `<nav class='encounters flexrow'>${combatTrackerButton}</nav>`;
    html.find("header#combat-round nav").after(combatTrackerRow);
  }
  html.find("#but-combatTrackerBtn").click(async (ev) => {
    ev.stopPropagation();
    combatWindow.render(true);
  });
});
// Add any additional hooks if necessary
Hooks.on("updateCombat", async (combat) => {
  let token_name = combat.combatant.name;
  let token_id = game.combat.combatant._id;
  ChatMessage.create(
    {
      user: game.users.players.filter((u) => u.isGM)[0].id,
      speaker: 2,
      content: `<a data-id='${token_id}' id='token_link'>${token_name}</a>'s turn. Please make your move.`,
      whisper: game.combat.combatant.players.map((u) => u.data._id),
    },
    {}
  );
});
Hooks.on("renderChatMessage", (message, html) => {
  let chatCard = html.find("#token_link");
  if (chatCard.length === 0) {
    return;
  }
  // adding click events to the buttons, this gets redone since they can break through rerendering of the card
  html.find("#token_link").click(async (ev) => {
    ev.stopPropagation();
    let combatant_id = ev.target.dataset.id;
    game.combat.combatants
      .filter((u) => u._id === combatant_id)[0]
      .actor.sheet.render(true);
  });
});
Hooks.once("init", async function () {
  window.addEventListener("keydown", (event) => {
    if (event.keyCode === 82 && event.shiftKey) {
      console.log("R");
    }
  });
});
