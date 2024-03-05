const player = { WHITE: 1, BLACK: 2 };

var currentMove = null;

const rules = {
    fieldOccupancy: [],
    init: function() {
        currentMove = player.WHITE;
    },
    getPosition: function(origin) {
        return { row: Math.floor(origin / 8), column: Math.floor(origin % 8) };
    },
    getField: function(row, column) {
        return row * 8 + column;
    },
    checkFreeFields: function(from, to) {
        var result = true;
        const source = this.getPosition(from);
        const destination = this.getPosition(to);
        if (source.row == destination.row) {
            for (var i = source.column + 1; i < destination.column; i++) {
                const id = this.getField(source.row, i);
                if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                    result = false;
                }
            }
            for (var i = destination.column + 1; i < source.column; i++) {
                const id = this.getField(source.row, i);
                if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                    result = false;
                }
            }
        }
        else if (source.column == destination.column) {
            for (var i = source.row + 1; i < destination.row; i++) {
                const id = this.getField(i, source.column);
                if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                    result = false;
                }
            }
            for (var i = destination.row + 1; i < source.row; i++) {
                const id = this.getField(i, source.column);
                if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                    result = false;
                }
            }
        }
        else {
            if (Math.abs(source.row - destination.row) == Math.abs(source.column - destination.column)) {
                for (var i = source.row + 1, j = source.column + 1; i < destination.row && j < destination.column; i++, j++) {
                    const id = this.getField(i, j);
                    if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                        result = false;
                    }
                }
                for (var i = destination.row + 1, j = destination.column + 1; i < source.row && j < source.column; i++, j++) {
                    const id = this.getField(i, j);
                    if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                        result = false;
                    }
                }
                for (var i = destination.row + 1, j = destination.column - 1; i < source.row && j > source.column; i++, j--) {
                    const id = this.getField(i, j);
                    if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                        result = false;
                    }
                }
                for (var i = destination.row - 1, j = destination.column + 1; i > source.row && j < source.column; i--, j++) {
                    const id = this.getField(i, j);
                    if (this.fieldOccupancy[id] != undefined && this.fieldOccupancy[id] != -1) {
                        result = false;
                    }
                }
            }
            else {
                result = false;
            }
        }
        return result;
    },
    checkIsLegalMove: function(figure, origin, field, kill, fieldOccupancy) {
        var result = false;
        const figureId = figure.innerText;
        const originId = origin.innerText;
        const fieldId = field.innerText;
        const killId = kill.innerText;
        this.fieldOccupancy = fieldOccupancy;
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
                    result = source - destination == 8 || source - destination == 16 && this.checkFreeFields(source, destination);
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
                    result = destination - source == 8 || destination - source == 16 && this.checkFreeFields(source, destination);
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
        else if (owner == 24 || owner == 31) { // white rook
            if (kill == '--' || kill == '-1') {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            else {
                if (kill < 16) {
                    if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                        result = this.checkFreeFields(source, destination);
                    }
                }
            }
        }
        else if (owner == 0 || owner == 7) { // black rook
            if (kill == '--' || kill == '-1') {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            else {
                if (kill >= 16) {
                    if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                        result = this.checkFreeFields(source, destination);
                    }
                }
            }
        }
        else if (owner == 26 || owner == 29) { // white bishop
            if (kill == '--' || kill == '-1') {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            else {
                if (kill < 16) {
                    if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                        result = this.checkFreeFields(source, destination);
                    }
                }
            }
        }
        else if (owner == 2 || owner == 5) { // black bishop
            if (kill == '--' || kill == '-1') {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            else {
                if (kill >= 16) {
                    if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                        result = this.checkFreeFields(source, destination);
                    }
                }
            }
        }
        else if (owner == 25 || owner == 30) { // white knight
            if (kill == '--' || kill == '-1') {
                if (Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1) {
                    result = true;
                }
                else {
                    result = false;
                }
            }
            else {
                if (kill < 16) {
                    if (Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1) {
                        result = true;
                    }
                    else {
                        result = false;
                    }
                }
            }
        }
        else if (owner == 1 || owner == 6) { // black knight
            if (kill == '--' || kill == '-1') {
                if (Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1) {
                    result = true;
                }
                else {
                    result = false;
                }
            }
            else {
                if (kill >= 16) {
                    if (Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1) {
                        result = true;
                    }
                    else {
                        result = false;
                    }
                }
            }
        }
        else {
            result = true;
        }
        return result;
    },
};
