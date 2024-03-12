const player = { WHITE: 1, BLACK: 2 };

var currentMove = null;

const rules = {
    fieldOccupancy: [],
    attackedFields: [],
    protectedFields: [],
    castlingBreak: [],
    castling: {},
    promotion: {},
    init: function() {
        currentMove = player.WHITE;
        this.castlingBreak = [];
        this.castling = { figure: null, origin: null, field: null };
        this.promotion = { figure: null, origin: null, field: null, kill: null };
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
                result = owner >= 16 && owner < 32 || owner >= 40 && owner < 48 ;
                break;
            case player.BLACK:
                result = owner >= 0 && owner < 16 || owner >= 32 && owner < 40;
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
                if (kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
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
                if (kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                    result = destination - source == 7 || destination - source == 9;
                }
            }
        }
        else if (owner == 24 || owner == 31) { // white rook
            if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            if (owner == 24) {
                this.castlingBreak.push('58');
            }
            if (owner == 31) {
                this.castlingBreak.push('62');
            }
        }
        else if (owner == 0 || owner == 7) { // black rook
            if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
            if (owner == 0) {
                this.castlingBreak.push('2');
            }
            if (owner == 7) {
                this.castlingBreak.push('6');
            }
        }
        else if (owner == 26 || owner == 29) { // white bishop
            if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 2 || owner == 5) { // black bishop
            if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                if (this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 25 || owner == 30) { // white knight
            if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                result = Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
            }
        }
        else if (owner == 1 || owner == 6) { // black knight
            if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                result = Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 1 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 2 || Math.abs(this.getPosition(source).row - this.getPosition(destination).row) == 2 && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
            }
        }
        else if (owner == 27 || owner >= 40 && owner < 48) { // white queen
            if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row || this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 3 || owner >= 32 && owner < 40) { // black queen
            if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row || this.getPosition(source).column != this.getPosition(destination).column && this.getPosition(source).row != this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 28) { // white king
            if (this.isCastling(owner, source, destination)) {
                result = this.castlingAllowable(owner, source, destination);
            }
            else if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                result = Math.abs(this.getPosition(source).column - this.getPosition(destination).column) < 2 && Math.abs(this.getPosition(source).row - this.getPosition(destination).row) < 2;
            }
            if (result) {
                this.castlingBreak.push('58');
                this.castlingBreak.push('62');
            }
        }
        else if (owner == 4) { // black king
            if (this.isCastling(owner, source, destination)) {
                result = this.castlingAllowable(owner, source, destination);
            }
            else if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                result = Math.abs(this.getPosition(source).column - this.getPosition(destination).column) < 2 && Math.abs(this.getPosition(source).row - this.getPosition(destination).row) < 2;
            }
            if (result) {
                this.castlingBreak.push('2');
                this.castlingBreak.push('6');
            }
        }
        return result;
    },
    getAttackedFields: function(figure) {
        const field = this.getFigureField(figure);
        const position = this.getPosition(field);
        const color = figure >= 0 && figure < 16 || figure >= 32 && figure < 40 ? 'B' : 'W';
        
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
        if (figure == 4 || figure == 28) { // white or black king
            if (position.column == 0) {
                this.attackedFields.push(field - 8);
                this.attackedFields.push(field - 7);
                this.attackedFields.push(field + 1);
                this.attackedFields.push(field + 8);
                this.attackedFields.push(field + 9);
            }
            else if (position.column == 7) {
                this.attackedFields.push(field - 9);
                this.attackedFields.push(field - 8);
                this.attackedFields.push(field - 1);
                this.attackedFields.push(field + 7);
                this.attackedFields.push(field + 8);
            }
            else {
                this.attackedFields.push(field - 9);
                this.attackedFields.push(field - 8);
                this.attackedFields.push(field - 7);
                this.attackedFields.push(field - 1);
                this.attackedFields.push(field + 1);
                this.attackedFields.push(field + 7);
                this.attackedFields.push(field + 8);
                this.attackedFields.push(field + 9);
            }
        }
        if (figure == 0 || figure == 7 || figure == 24 || figure == 31) { // white or black rook
            for (var i = position.column - 1; i >= 0; i--) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1; i < 8; i++) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row - 1; i >= 0; i--) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row + 1; i < 8; i++) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
        }
        if (figure == 2 || figure == 5 || figure == 26 || figure == 29) { // white or black bishop
            for (var i = position.column - 1, j = position.row - 1; i >= 0 && j >= 0; i--, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row + 1; i < 8 && j < 8; i++, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row - 1; i < 8 && j >= 0; i++, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column - 1, j = position.row + 1; i >= 0 && j < 8; i--, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
        }
        if (figure == 3 || figure == 27 || figure >= 32 && figure < 48) { // white or black queen
            for (var i = position.column - 1; i >= 0; i--) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1; i < 8; i++) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row - 1; i >= 0; i--) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row + 1; i < 8; i++) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column - 1, j = position.row - 1; i >= 0 && j >= 0; i--, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row + 1; i < 8 && j < 8; i++, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row - 1; i < 8 && j >= 0; i++, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column - 1, j = position.row + 1; i >= 0 && j < 8; i--, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
        }
        if (figure == 1 || figure == 6 || figure == 25 || figure == 30) { // white or black knight
            if (position.row >= 2 && position.column >= 1) {
                this.attackedFields.push(this.getField(position.row - 2, position.column - 1));
            }
            if (position.row >= 2 && position.column < 7) {
                this.attackedFields.push(this.getField(position.row - 2, position.column + 1));
            }
            if (position.row >= 1 && position.column >= 2) {
                this.attackedFields.push(this.getField(position.row - 1, position.column - 2));
            }
            if (position.row >= 1 && position.column < 6) {
                this.attackedFields.push(this.getField(position.row - 1, position.column + 2));
            }
            if (position.row < 7 && position.column >= 2) {
                this.attackedFields.push(this.getField(position.row + 1, position.column - 2));
            }
            if (position.row < 7 && position.column < 6) {
                this.attackedFields.push(this.getField(position.row + 1, position.column + 2));
            }
            if (position.row < 6 && position.column >= 1) {
                this.attackedFields.push(this.getField(position.row + 2, position.column - 1));
            }
            if (position.row < 6 && position.column < 7) {
                this.attackedFields.push(this.getField(position.row + 2, position.column + 1));
            }
        }
    },
    isAttacked: function(fieldId) {
        return this.attackedFields.includes(parseInt(fieldId));
    },
    getProtectedFields: function(fieldId) {
        const position = this.getPosition(fieldId);
        for (var i = position.column - 1; i >= 0; i--) {
            const field = this.getField(position.row, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.column + 1; i < 8; i++) {
            const field = this.getField(position.row, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.row - 1; i >= 0; i--) {
            const field = this.getField(i, position.column);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.row + 1; i < 8; i++) {
            const field = this.getField(i, position.column);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.column - 1, j = position.row - 1; i >= 0 && j >= 0; i--, j--) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.column + 1, j = position.row + 1; i < 8 && j < 8; i++, j++) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.column + 1, j = position.row - 1; i < 8 && j >= 0; i++, j--) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
        for (var i = position.column - 1, j = position.row + 1; i >= 0 && j < 8; i--, j++) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (currentMove == player.WHITE && (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else if (currentMove == player.BLACK && (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48)) {
                this.protectedFields.push(fieldId);
                break;
            }
            else {
                break;
            }
        }
    },
    isProtected: function(fieldId) {
        return this.protectedFields.includes(fieldId);
    },
    getPotentialFields: function(figure) {
        const field = this.getFigureField(figure);
        const position = this.getPosition(field);
        const color = figure >= 0 && figure < 16 || figure >= 32 && figure < 40 ? 'B' : 'W';
        if (figure == 0 || figure == 7 || figure == 24 || figure == 31 || figure == 3 || figure == 27 || figure >= 32 && figure < 48) { // white or black rook and queen
            for (var i = position.column - 1; i >= 0; i--) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1; i < 8; i++) {
                const field = this.getField(position.row, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row - 1; i >= 0; i--) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.row + 1; i < 8; i++) {
                const field = this.getField(i, position.column);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
        }
        if (figure == 2 || figure == 5 || figure == 26 || figure == 29 || figure == 3 || figure == 27 || figure >= 32 && figure < 48) { // white or black bishop and queen
            for (var i = position.column - 1, j = position.row - 1; i >= 0 && j >= 0; i--, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row + 1; i < 8 && j < 8; i++, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column + 1, j = position.row - 1; i < 8 && j >= 0; i++, j--) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }
            for (var i = position.column - 1, j = position.row + 1; i >= 0 && j < 8; i--, j++) {
                const field = this.getField(j, i);
                if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1 || color == 'W' && this.fieldOccupancy[field] == 4 || color == 'B' && this.fieldOccupancy[field] == 28) {
                    this.attackedFields.push(field);
                }
                else {
                    break;
                }
            }    
        }
        if (figure == 1 || figure == 6 || figure == 25 || figure == 30) { // white or black knight
            if (position.row >= 2 && position.column >= 1) {
                this.attackedFields.push(this.getField(position.row - 2, position.column - 1));
            }
            if (position.row >= 2 && position.column < 7) {
                this.attackedFields.push(this.getField(position.row - 2, position.column + 1));
            }
            if (position.row >= 1 && position.column >= 2) {
                this.attackedFields.push(this.getField(position.row - 1, position.column - 2));
            }
            if (position.row >= 1 && position.column < 6) {
                this.attackedFields.push(this.getField(position.row - 1, position.column + 2));
            }
            if (position.row < 7 && position.column >= 2) {
                this.attackedFields.push(this.getField(position.row + 1, position.column - 2));
            }
            if (position.row < 7 && position.column < 6) {
                this.attackedFields.push(this.getField(position.row + 1, position.column + 2));
            }
            if (position.row < 6 && position.column >= 1) {
                this.attackedFields.push(this.getField(position.row + 2, position.column - 1));
            }
            if (position.row < 6 && position.column < 7) {
                this.attackedFields.push(this.getField(position.row + 2, position.column + 1));
            }
        }
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
    checkIsKingSafe: function(figureId, originId, fieldId, killId) {
        result = true;
        var kingId, kingFieldId;
        switch (currentMove) {
            case player.WHITE:
                kingId = 28;
                break;
            case player.BLACK:
                kingId = 4;
                break;
        }
        kingFieldId = this.getFigureField(kingId);
        if (killId == 4 || killId == 28) { // try to kill a king
            return false;
        }
        this.attackedFields = [];
        this.protectedFields = [];
        if (figureId == kingId) { // king is moving
            for (var i = 0; i < this.fieldOccupancy.length; i++) {
                if (currentMove == player.WHITE) {
                    if ((this.fieldOccupancy[i] >= 0 && this.fieldOccupancy[i] < 16 || this.fieldOccupancy[i] >= 32 && this.fieldOccupancy[i] < 40) && this.fieldOccupancy[i] != -1) {
                        this.getAttackedFields(this.fieldOccupancy[i]);
                    }
                }
                if (currentMove == player.BLACK) {
                    if ((this.fieldOccupancy[i] >= 16 && this.fieldOccupancy[i] < 32 || this.fieldOccupancy[i] >= 40 && this.fieldOccupancy[i] < 48) && this.fieldOccupancy[i] != -1) {
                        this.getAttackedFields(this.fieldOccupancy[i]);
                    }
                }
            }
            if (this.isAttacked(fieldId)) {
                return false;
            }
            this.getProtectedFields(fieldId);
            if (this.isProtected(fieldId)) {
                return false;
            }
        }
        else { // any other is moving
            const orig = { from: this.fieldOccupancy[originId], to: this.fieldOccupancy[fieldId] };
            this.fieldOccupancy[originId] = -1;
            this.fieldOccupancy[fieldId] = figureId;
            if (currentMove == player.WHITE) {
                for (var i = 0; i < 16; i++) {
                    this.getPotentialFields(i);
                }
                for (var i = 32; i < 40; i++) {
                    this.getPotentialFields(i);
                }
            }
            if (currentMove == player.BLACK) {
                for (var i = 16; i < 32; i++) {
                    this.getPotentialFields(i);
                }
                for (var i = 40; i < 48; i++) {
                    this.getPotentialFields(i);
                }
            }
            this.fieldOccupancy[originId] = orig.from;
            this.fieldOccupancy[fieldId] = orig.to;
            if (this.isAttacked(kingFieldId)) {
                return false;
            }
        }
        return result;
    },
    checkIsKingAttacked: function(origin, field) {
        const originId = parseInt(origin);
        const fieldId = parseInt(field);
        const figureId = this.fieldOccupancy[originId];
        var kingId, kingFieldId;
        switch (currentMove) {
            case player.WHITE:
                kingId = 4;
                break;
            case player.BLACK:
                kingId = 28;
                break;
        }
        kingFieldId = this.getFigureField(kingId);
        this.attackedFields = [];
        const orig = { from: this.fieldOccupancy[originId], to: this.fieldOccupancy[fieldId] };
        this.fieldOccupancy[originId] = -1;
        this.fieldOccupancy[fieldId] = figureId;
        for (var i = 0; i < this.fieldOccupancy.length; i++) {
            if (currentMove == player.WHITE) {
                if ((this.fieldOccupancy[i] >= 16 && this.fieldOccupancy[i] < 32 || this.fieldOccupancy[i] >= 40 && this.fieldOccupancy[i] < 48) && this.fieldOccupancy[i] != -1) {
                    this.getAttackedFields(this.fieldOccupancy[i]);
                }
            }
            if (currentMove == player.BLACK) {
                if ((this.fieldOccupancy[i] >= 0 && this.fieldOccupancy[i] < 16 || this.fieldOccupancy[i] >= 32 && this.fieldOccupancy[i] < 40) && this.fieldOccupancy[i] != -1) {
                    this.getAttackedFields(this.fieldOccupancy[i]);
                }
            }
        }
        this.fieldOccupancy[originId] = orig.from;
        this.fieldOccupancy[fieldId] = orig.to;
        if (this.isAttacked(kingFieldId)) {
            return kingFieldId;
        }
        return null;
    },
    isCastling: function(owner, source, destination) {
        var result = false;
        if (owner == 28) { // white
            if (source == 60 && destination == 62) { // short castling
                if (this.fieldOccupancy[61] == -1 && this.fieldOccupancy[62] == -1 && this.fieldOccupancy[63] == 31) {
                    this.castling = { figure: 31, origin: 63, field: 61 };
                    result = true;
                }
            }
            if (source == 60 && destination == 58) { // long castling
                if (this.fieldOccupancy[59] == -1 && this.fieldOccupancy[58] == -1 && this.fieldOccupancy[57] == -1 && this.fieldOccupancy[56] == 24) {
                    this.castling = { figure: 24, origin: 56, field: 59 };
                    result = true;
                }
            }
        }
        if (owner == 4) { // black
            if (source == 4 && destination == 6) { // short castling
                if (this.fieldOccupancy[5] == -1 && this.fieldOccupancy[6] == -1 && this.fieldOccupancy[7] == 7) {
                    this.castling = { figure: 7, origin: 7, field: 5 };
                    result = true;
                }
            }
            if (source == 4 && destination == 2) { // long castling
                if (this.fieldOccupancy[3] == -1 && this.fieldOccupancy[2] == -1 && this.fieldOccupancy[1] == -1 && this.fieldOccupancy[0] == 0) {
                    this.castling = { figure: 0, origin: 0, field: 3 };
                    result = true;
                }
            }
        }
        return result;
    },
    castlingAllowable: function(owner, source, destination) {
        var result = false;
        const field = parseInt(source) < parseInt(destination) ? parseInt(source) + 1 : parseInt(destination) + 1;
        if (owner == 28 && source == 60 || owner == 4 && source == 4) {
            result = !this.castlingBreak.includes(destination);
        }
        if (this.isAttacked(source)) {
            result = false;
        }
        if (this.isAttacked(destination)) {
            result = false;
        }
        if (this.isAttacked(field)) {
            result = false;
        }
        if (result) {
            this.castlingBreak.push(destination);
        }
        return result;
    },
    isPromotion: function(owner, destination) {
        var result = false;
        if (owner >= 8 && owner < 16) { // black pawn
            if (destination >= 56 && destination < 64) {
                this.promotion = { figure: parseInt(owner - 8) + 32, origin: parseInt(destination), field: parseInt(destination), kill: parseInt(owner) };
                result = true;
            }
        }
        if (owner >= 16 && owner < 24) { // white pawn
            if (destination >= 0 && destination < 8) {
                this.promotion = { figure: parseInt(owner - 8) + 32, origin: parseInt(destination), field: parseInt(destination), kill: parseInt(owner) };
                result = true;
            }
        }
        return result;
    },
};
