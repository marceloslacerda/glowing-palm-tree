/**
 * Created by msl09 on 3/1/16.
 */

var triggers = {
    'gameOver': function (g) {
        if (g.stocks.food < 0) {
            console.log("Game over");
            $("#game").addClass("game-over");
            $(".navbar.navbar-fixed-bottom").fadeOut();
            $("#dialog_screen").fadeIn();
        }
    }
};