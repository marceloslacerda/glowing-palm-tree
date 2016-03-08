var g = undefined;
var ui = undefined;
const COLUMN_SIZING = "col-md-3";

function Game() {
    this.workerTotal = 20;
    this.workerIdle = 20;
    this.jobs = {
        builder: 0,
        gatherer: 0,
        scientist: 0,
        guard: 0,
        lumberjack: 0,
        miner: 0
    };
    this.stocks = {
        herb: 3,
        food: 5,
        stone: 2,
        iron: 0,
        coal: 0,
        leather: 0,
        steel: 0,
        wood: 5
    };
    this.firstSeason = true;
}

function UI(game) {
    this.labels = {
        workerTotal: $("#workerTotal > :nth-child(2)"),
        workerIdle: $("#workerIdle > :nth-child(2)")
    };
    this.jobs = {};
    this.activeTab = "stock";
    this.stocks = {};
    var parent = this;

    this.init = function () {
        _.forEach(game.jobs, function (v, job) {
            console.log(job);
            parent.jobs[job] = $("#" + job + " * input");
            parent.setLaborChangeEvent(game, job);
        });

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
        if (game.firstSeason) {
            this.hideWeekColumns();
        }
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
        game.firstSeason = false;
    };

    this.setAllLabels = function (game) {
        _.forEach(parent.labels, function (v, k) {
            parent.setLabel(game, k);
        });
    };

    this.setLabel = function (game, property) {
        var value = game[property];
        console.log("Setting property: [", property, "] with value: [", value, "]");
        parent.labels[property].text(value);
    };

    this.setMaxValueLabor = function (game) {
        _.forEach(parent.jobs, function (v, k) {
            v.attr("max", game.workerIdle + game.jobs[k]);
        });
    };

    this.setLaborControl = function (game, property) {
        var value = game.jobs[property];
        console.log("Setting control: [", property, "] with value: [", value, "]");
        parent.jobs[property].val(value);
        this.setMaxValueLabor(game, parent);
    };

    this.setAllLabor = function (game) {
        _.forEach(game.jobs, function (v, k) {
            parent.setLaborControl(game, k);
        });
    };

    this.setLaborChangeEvent = function (game, property) {
        console.log(parent.jobs, property);
        parent.jobs[property].change(function () {
            var newVal = $(this).val();
            var oldVal = game.jobs[property];
            if (game.jobs[property] != newVal) {
                if (newVal > oldVal + game.workerIdle) {
                    console.log("New value [ ", newVal, " ] exceeds available [ ", oldVal + game.workerIdle, " ] workers");
                    $(this).val(oldVal);
                    return;
                }
                game.jobs[property] = newVal | 0;
                game.workerIdle -= newVal - oldVal;
                parent.setLabel(game, "workerIdle");
                parent.setLaborControl(game, property);
            }
            save(game);
        });
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
    if (game) return JSON.parse(game);
    console.log(game);
    return new Game();
}

function resetGame() {
    console.log("Resetting game");
    delete localStorage["game"];
    var $site = $(".site-wrapper");
    changeTab("stock");
    $site.fadeOut(400, function () {
        $("#game").removeClass("game-over");
        $(".navbar.navbar-fixed-bottom").show();
        $("#dialog_screen").hide();
        ui.hideWeekColumns();
        $site.fadeIn();
        init();
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
    return {
        'food': game.workerTotal,
        'herb': game.workerTotal / 5,
        'wood': game.workerTotal / 5
    }
}

function updateStock(game, ui, yield_, upkeep) {
    function setItems(type, list) {
        _.forEach(list, function (quantity, item) {
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
    if (g.firstSeason) {
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
    _.forEach(triggers, function (f) {
        f(g);
    });
    console.log('New Stock', g.stocks);
    updateStock(g, ui, yield_, upkeep);
    changeTab("stock");
}

function init() {
    console.log("Initializing game");
    g = loadOrCreate();
    var game = g;
    if (ui == undefined) {
        ui = new UI(game);
    }
    ui.setAllLabels(game);
    ui.setAllLabor(game);
    updateStock(game, ui);
}