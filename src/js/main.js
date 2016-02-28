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
    this.stocks = {};
}

function UI() {
    this.labels = {
        workerTotal: $("#workerTotal > :nth-child(2)"),
        workerIdle: $("#workerIdle > :nth-child(2)")
    };
    this.jobs = {};
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
    localStorage["game"] = JSON.stringify(game);
}

function loadOrCreate() {
    var game = localStorage["game"];
    if (game) return JSON.parse(game);
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

function init() {
    console.log("Game initialized");
    g = loadOrCreate();
    ui = new UI();
    var game = g;
    setTabsControl(game, ui);
    setAllLabels(game, ui);
    setAllLabor(game, ui);
    setLaborChangeEvent(game, ui, "builder");
    setLaborControl(game, ui, "builder");
}