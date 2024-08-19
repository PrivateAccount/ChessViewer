const player = { WHITE: 1, BLACK: 2 };

var currentMove = null;

const rules = {
    fieldOccupancy: [],
    attackedFields: [],
    protectedFields: [],
    castlingBreak: [],
    castling: {},
    promotion: {},
    passant: {},
    passantReady: null,
    init: function() {
        currentMove = player.WHITE;
        this.castlingBreak = [];
        this.castling = { figure: null, origin: null, field: null };
        this.promotion = { figure: null, origin: null, field: null, kill: null };
        this.passant = { figure: null, origin: null, field: null, kill: null };
        this.passantReady = null;
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
        if (result) {
            result = this.checkMoveCorrectness(figureId, originId, fieldId, killId);
            if (result) {
                result = this.checkIsKingSafe(figureId, originId, fieldId, killId);
            }
        }
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
                result = owner >= 16 && owner < 32 || owner >= 40 && owner < 48;
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
                else if (this.passantReady == destination && source >= 24 && source < 32 && (source - destination == 7 || source - destination == 9)) {
                    result = this.fieldOccupancy[parseInt(destination) + 8] >= 8 && this.fieldOccupancy[parseInt(destination) + 8] < 16;
                }
                else {
                    result = source - destination == 8;
                }
            }
            else {
                if (kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                    result = (source - destination == 7 || source - destination == 9) && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
                }
            }
        }
        else if (owner >= 8 && owner < 16) { // black pawn
            if (kill == '--' || kill == '-1') {
                if (source >= 8 && source < 16) {
                    result = destination - source == 8 || destination - source == 16 && this.checkFreeFields(source, destination);
                }
                else if (this.passantReady == destination && source >= 32 && source < 40 && (destination - source == 7 || destination - source == 9)) {
                    result = this.fieldOccupancy[parseInt(destination) - 8] >= 16 && this.fieldOccupancy[parseInt(destination) - 8] < 24;
                }
                else {
                    result = destination - source == 8;
                }
            }
            else {
                if (kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                    result = (destination - source == 7 || destination - source == 9) && Math.abs(this.getPosition(source).column - this.getPosition(destination).column) == 1;
                }
            }
        }
        else if (owner == 24 || owner == 31) { // white rook
            if (kill == '--' || kill == '-1' || kill >= 0 && kill < 16 || kill >= 32 && kill < 40) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
            }
        }
        else if (owner == 0 || owner == 7) { // black rook
            if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                if (this.getPosition(source).column == this.getPosition(destination).column || this.getPosition(source).row == this.getPosition(destination).row) {
                    result = this.checkFreeFields(source, destination);
                }
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
        }
        else if (owner == 4) { // black king
            if (this.isCastling(owner, source, destination)) {
                result = this.castlingAllowable(owner, source, destination);
            }
            else if (kill == '--' || kill == '-1' || kill >= 16 && kill < 32 || kill >= 40 && kill < 48) {
                result = Math.abs(this.getPosition(source).column - this.getPosition(destination).column) < 2 && Math.abs(this.getPosition(source).row - this.getPosition(destination).row) < 2;
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
        for (var i = position.column - 1; i >= 0; i--) {
            const field = this.getField(position.row, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.column + 1; i < 8; i++) {
            const field = this.getField(position.row, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.row - 1; i >= 0; i--) {
            const field = this.getField(i, position.column);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.row + 1; i < 8; i++) {
            const field = this.getField(i, position.column);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy rook and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.column - 1, j = position.row - 1; i >= 0 && j >= 0; i--, j--) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.column + 1, j = position.row + 1; i < 8 && j < 8; i++, j++) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.column + 1, j = position.row - 1; i < 8 && j >= 0; i++, j--) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        for (var i = position.column - 1, j = position.row + 1; i >= 0 && j < 8; i--, j++) {
            const field = this.getField(j, i);
            if (this.fieldOccupancy[field] == undefined || this.fieldOccupancy[field] == -1) {
                continue;
            }
            else if (color == 'B') {
                if (this.fieldOccupancy[field] >= 0 && this.fieldOccupancy[field] < 16 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 24 || this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 28 || this.fieldOccupancy[field] == 30 || this.fieldOccupancy[field] == 31 || this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 26 || this.fieldOccupancy[field] == 29 || this.fieldOccupancy[field] == 27 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
            else if (color == 'W') {
                if (this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 32 || this.fieldOccupancy[field] >= 40 && this.fieldOccupancy[field] < 48) { // own
                    break;
                }
                else if (this.fieldOccupancy[field] == 0 || this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 4 || this.fieldOccupancy[field] == 6 || this.fieldOccupancy[field] == 7 || this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // not affecting
                    break;
                }
                else if (this.fieldOccupancy[field] == 2 || this.fieldOccupancy[field] == 5 || this.fieldOccupancy[field] == 3 || this.fieldOccupancy[field] >= 32 && this.fieldOccupancy[field] < 40) { // enemy bishop and queen
                    this.attackedFields.push(figure);
                    break;
                }
            }
        }
        const places = [
            { row: position.row - 2, column: position.column - 1 },
            { row: position.row - 2, column: position.column + 1 },
            { row: position.row - 1, column: position.column - 2 },
            { row: position.row - 1, column: position.column + 2 },
            { row: position.row + 1, column: position.column - 2 },
            { row: position.row + 1, column: position.column + 2 },
            { row: position.row + 2, column: position.column - 1 },
            { row: position.row + 2, column: position.column + 1 },
        ];
        for (var i = 0; i < places.length; i++) {
            const field = this.getField(places[i].row, places[i].column);
            if (color == 'B' && (this.fieldOccupancy[field] == 25 || this.fieldOccupancy[field] == 30)) { // white knight
                this.attackedFields.push(figure);
                break;
            }
            if (color == 'W' && (this.fieldOccupancy[field] == 1 || this.fieldOccupancy[field] == 6)) { // black knight
                this.attackedFields.push(figure);
                break;
            }
        }
        const pawns = [
            { row: position.row + 1, column: position.column - 1 },
            { row: position.row + 1, column: position.column + 1 },
            { row: position.row - 1, column: position.column - 1 },
            { row: position.row - 1, column: position.column + 1 },
        ];
        for (var i = 0; i < pawns.length; i++) {
            const field = this.getField(pawns[i].row, pawns[i].column);
            if (color == 'B' && i < 2 && this.fieldOccupancy[field] >= 16 && this.fieldOccupancy[field] < 24) { // white pawn
                this.attackedFields.push(figure);
                break;
            }
            if (color == 'W' && i >= 2 && this.fieldOccupancy[field] >= 8 && this.fieldOccupancy[field] < 16) { // black pawn
                this.attackedFields.push(figure);
                break;
            }
        }
    },
    checkIsKingSafe: function(figureId, originId, fieldId, killId) {
        var result = true;
        var kingId, kingFieldId, lastId;
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
            result = false;
        }
        this.attackedFields = [];
        this.protectedFields = [];
        if (figureId == kingId) { // king is moving
            lastId = this.fieldOccupancy[fieldId];
            if (killId >= 0) { // and killing
                this.fieldOccupancy[fieldId] = -1;
            }
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
            this.fieldOccupancy[fieldId] = lastId;
            if (this.isAttacked(fieldId)) {
                result = false;
            }
            this.getProtectedFields(fieldId);
            if (this.isProtected(fieldId)) {
                result = false;
            }
        }
        else { // any other is moving
            const orig = { from: this.fieldOccupancy[originId], to: this.fieldOccupancy[fieldId] };
            this.fieldOccupancy[originId] = -1;
            this.fieldOccupancy[fieldId] = figureId;
            this.getPotentialFields(kingId);
            this.fieldOccupancy[originId] = orig.from;
            this.fieldOccupancy[fieldId] = orig.to;
            if (this.isAttacked(kingId)) {
                result = false;
            }
        }
        return result;
    },
    checkIsKingAttacked: function(origin, field, figure) {
        const originId = parseInt(origin);
        const fieldId = parseInt(field);
        if (figure) {
            this.fieldOccupancy[originId] = figure;
        }
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
    checkMyKing: function(origin, field, figure) {
        const originId = parseInt(origin);
        const fieldId = parseInt(field);
        const figureId = parseInt(figure);
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
        this.attackedFields = [];
        this.fieldOccupancy[originId] = figureId;
        const orig = { from: this.fieldOccupancy[originId], to: this.fieldOccupancy[fieldId] };
        this.fieldOccupancy[originId] = -1;
        this.fieldOccupancy[fieldId] = figureId;
        for (var i = 0; i < this.fieldOccupancy.length; i++) {
            if (currentMove == player.BLACK) {
                if ((this.fieldOccupancy[i] >= 16 && this.fieldOccupancy[i] < 32 || this.fieldOccupancy[i] >= 40 && this.fieldOccupancy[i] < 48) && this.fieldOccupancy[i] != -1) {
                    this.getAttackedFields(this.fieldOccupancy[i]);
                }
            }
            if (currentMove == player.WHITE) {
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
    checkIsMate: function() {
        var result = false;
        var possibleMoves = [], counter = 0;
        if (currentMove == player.BLACK) {
            for (var i = 0; i < 40; i++) {
                if (i < 16 || i >= 32) {
                    if (this.fieldOccupancy.includes(i)) {
                        possibleMoves = this.getPossibleMoves(i, this.fieldOccupancy);
                        counter += possibleMoves.length;
                        result = counter == 0;
                    }
                }
            }
        }
        if (currentMove == player.WHITE) {
            for (var i = 16; i < 48; i++) {
                if (i < 32 || i >= 40) {
                    if (this.fieldOccupancy.includes(i)) {
                        possibleMoves = this.getPossibleMoves(i, this.fieldOccupancy);
                        counter += possibleMoves.length;
                        result = counter == 0;
                    }
                }
            }
        }
        return result;
    },
    getPossibleMoves: function(figure, fieldOccupancy) {
        var fields = [], potential = [];
        if (figure == 4) { // black king
            potential = [-9, -8, -7, -1, 1, 7, 8, 9];
            if (!this.castlingBreak.includes('2')) potential.push(-2);
            if (!this.castlingBreak.includes('6')) potential.push(2);
        }
        if (figure == 28) { // white king
            potential = [-9, -8, -7, -1, 1, 7, 8, 9];
            if (!this.castlingBreak.includes('58')) potential.push(-2);
            if (!this.castlingBreak.includes('62')) potential.push(2);
        }
        if (figure == 1 || figure == 6 || figure == 25 || figure == 30) { // black or white knight
            potential = [-17, -15, -10, -6, 6, 10, 15, 17];
        }
        if (figure == 0 || figure == 7 || figure == 24 || figure == 31) { // black or white rook
            potential = [-8, -16, -24, -32, -40, -48, -56, 8, 16, 24, 32, 40, 48, 56, -1, -2, -3, -4, -5, -6, -7, 1, 2, 3, 4, 5, 6, 7];
        }
        if (figure == 2 || figure == 5 || figure == 26 || figure == 29) { // black or white bishop
            potential = [-9, -18, -27, -36, -45, -54, -63, 9, 18, 27, 36, 45, 54, 63, -7, -14, -21, -28, -35, -42, -49, 7, 14, 21, 28, 35, 42, 49];
        }
        if (figure == 3 || figure == 27 || figure >= 32 && figure < 48) { // black or white queen plus promoted
            potential = [-8, -16, -24, -32, -40, -48, -56, 8, 16, 24, 32, 40, 48, 56, -1, -2, -3, -4, -5, -6, -7, 1, 2, 3, 4, 5, 6, 7, -9, -18, -27, -36, -45, -54, -63, 9, 18, 27, 36, 45, 54, 63, -7, -14, -21, -28, -35, -42, -49, 7, 14, 21, 28, 35, 42, 49];
        }
        if (figure >= 8 && figure < 16) { // black pawn
            if (this.getPosition(this.getFigureField(figure)).column == 0) potential = [8, 9, 16];
            else if (this.getPosition(this.getFigureField(figure)).column == 7) potential = [7, 8, 16];
            else potential = [7, 8, 9, 16];
        }
        if (figure >= 16 && figure < 24) { // white pawn
            if (this.getPosition(this.getFigureField(figure)).column == 0) potential = [-7, -8, -16];
            else if (this.getPosition(this.getFigureField(figure)).column == 7) potential = [-8, -9, -16];
            else potential = [-7, -8, -9, -16];
        }
        this.fieldOccupancy = fieldOccupancy;
        for (var i = 0; i < potential.length; i++) {
            const examine = this.getFigureField(figure) + potential[i];
            const target = this.fieldOccupancy[examine] == undefined ? -1 : this.fieldOccupancy[examine];
            const kill = examine >= 0 && examine < 64 ? target : -1;
            var result = false;
            result = this.checkMoveCorrectness(figure, this.getFigureField(figure), examine, kill);
            if (result) {
                result = this.checkIsKingSafe(figure, this.getFigureField(figure), examine, kill);
                if (result && examine >= 0 && examine < 64) {
                    fields.push(examine);
                }
            }
        }
        return fields;
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
            result = !this.castlingBreak.includes(source) || !this.castlingBreak.includes(destination);
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
        return result;
    },
    registerCastling: function(figure) {
        if (figure == 4) { // black king
            if (!this.castlingBreak.includes('2')) this.castlingBreak.push('2');
            if (!this.castlingBreak.includes('4')) this.castlingBreak.push('4');
            if (!this.castlingBreak.includes('6')) this.castlingBreak.push('6');
        }
        if (figure == 28) { // white king
            if (!this.castlingBreak.includes('58')) this.castlingBreak.push('58');
            if (!this.castlingBreak.includes('60')) this.castlingBreak.push('60');
            if (!this.castlingBreak.includes('62')) this.castlingBreak.push('62');
        }
        if (figure == 0) { // black rook
            if (!this.castlingBreak.includes('2')) this.castlingBreak.push('2');
            if (!this.castlingBreak.includes('4')) this.castlingBreak.push('4');
        }
        if (figure == 7) { // black rook
            if (!this.castlingBreak.includes('4')) this.castlingBreak.push('4');
            if (!this.castlingBreak.includes('6')) this.castlingBreak.push('6');
        }
        if (figure == 24) { // white rook
            if (!this.castlingBreak.includes('58')) this.castlingBreak.push('58');
            if (!this.castlingBreak.includes('60')) this.castlingBreak.push('60');
        }
        if (figure == 31) { // white rook
            if (!this.castlingBreak.includes('60')) this.castlingBreak.push('60');
            if (!this.castlingBreak.includes('62')) this.castlingBreak.push('62');
        }
    },
    undoCastling: function(owner, source, destination) {
        if (owner == 28) { // white
            if (source == 60 && (destination == 62 || destination == 58)) { // short and long castling
                for (var i = 0; i < this.castlingBreak.length; i++) {
                    if (this.castlingBreak[i] == '62' || this.castlingBreak[i] == '58') {
                        this.castlingBreak[i] = null;
                    }
                }
            }
        }
        if (owner == 4) { // black
            if (source == 4 && (destination == 6 || destination == 2)) { // short and long castling
                for (var i = 0; i < this.castlingBreak.length; i++) {
                    if (this.castlingBreak[i] == '6' || this.castlingBreak[i] == '2') {
                        this.castlingBreak[i] = null;
                    }
                }
            }
        }
    },
    clearCastling: function(moveSequence) {
        var found = [];
        for (var i = 0; i < moveSequence.length; i++) {
            if (moveSequence[i].figure == 0 || moveSequence[i].figure == 7 || moveSequence[i].figure == 4 || moveSequence[i].figure == 24 || moveSequence[i].figure == 31 || moveSequence[i].figure == 28) {
                found.push(moveSequence[i].figure);
            }
        }
        for (var i = 0; i < this.castlingBreak.length; i++) {
            if (!found.includes(0) && !found.includes(4)) {
                if (this.castlingBreak[i] == '2' || this.castlingBreak[i] == '4') {
                    this.castlingBreak[i] = null;
                }
            }
            if (!found.includes(7) && !found.includes(4)) {
                if (this.castlingBreak[i] == '6' || this.castlingBreak[i] == '4') {
                    this.castlingBreak[i] = null;
                }
            }
            if (!found.includes(24) && !found.includes(28)) {
                if (this.castlingBreak[i] == '58' || this.castlingBreak[i] == '60') {
                    this.castlingBreak[i] = null;
                }
            }
            if (!found.includes(31) && !found.includes(28)) {
                if (this.castlingBreak[i] == '62' || this.castlingBreak[i] == '60') {
                    this.castlingBreak[i] = null;
                }
            }
        }
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
        if (result) {
            this.fieldOccupancy[destination] = parseInt(owner - 8) + 32;
        }
        return result;
    },
    isPassant: function(owner, source, destination) {
        var result = false;
        if (!this.fieldOccupancy[parseInt(destination)]) {
            if (owner >= 8 && owner < 16) { // black pawn
                if (source >= 32 && source < 40 && this.fieldOccupancy[parseInt(destination) - 8] >= 16 && this.fieldOccupancy[parseInt(destination) - 8] < 24) {
                    this.passant = { figure: parseInt(owner), origin: parseInt(source), field: parseInt(destination), kill: this.fieldOccupancy[parseInt(destination) - 8] };
                    this.fieldOccupancy[parseInt(destination) - 8] = -1;
                    result = true;
                }
            }
            if (owner >= 16 && owner < 24) { // white pawn
                if (source >= 24 && source < 32 && this.fieldOccupancy[parseInt(destination) + 8] >= 8 && this.fieldOccupancy[parseInt(destination) + 8] < 16) {
                    this.passant = { figure: parseInt(owner), origin: parseInt(source), field: parseInt(destination), kill: this.fieldOccupancy[parseInt(destination) + 8] };
                    this.fieldOccupancy[parseInt(destination) + 8] = -1;
                    result = true;
                }
            }
        }
        return result;
    },
    setPassantReady: function(moveSequence, sequenceId) {
        const owner = moveSequence[sequenceId - 1].figure;
        const source = moveSequence[sequenceId - 1].origin;
        const destination = moveSequence[sequenceId - 1].field;
        this.passantReady = null;
        if (owner >= 8 && owner < 16) { // black pawn
            if (destination - source == 16 && this.checkFreeFields(source, destination)) {
                this.passantReady = destination - 8;
            }
        }
        if (owner >= 16 && owner < 24) { // white pawn
            if (source - destination == 16 && this.checkFreeFields(source, destination)) {
                this.passantReady = destination + 8;
            }
        }
    },
    getCurrentMove: function(moveSequence, sequenceId) {
        if (sequenceId > 0 && sequenceId <= moveSequence.length) {
            this.setPassantReady(moveSequence, sequenceId);
            const owner = moveSequence[sequenceId - 1].figure;
            if (owner >= 16 && owner < 32 || owner >= 40 && owner < 48) {
                return player.BLACK;
            }
            else {
                return player.WHITE;
            }
        }
        else {
            return player.WHITE;
        }
    },
};
