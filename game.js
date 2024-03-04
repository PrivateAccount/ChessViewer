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
        if (!result) return false;
        result = this.checkMoveCorrectness(figureId, originId, fieldId, killId);
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
    },
    checkMoveCorrectness: function(owner, source, destination, kill) {
        var result = false;
        if (owner >= 16 && owner < 24) { // white pawn
            if (kill == '--' || kill == '-1') {
                if (source >= 48 && source < 56) {
                    result = source - destination == 8 || source - destination == 16;
                }
                else {
                    result = source - destination == 8;
                }    
            }
            else {
                if (kill < 16) {
                    result = source - destination == 7 || source - destination == 9;
                }
            }
        }
        else if (owner >= 8 && owner < 16) { // black pawn
            if (kill == '--' || kill == '-1') {
                if (source >= 8 && source < 16) {
                    result = destination - source == 8 || destination - source == 16;
                }
                else {
                    result = destination - source == 8;
                }    
            }
            else {
                if (kill >= 16) {
                    result = destination - source == 7 || destination - source == 9;
                }
            }
        }
        else {
            result = true;
        }
        return result;
    },
};
