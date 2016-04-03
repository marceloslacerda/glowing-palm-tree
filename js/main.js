var g = undefined;
var ui = undefined;
const COLUMN_SIZING = "col-md-3";
const SEASONS = ["spring", "summer", "autumn", "winter"];

function Game() {
    this.workerTotal = 20;
    this.workerIdle = 20;
    this.jobs = {
        builder: 0,
        gatherer: 0,
        guard: 0,
        lumberjack: 0,
        miner: 0
    };
    this.stocks = {
        herb: 3,
        food: 5,
        stone: 0,
        wood: 0
    };
    this.turnNumber = 0;
    this.season = 2;
    this.gameOver = false;
}

function UI(game) {
    this.labels = {
        workerTotal: $("#workerTotal > :nth-child(2)"),
        workerIdle: $("#workerIdle > :nth-child(2)")
    };
    this.jobs = {};
    this.activeTab = "stock";
    this.stocks = {};
    this.seasonHeader = $(".season-header");
    var parent = this;
    this.events = [];
    this.currentEvent = 0;

    this.init = function () {

        function costYieldString(obj, job) {
            return _.map(obj[job], function (quantity, item) {
                return item + ": " + quantity;
            }).join(", ");
        }

        // Populate the stock table
        _.forEach(game.stocks, function (v, item) {
            var stockTable = $("#stock");
            var tr = $("<tr>").addClass("row");
            var head = $("<th>").addClass(COLUMN_SIZING + " total").text(item);
            var value = $("<td>").addClass(COLUMN_SIZING + " value").text(0);
            var yield_ = $("<td>").addClass(COLUMN_SIZING + " yield").text(0);
            var upkeep = $("<td>").addClass(COLUMN_SIZING + " upkeep").text(0);
            stockTable.append(tr);
            tr.append(head).append(value).append(yield_).append(upkeep);
            parent.stocks[item] = {"value": value, "yield": yield_, "upkeep": upkeep};
        });

        // Populate the labor table
        _.forEach(game.jobs, function (v, job) {
            var stockTable = $("#population");
            var tr = $("<div>").addClass("row");
            var head = $("<label>")
                .addClass(COLUMN_SIZING + " job-name")
                .text(job)
                .attr("for", "job-" + job);
            var value = $("<input type='number' value='0' min='0'>")
                .addClass(COLUMN_SIZING)
                .text(0)
                .attr("id", "job-" + job);
            var yieldColumn = $("<div>").addClass(COLUMN_SIZING + " yield")
                .text(costYieldString(laborYield, job));
            var upkeepColumn = $("<div>").addClass(COLUMN_SIZING + " upkeep")
                .text(costYieldString(upkeep, job));

            stockTable.append(tr);
            tr.append(head).append(value).append(yieldColumn).append(upkeepColumn);
            parent.jobs[job] = {"control": value};
            parent.setLaborChangeEvent(job);
        });

        if (game.turnNumber == 0) {
            this.hideWeekColumns();
        }
        this.resetBar = $("#reset-bar").hide().toggleClass("hidden");
        $(".dialog-screen").hide();

        //loading screen display
        window.setTimeout(function () {
            $("#loading-screen").fadeOut(function () {
                if (g.turnNumber > 0) {
                    parent.resetBar.fadeIn();
                }
                $(".credits").append($("#credits"));
            });

        }, 1000);

        $('[data-toggle="popover"]').popover()
    };

    this.hideWeekColumns = function () {
        _.forEach(parent.stocks, function (obj) {
            obj.yield.css({"opacity": 0});
            obj.upkeep.css({"opacity": 0});
        });
        $("#stock>thead>tr>th").css({"opacity": 0});
    };

    this.showWeekColumns = function () {
        _.forEach(parent.stocks, function (obj) {
            obj.yield.animate({"opacity": 1});
            obj.upkeep.animate({"opacity": 1});
        });
        $("#stock>thead>tr>th").animate({"opacity": 1});
    };

    this.setAllLabels = function (game) {
        _.forEach(parent.labels, function (v, k) {
            parent.setLabel(game, k);
        });
        ui.seasonHeader.text(SEASONS[g.season]);
    };

    this.setLabel = function (game, property) {
        var value = game[property];
        console.log("Setting property: [", property, "] with value: [", value, "]");
        parent.labels[property].text(value);
    };

    this.setMaxValueLabor = function (game) {
        _.forEach(parent.jobs, function (obj, jobName) {
            obj.control.attr("max", game.workerIdle + game.jobs[jobName]);
        });
    };

    this.setLaborControl = function (game, property) {
        var value = game.jobs[property];
        console.log("Setting control: [", property, "] with value: [", value, "]");
        parent.jobs[property].control.val(value);
        this.setMaxValueLabor(game, parent);
    };

    this.setAllLabor = function (game) {
        _.forEach(game.jobs, function (v, k) {
            parent.setLaborControl(game, k);
        });
    };

    this.setLaborChangeEvent = function (property) {
        console.log(parent.jobs, property);
        parent.jobs[property].control.change(function () {
            var newVal = $(this).val();
            var oldVal = g.jobs[property];
            if (g.jobs[property] != newVal) {
                if (newVal > oldVal + g.workerIdle) {
                    console.log("New value [ ", newVal, " ] exceeds available [ ", oldVal + g.workerIdle, " ] workers");
                    $(this).val(oldVal);
                    return;
                }
                g.jobs[property] = newVal | 0;
                g.workerIdle -= newVal - oldVal;
                parent.setLabel(g, "workerIdle");
                parent.setLaborControl(g, property);
            }
            save(g);
        });
    };

    this.showEvents = function () {
        console.log("New event message: ", this.events[this.currentEvent]);
        $("#dialog-message").text(this.events[this.currentEvent]);
        this.currentEvent++;
        this.resetBar.fadeOut();
        $("#report-screen").fadeIn();
    };

    this.hideAllDialog = function () {
        $(".dialog-screen").fadeOut();
        this.resetBar.fadeIn();
    };

    this.addGameEvent = function () {
        var str = "";
        _.forEach(arguments, function (v) {
            str += v + " ";
        });
        this.events.push(str);
    };

    this.init();
}

