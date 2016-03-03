var g = undefined;
var ui = undefined;

function Game() {
    this.workerTotal = 5;
    this.workerIdle = 5;
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
}

function UI() {
    this.labels = {
        workerTotal: $("#workerTotal > :nth-child(2)"),
        workerIdle: $("#workerIdle > :nth-child(2)")
    };
    this.jobs = {};
    this.activeTab = "stock";
}

/*function Control(game, tag, min, max) {

 }*/

function setLabel(game, ui, property) {
    var value = game[property];
    console.log("Setting property: [", property, "] with value: [", value, "]");
    ui.labels[property].text(value);
}

function setAllLabels(game, ui) {
    _.forEach(ui.labels, function (v, k) {
        setLabel(game, ui, k);
    });
}

function setMaxValueLabor(game, ui) {
    _.forEach(ui.jobs, function (v, k) {
        v.attr("max", game.workerIdle + game.jobs[k]);
    });
}
function setLaborControl(game, ui, property) {
    var value = game.jobs[property];
    console.log("Setting control: [", property, "] with value: [", value, "]");
    ui.jobs[property].val(value);
    setMaxValueLabor(game, ui);
}

function setLaborChangeEvent(game, ui, property) {
    ui.jobs[property].change(function () {
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
            setLabel(game, ui, "workerIdle");
            setLaborControl(game, ui, property);
        }
        save(game);
    });
}

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
        $site.fadeIn();
        init();
    });
}

function setAllLabor(game, ui) {
    _.forEach(game.jobs, function (v, k) {
        console.log(k);
        ui.jobs[k] = $("#" + k + " * input");
        setLaborChangeEvent(game, ui, k);
        setLaborControl(game, ui, k);
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

function updateStock(game, ui) {
    _.forEach(game.stocks, function (v, k) {
        $("#" + k).text(game.stocks[k].toFixed(2));
    });
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
    updateStock(g, ui);
    changeTab("stock");
}

function init() {
    console.log("Game initialized");
    g = loadOrCreate();
    ui = new UI();
    var game = g;
    setAllLabels(game, ui);
    setAllLabor(game, ui);
    setLaborChangeEvent(game, ui, "builder");
    setLaborControl(game, ui, "builder");
    updateStock(game, ui);
}