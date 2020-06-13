const array_rotator = function (array_to_rotate, n: number) {
  return array_to_rotate
    .slice(n, array_to_rotate.length)
    .concat(array_to_rotate.slice(0, n));
};

function decorate_combatants(combatant) {
  const current_hp: number = combatant.actor.data.data.attributes.hp.value;
  const max_hp: number = combatant.actor.data.data.attributes.hp.max;
  let is_blooded: boolean = current_hp <= max_hp / 2;
  let hp_step: number = Math.floor(current_hp / (max_hp / 5));
  const chart_blocks: String[] = ["", "▁", "▂", "▃", "▆", "▇"];

  if (game.user.isGM || combatant.players.length !== 0) {
    combatant.is_blooded = is_blooded;
    combatant.max_hp = max_hp;
    combatant.ac = combatant.actor.data.data.attributes.ac;
    combatant.current_hp = current_hp;
    combatant.chart_block = chart_blocks[hp_step];
    combatant.is_dead = current_hp <= 0;
  }
  combatant.icon_url = combatant.token.img;
  combatant.use_icons = game.settings.get("brokentail-utility-belt", "useIcon");

  switch (hp_step) {
    case 5:
      combatant.bar_color = "good";
      break;
    case 4:
      combatant.bar_color = "warning";
    case 3:
      combatant.bar_color = "warning";
      break;
    default:
      combatant.bar_color = "danger";
  }

  return combatant;
}

export class CombatWindow extends Application {
  constructor(options = {}) {
    super(options);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = "Combat Order";
    options.id = "combat_window";
    options.minimizable = true;
    options.template =
      "modules/brokentail-utility-belt/templates/combat_window.hbs";
    options.popOut = true;
    options.resizable = true;
    options.classes = ["sidebar-popout", "but-combat-window"];
    options.left = 115;
    options.top = 70;
    options.width = 400;
    options.height = 50;
    return options;
  }

  async getData() {
    if (!game.combat) {
      return {
        isCombat: false,
        message: "There isn't an active combat.",
      };
    }

    if (game.combat.round === 0) {
      return {
        isCombat: false,
        message: "The combat hasn't started.",
      };
    }

    if (game.combat.combatants.length === 0) {
      return {
        isCombat: false,
        message: "There are no active combatants.",
      };
    }

    let combatants = array_rotator(game.combat.turns, game.combat.turn).map(
      decorate_combatants
    );

    return {
      isCombat: true,
      combatants: combatants,
      empty: combatants.length === 0,
    };
  }

  activateListeners(html) {
    const targets = $(html).find(".combat_window_actor");
    targets.on("click", (ev) => {
      let combatantId = ev.target.getAttribute("data-id");
      let combatant = game.combat.getCombatantByToken(combatantId);
      if (
        combatant.players.map((u) => u.id).includes(game.user.id) ||
        game.user.isGM
      ) {
        combatant.actor.sheet.render(true);
      }
    });
  }
}
