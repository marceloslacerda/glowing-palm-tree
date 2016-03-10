/**
 * Created by msl09 on 3/1/16.
 */

var triggers = {
    'foodEnd': function (g) {
        var deadWorkers = -g.stocks.food;
        if (deadWorkers <= 0) {
            //Everybody's fed, nothing to report
        } else if (deadWorkers >= g.workerTotal) {
            gameOver(g, "You starved to death.");
        } else {
            ui.addGameEvent(deadWorkers, "workers died because of starvation.");
            killWorkers(g, deadWorkers);
        }
    },
    'raidOnSpring': function (game, ui) {
        console.log(SEASONS[game.season]);
        if (SEASONS[game.season] == "spring") {
            var deadWorkers = 3 - g.jobs.guard;
            if (deadWorkers <= 0) {
            } else if (deadWorkers >= g.workerTotal) {
                gameOver(game, "You got killed in a raid.");
            } else {
                ui.addGameEvent("You got raided by werewolves and", deadWorkers, "workers died.");
                killWorkers(g, deadWorkers);
            }
        }
    }
};