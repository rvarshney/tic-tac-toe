

$(document).ready(function() {
    model = new TicTacToe.Models.Board();
    view = new TicTacToe.Views.Board({model: model});
    view.render();
});