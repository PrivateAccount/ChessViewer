const player = { WHITE: 1, BLACK: 2 };

var currentMove = null;

const rules = {
    fieldOccupancy: [],
    attackedFields: [],
    init: function() {
        currentMove = player.WHITE;
    },
    getPosition: function(origin) {
        return { row: Math.floor(origin / 8), column: Math.floor(origin % 8) };
    },
    getField: function(row, column) {
        return row * 8 + column;
    },
    getFigureField: function(figureId) {
        var result = null;
        for (var i = 0; i < this.fieldOccupancy.length; i++) {
            if (this.fieldOccupancy[i] == figureId) {
                result = i;
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
        if (!result) return false;
        result = this.checkIsKingSafe(figureId, originId, fieldId, killId);
        return result;
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
            if (kill == '--' || kill == '-1' || kill < 16) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 0 || owner == 7) { // black rook
            if (kill == '--' || kill == '-1' || kill >= 16) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 26 || owner == 29) { // white bishop
            if (kill == '--' || kill == '-1' || kill < 16) {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 2 || owner == 5) { // black bishop
            if (kill == '--' || kill == '-1' || kill >= 16) {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 25 || owner == 30) { // white knight
            if (kill == '--' || kill == '-1' || kill < 16) {
                result = Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
            }
        }
        else if (owner == 1 || owner == 6) { // black knight
            if (kill == '--' || kill == '-1' || kill >= 16) {
                result = Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
            }
        }
        else if (owner == 27) { // white queen
            if (kill == '--' || kill == '-1' || kill < 16) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row || this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 3) { // black queen
            if (kill == '--' || kill == '-1' || kill >= 16) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row || this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 28) { // white king
            if (kill == '--' || kill == '-1' || kill < 16) {
                result = Math.abs(this.getPosition(source).column - this.getPosition(destination).column) < 2 && Math.abs(this.getPosition(source).row - this.getPosition(destination).row) < 2;
            }
        }
        else if (owner == 4) { // black king
            if (kill == '--' || kill == '-1' || kill >= 16) {
                result = Math.abs(this.getPosition(source).column - this.getPosition(destination).column) < 2 && Math.abs(this.getPosition(source).row - this.getPosition(destination).row) < 2;
            }
        }
        return result;
    },
    getAttackedFields: function(figure) {
        const field = this.getFigureField(figure);
        const position = this.getPosition(field);
        if (figure >= 16 && figure < 24) { // white pawn
            if (position.column == 0) {
                this.attackedFields.push(field - 7);
            }
            else if (position.column == 7) {
                this.attackedFields.push(field - 9);
            }
            else {
                this.attackedFields.push(field - 7);
                this.attackedFields.push(field - 9);
            }
        }
        if (figure >= 8 && figure < 16) { // black pawn
            if (position.column == 0) {
                this.attackedFields.push(field + 9);
            }
            else if (position.column == 7) {
                this.attackedFields.push(field + 7);
            }
            else {
                this.attackedFields.push(field + 7);
                this.attackedFields.push(field + 9);
            }
        }
    },
    isAttacked: function(fieldId) {
        return this.attackedFields.includes(parseInt(fieldId));
    },
    checkIsKingSafe: function(figureId, originId, fieldId, killId) {
        result = true;
        var kingId, kingFieldId, kingPosition;
        switch (currentMove) {
            case player.WHITE:
                kingId = 28;
                break;
            case player.BLACK:
                kingId = 4;
                break;
        }
        kingFieldId = this.getFigureField(kingId);
        kingPosition = this.getPosition(kingFieldId);
        if (killId == 4 || killId == 28) { // try to kill a king
            return false;
        }
        this.attackedFields = [];
        if (figureId == kingId) { // king is moving
            for (var i = 0; i < this.fieldOccupancy.length; i++) {
                if (currentMove == player.WHITE) {
                    if (this.fieldOccupancy[i] < 16 && this.fieldOccupancy[i] != -1) {
                        this.getAttackedFields(this.fieldOccupancy[i]);
                    }
                }
                if (currentMove == player.BLACK) {
                    if (this.fieldOccupancy[i] >= 16 && this.fieldOccupancy[i] != -1) {
                        this.getAttackedFields(this.fieldOccupancy[i]);
                    }
                }
            }
            if (this.isAttacked(fieldId)) {
                return false;
            }
        }
        return result;
    },
};
