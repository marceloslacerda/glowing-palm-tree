/**
 * Created by msl09 on 3/1/16.
 */

function deadFromStock(game, item) {
    return _.ceil(-game.stocks[item] * upkeep.workerTotal[item]);
}

function basicDeathTrigger(game, deadWorkers, gameOverMessage, workerDeathMessage, successMessage) {
    if (deadWorkers <= 0) {
        if (successMessage) {
            ui.addGameEvent(successMessage);
        }
    } else if (deadWorkers >= game.workerTotal) {
        gameOver(game, gameOverMessage);
    } else {
        var msg = _.replace(workerDeathMessage, '{}', deadWorkers);
        if (deadWorkers == 1) {
            msg = _.replace(msg, 'workers', 'worker');
        }
        ui.addGameEvent(msg);
        killWorkers(game, deadWorkers);
    }
}

function isSeason(game, season) {
    return SEASONS[game.season] == season;
}

var triggers = {
    'foodEnd': function (game) {
        var deadWorkers = deadFromStock(game, "food");
        basicDeathTrigger(game, deadWorkers, "You starved to death", "{} workers died due to famine.");
    },
    'woodEnd': function (game) {
        if (isSeason("winter")) {
            var deadWorkers = deadFromStock(game, "wood");
            basicDeathTrigger(game, deadWorkers, "The cold winter killed you.", "The relentless winter\
                reaped {} lives this year. Having enough firewood for everybody could have prevented this.");
        }
    },
    'herbEnd': function (game) {
        if (isSeason("spring") || isSeason("autumn")) {
            var deadWorkers = deadFromStock(game, "herb");
            basicDeathTrigger(game, deadWorkers, "The sudden change in temperature got {} workers sick.\
                Without herbs for medicine death followed.");
        }
    },
    'raidOnSpring': function (game) {
        if (isSeason("spring")) {
            var deadWorkers = 3 - g.jobs.guard;
            basicDeathTrigger(game, deadWorkers,
                "You got killed in a raid.",
                "You got raided by werewolves and {} workers died.",
                "Your guards were able to repel a pathetic raid from the werewolves!");
        }
    },
    'immigrantsOnSummer': function (game, ui) {
        if (isSeason("summer")) {
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
