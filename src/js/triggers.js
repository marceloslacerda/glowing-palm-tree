/**
 * Created by msl09 on 3/1/16.
 */

var triggers = {
    'gameOver': function (g) {
        if (g.stocks.food < 0) {
            gameOver(g, "You starved to death.");
        }
    },
    'raidOnSpring': function (game, ui) {
        console.log(SEASONS[game.season]);
        if (SEASONS[game.season] == "spring") {
            if (game.jobs.guard < 3) {
                gameOver(game, "You got killed in a raid.");
            } else {
                ui.showEvent(game, "You got raided by werewolves and survived.");
            }
        }
    }
};