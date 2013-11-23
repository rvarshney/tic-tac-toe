if (typeof TicTacToe === "undefined") {
    window.TicTacToe = {};
}

TicTacToe.Views = {};

TicTacToe.Views.Board = Backbone.View.extend({
    events: {
        'click .cell': 'setCell',
        'click .start': 'startGame',
        'click .easy': 'setEasyGame',
        'click .hard': 'setHardGame'
    },
    initialize: function() {
        // Set the template and base DOM element
        this.template =  _.template($("#board_template").html());
        this.setElement($('.board'));

        // Listen to events
        this.listenTo(this.model, "gameFinished", this.finishGame);
        this.listenTo(this.model, "change:board", this.render);
    },
    showMessage: function(message, type) {
        // Update the message
        this.$('.message').html(message);
        this.$('.message').removeClass('alert-info');
        this.$('.message').addClass(type);
        this.$('.message').show();
    },
    startGame: function() {
        // Reset the model
        this.model.reset();
        this.model.set('inProgress', true);
        this.disableButtons();
        this.showMessage("Make a move by clicking a box!", 'alert-info');
    },
    disableButtons: function() {
        this.$('.start').attr('disabled', 'disabled');
        this.$('.easy').attr('disabled', 'disabled');
        this.$('.hard').attr('disabled', 'disabled');
    },
    setEasyGame: function() {
        this.model.set('randomMove', true);
        this.$('.easy').addClass('active');
        this.$('.hard').removeClass('active');
    },
    setHardGame: function() {
        this.model.set('randomMove', false);
        this.$('.hard').addClass('active');
        this.$('.easy').removeClass('active');
    },
    finishGame: function(result) {
        // Update the view when the game finishes
        var player = result.player;
        var winCells = result.winCells;
        var message = "Game Done! ";
        var type = 'alert-info';
        var self = this;
        switch(player) {
            case TicTacToe.Constants.DRAW:
                message = message + "Draw!";
                break;
            case TicTacToe.Constants.COMPUTER:
                message = message + " You lose!";
                type = 'alert-error';
                _.each(winCells, function(cell) {
                    var selector = 'td[data-row="' + cell.row + '"][data-column="' + cell.col + '"]';
                    self.$(selector).addClass('lose');
                });
                break;
            case TicTacToe.Constants.PLAYER:
                message = message + " You win!";
                _.each(winCells, function(cell) {
                    var selector = 'td[data-row="' + cell.row + '"][data-column="' + cell.col + '"]';
                    self.$(selector).addClass('win');
                });
                type = 'alert-success';
                break;
        }
        this.showMessage(message + "</br>Hit the Start button to play again.", type);
        this.enableButtons();
    },
    enableButtons: function() {
        this.$('.start').removeAttr('disabled');
        this.$('.easy').removeAttr('disabled');
        this.$('.hard').removeAttr('disabled');
    },
    setCell: function(event) {
        // Click handler for table cell
        var row = parseInt(event.target.attributes['data-row'].value);
        var col = parseInt(event.target.attributes['data-column'].value);
        this.model.updatePlayerCell(row, col);
    },
    render: function() {
        // Render the template
        this.$el.empty().append(this.template(this.model.toJSON()));
        if (!this.model.get('inProgress')) {
            this.showMessage("Hit the Start button to get going!", 'alert-info');
        }
        return this;
    }
});
