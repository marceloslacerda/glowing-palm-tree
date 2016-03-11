/**
 * Created by msl09 on 3/1/16.
 */

var triggers = {
    'foodEnd': function (game) {
        var deadWorkers = -game.stocks.food;
        if (deadWorkers <= 0) {
            //Everybody's fed, nothing to report
        } else if (deadWorkers >= game.workerTotal) {
            gameOver(game, "You starved to death.");
        } else {
            ui.addGameEvent(deadWorkers, "workers died because of starvation.");
            killWorkers(game, deadWorkers);
        }
    },
    'woodEnd': function (game) {
        if (SEASONS[game.season] == "winter") {
            var deadWorkers = _.ceil(-game.stocks.wood / 5);
            if (deadWorkers <= 0) {
                // Enough fuel for everybody
            } else {
                if (deadWorkers >= game.workerTotal) {
                    gameOver(game, "You the cold winter killed you.");
                } else {
                    ui.addGameEvent("The relentless winter reaped", deadWorkers, "lives this year. Having enough firewood for everybody could have prevented this.");
                    killWorkers(game, deadWorkers);
                }
                game.stocks.wood = 0;
            }
        }
    },
    'raidOnSpring': function (game, ui) {
        if (SEASONS[game.season] == "spring") {
            var deadWorkers = 3 - g.jobs.guard;
            if (deadWorkers <= 0) {
                ui.addGameEvent("Your guards were able to repel a pathetic raid from the werewolves!");
            } else if (deadWorkers >= g.workerTotal) {
                gameOver(game, "You got killed in a raid.");
            } else {
                ui.addGameEvent("You got raided by werewolves and", deadWorkers, "workers died.");
                killWorkers(g, deadWorkers);
            }
        }
    },
    'immigrantsOnSummer': function (game, ui) {
        if (SEASONS[game.season] == "summer") {
            var immigrants = _.random(1, 3);
            if (immigrants == 1) {
                ui.addGameEvent("One immigrant have arrived!");
            } else {
                ui.addGameEvent(immigrants, "immigrants have arrived!");
            }
            immigrantsArrive(game, immigrants);
        }
    },
    'debugEvent': function (game) {
        //killWorkers(game, 5);
    }
};