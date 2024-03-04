const player = { WHITE: 1, BLACK: 2 };

var currentMove = player.WHITE;

const rules = {
    init: function() {
        currentMove = player.WHITE;
    },
    checkLegalMove: function(figure, origin, field, kill) {
        var result = false;
        const figureId = figure.innerText;
        const originId = origin.innerText;
        const fieldId = field.innerText;
        const killId = kill.innerText;
        result = this.checkMoveOrder(figureId);
        return result;
    },
    checkMoveOrder: function(owner) {
        var result = false;
        switch (currentMove) {
            case player.WHITE:
                result = owner > 15;
                break;
            case player.BLACK:
                result = owner < 16;
                break;    
        }
        return result;
    }
};