/*function Control(game, tag, min, max) {

 }*/

function save(game) {
    console.log('Saving game:', game);
    localStorage["game"] = JSON.stringify(game);
}

function loadOrCreate() {
    var game = localStorage["game"];
    if (game) {
        return game = JSON.parse(game);
    }
    else {
        return new Game();
    }
}

function resetGame() {
    console.log("Resetting game");
    delete localStorage["game"];
    var $site = $(".site-wrapper");
    changeTab("stock");
    $site.fadeOut(400, function () {
        $("#game").removeClass("game-over");
        $(".navbar.navbar-fixed-bottom").show();
        $("#game-over-screen").hide();
        ui.hideWeekColumns();
        init(true);
        $site.fadeIn();
    });
}

function changeTab(tabId) {
    console.log(tabId, ui.activeTab);
    if (tabId != ui.activeTab) {
        $("#btn-" + tabId).toggleClass("active");
        $("#btn-" + ui.activeTab).toggleClass("active");
        $("#" + ui.activeTab).fadeOut(400, function () {
            $("#" + tabId).fadeIn();
        });
        ui.activeTab = tabId;
    }
}

function calcUpkeep(game) {
    return _.mapValues(upkeep.workerTotal, function (ratio) {
        return ratio * game.workerTotal
    });
}

function updateStock(game, ui, yield_, upkeep) {
    function setItems(type, list) {
        _.forEach(list, function (quantity, item) {
            if (quantity < 0) {
                quantity = 0;
                game.stocks[item] = 0;
            }
            ui.stocks[item][type].text(quantity.toFixed(2));
        });
    }

    setItems("value", game.stocks);

    if (yield_ != undefined) {
        setItems("yield", yield_);
        setItems("upkeep", upkeep);
    }
}

function calcYield(game) {
    var total = {};
    _.forEach(laborYield, function (itemList, jobName) {
        var workers = game.jobs[jobName];
        _.forEach(itemList, function (baseValue, itemName) {
            total[itemName] = (total[itemName] | 0) + baseValue * workers;
        });
    });
    return total;
}

function nextSeason() {
    if (g.turnNumber == 0) {
        ui.showWeekColumns();
    }
    console.log("Another season.");
    console.log("Old stock", g.stocks);
    var upkeep = calcUpkeep(g);
    console.log('Total upkeep', upkeep);
    var yield_ = calcYield(g);
    console.log('Total yield', yield_);
    function getStock(object, item) {
        return object[item] != undefined ? object[item] : 0;
    }

    _.forEach(g.stocks, function (oldTotal, item, stocks) {
        console.log(item, oldTotal, getStock(upkeep, item), getStock(yield_, item));
        stocks[item] = oldTotal - getStock(upkeep, item) + getStock(yield_, item);
    });
    g.season = (g.season + 1) % 4;
    _.forEach(triggers, function (f) {
        f(g, ui);
    });
    if (g.gameOver) {
        return;
    }
    console.log('New Stock', g.stocks);
    ui.seasonHeader.text(SEASONS[g.season]);
    updateStock(g, ui, yield_, upkeep);
    changeTab("stock");
    nextEvent();
    g.turnNumber++;
}

function gameOver(game, cause) {
    console.log("Game over");
    $("#game").addClass("game-over");
    $("#cause-of-death").text(cause);
    $(".navbar.navbar-fixed-bottom").fadeOut();
    $("#game-over-screen").fadeIn();
    game.gameOver = true;
}

function nextEvent() {
    if (ui.currentEvent < ui.events.length) {
        ui.showEvents();
    } else {
        ui.currentEvent = 0;
        ui.events = [];
        ui.hideAllDialog(function () {
            if (g.turnNumber == 0) {
                parent.resetBar.fadeIn();
            }
        });
    }
}

function killWorkers(game, deaths) {
    game.workerTotal -= deaths;
    _.times(deaths, function () {
        var remainder = game.workerIdle - 1;
        if (remainder < 0) {
            //kill from jobs
            var jobName = _.sample(_.filter(_.keys(game.jobs), function (k) {
                return game.jobs[k] > 0;
            }));
            game.jobs[jobName]--;
        } else {
            game.workerIdle--;
        }
    });
    ui.setAllLabor(game);
    ui.setAllLabels(game);
}

function immigrantsArrive(game, qty) {
    game.workerTotal += qty;
    game.workerIdle += qty;
    ui.setAllLabels(game);
    ui.setAllLabor(game);
}

function init(reset) {
    console.log("Initializing game");
    var game = loadOrCreate();
    g = game;
    if (!reset) {
        ui = new UI(game);
    }
    ui.setAllLabels(game);
    ui.setAllLabor(game);
    updateStock(game, ui);
}