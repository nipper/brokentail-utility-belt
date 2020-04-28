export const registerSettings = function () {
    game.settings.register("brokentail-utility-belt", "useIcon", {
        name: "Use Icons",
        hint: "Use icons instead of text",
        scope: "world",
        default: false,
        config: true,
        type: Boolean
    });
};
