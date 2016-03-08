/**
 * Created by msl09 on 3/1/16.
 */

var triggers = {
    'gameOver': function (g) {
        if (g.stocks.food < 0) {
            gameOver(g, "You starved to death.");
        }
    },
    'raidOnSpring': function (game) {
        console.log(SEASONS[game.season]);
        if (SEASONS[game.season] == "spring") {
            gameOver(game, "You got killed in a raid.");
        }
    }
};