var g = undefined;
var ui = undefined;

function Game() {
    this.workerTotal = 5;
    this.workerIdle = 5;
    this.jobs = {
        builder: 0,
        gatherer: 0,
        hunter: 0,
        scientist: 0,
        guard: 0,
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
    this.activeTab = "stock";
}

function UI() {
    this.labels = {
        workerTotal: $("#workerTotal > :nth-child(2)"),
        workerIdle: $("#workerIdle > :nth-child(2)")
    };
    this.jobs = {};
}

var triggers = {
    'gameOver' : function (g) {
        if(g.stocks.food <= 0) {
            console.log("Game over");
        }
    }
};

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
    delete localStorage["game"];
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
    console.log(tabId, g.activeTab);
    if (tabId != g.activeTab) {
        $("#btn-" + tabId).toggleClass("active");
        $("#btn-" + g.activeTab).toggleClass("active");
        $("#" + g.activeTab).fadeOut(400, function () {
            $("#" + tabId).fadeIn();
        });
        g.activeTab = tabId;
    }
}

function calcUpkeep(game) {
    return {'food': 5, 'herb': 1, 'wood': 1}
}

function updateStock(game, ui) {
    _.forEach(game.stocks, function (v, k) {
        $("#" + k).text(game.stocks[k]);
    });
}

function nextWeek() {
    var upkeep = calcUpkeep(g);
    _.forEach(upkeep, function (v, k) {
        g.stocks[k] -= v;
    });
    updateStock(g, ui);
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