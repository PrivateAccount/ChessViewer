window.onload = function() {
    
    const BOARD_SIZE = 8;
    const FIELD_SIZE = 99;
    const BORDER_WIDTH = 5;
    const labelsHorizontal = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const labelsVertical = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const figureImages = [
        'black-queen',
        'black-king',
        'black-knight',
        'black-rook',
        'black-bishop',
        'black-pawn',
        'white-queen',
        'white-king',
        'white-knight',
        'white-rook',
        'white-bishop',
        'white-pawn',
    ];
    const figureIndexes = [3, 2, 4, 0, 1, 4, 2, 3, 5, 5, 5, 5, 5, 5, 5, 5, 11, 11, 11, 11, 11, 11, 11, 11, 9, 8, 10, 6, 7, 10, 8, 9];
    const steps = 20;

    var fieldPositions = [];
    var fieldOccupancy = [];
    var figurePositions = [];
    var moveSequence = [];
    var sequenceId = 0;
    var selection = [];
    var promotions = [];
    var readOnlyMode = false;
    var stopRun = false;
    var editPositionMode = false;
    var deletePositionMode = false;
    var markMoves = true;
    var stopDemo = false;
    var playUserMode = false;

    const fields = document.getElementById('fields');
    const msg = document.getElementById('msg');
    const status = document.getElementById('status');

    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const swap = Math.floor(i / BOARD_SIZE) % 2 == 0;
        const field = document.createElement('div');
        field.id = 'field-' + i.toString();
        field.classList.add('field');
        if (swap) field.classList.add(i % 2 ? 'dark' : 'light');
        else field.classList.add(i % 2 ? 'light' : 'dark');
        field.addEventListener('click', function() {
            markSelection(field.id, 'field');
        });
        if (i < 2 * BOARD_SIZE) {
            fieldOccupancy[i] = i;
        }
        if (i >= 6 * BOARD_SIZE) {
            fieldOccupancy[i] = i - 4 * BOARD_SIZE;
        }
        fields.appendChild(field);
        const x = Math.floor(i % BOARD_SIZE) * FIELD_SIZE + BORDER_WIDTH;
        const y = Math.floor(i / BOARD_SIZE) * FIELD_SIZE + BORDER_WIDTH;
        fieldPositions.push({ x: x, y: y });
    }

    const labelsTop = document.getElementById('labels-top');
    const labelsBottom = document.getElementById('labels-bottom');
    const labelsLeft = document.getElementById('labels-left');
    const labelsRight = document.getElementById('labels-right');

    for (var i = 0; i < BOARD_SIZE; i++) {
        const label = document.createElement('span');
        label.classList.add('horizontal');
        label.innerText = labelsHorizontal[i];
        labelsTop.appendChild(label);
    }
    for (var i = 0; i < BOARD_SIZE; i++) {
        const label = document.createElement('span');
        label.classList.add('horizontal');
        label.innerText = labelsHorizontal[i];
        labelsBottom.appendChild(label);
    }
    for (var i = BOARD_SIZE - 1; i >= 0; i--) {
        const label = document.createElement('span');
        label.classList.add('vertical');
        label.innerText = labelsVertical[i];
        labelsLeft.appendChild(label);
    }
    for (var i = BOARD_SIZE - 1; i >= 0; i--) {
        const label = document.createElement('span');
        label.classList.add('vertical');
        label.innerText = labelsVertical[i];
        labelsRight.appendChild(label);
    }

    const figures = document.getElementById('figures');

    for (var i = 0; i < 4 * BOARD_SIZE; i++) {
        const figure = document.createElement('img');
        figure.id = 'figure-' + i.toString();
        figure.classList.add('figure');
        figure.src = 'img/' + figureImages[figureIndexes[i]] + '.png';
        if (i < 2 * BOARD_SIZE) {
            figure.style.left = fieldPositions[i].x + 'px';
            figure.style.top = fieldPositions[i].y + 'px';
            figurePositions[i] = i;
        }
        else {
            figure.style.left = fieldPositions[i + 4 * BOARD_SIZE].x + 'px';
            figure.style.top = fieldPositions[i + 4 * BOARD_SIZE].y + 'px';
            figurePositions[i] = i + 4 * BOARD_SIZE;
        }
        figure.addEventListener('click', function() {
            markSelection(figure.id, 'figure');
        });
        figures.appendChild(figure);
    }

    for (var i = 0; i < 2 * BOARD_SIZE; i++) {
        const figure = document.createElement('img');
        figure.id = 'figure-' + (i + 32).toString();
        figure.classList.add('figure');
        figure.src = 'img/' + figureImages[i < BOARD_SIZE ? 0 : 6] + '.png';
        figure.style.left = fieldPositions[i + 3 * BOARD_SIZE].x + 'px';
        figure.style.top = fieldPositions[i + 3 * BOARD_SIZE].y + 'px';
        figure.style.display = 'none';
        figurePositions[i + 4 * BOARD_SIZE] = i + 3 * BOARD_SIZE;
        figure.addEventListener('click', function() {
            markSelection(figure.id, 'figure');
        });
        figures.appendChild(figure);
    }

    const runForwardButton = document.getElementById('run-forward');
    runForwardButton.addEventListener('click', function() {
        runForwardButton.disabled = true;
        if (sequenceId < moveSequence.length && moveSequence[sequenceId]) {
            moveFigure(moveSequence[sequenceId].figure, fieldPositions[moveSequence[sequenceId].field], steps, 0, function() {
                if (moveSequence[sequenceId]) {
                    removeFigure(moveSequence[sequenceId].kill);
                }
                sequenceId++;
                updateCounter();
                runForwardButton.disabled = sequenceId == moveSequence.length;
                runBackwardButton.disabled = sequenceId == 0;
                clearSelection();
                updatePromotions('show');
                selectStep(sequenceId);
            });
            fieldOccupancy[moveSequence[sequenceId].origin] = -1;
            fieldOccupancy[moveSequence[sequenceId].field] = moveSequence[sequenceId].figure;
            figurePositions[moveSequence[sequenceId].figure] = moveSequence[sequenceId].field;
        }
    });

    const runBackwardButton = document.getElementById('run-backward');
    runBackwardButton.addEventListener('click', function() {
        runBackwardButton.disabled = true;
        if (sequenceId > 0 && moveSequence[sequenceId - 1]) {
            moveFigure(moveSequence[sequenceId - 1].figure, fieldPositions[moveSequence[sequenceId - 1].origin], steps, 0, function() {
                if (moveSequence[sequenceId - 1]) {
                    restoreFigure(moveSequence[sequenceId - 1].kill);
                }
                sequenceId--;
                updateCounter();
                runForwardButton.disabled = sequenceId == moveSequence.length;
                runBackwardButton.disabled = sequenceId == 0;
                clearSelection();
                updatePromotions('hide');
                selectStep(sequenceId);
            });
            fieldOccupancy[moveSequence[sequenceId - 1].origin] = moveSequence[sequenceId - 1].figure;
            fieldOccupancy[moveSequence[sequenceId - 1].field] = moveSequence[sequenceId - 1].kill;
            figurePositions[moveSequence[sequenceId - 1].figure] = moveSequence[sequenceId - 1].origin;
        }
    });

    const runLastButton = document.getElementById('run-last');
    runLastButton.addEventListener('click', function() {
        runFirstButton.disabled = true;
        runLastButton.disabled = true;
        buttonNew.disabled = true;
        buttonOpen.disabled = true;
        stopRun = false;
        goForward(sequenceId, moveSequence.length, function() {
            runFirstButton.disabled = false;
            runLastButton.disabled = false;
            buttonNew.disabled = false;
            buttonOpen.disabled = false;
            currentMove = rules.getCurrentMove(moveSequence, sequenceId);
            updateColor();
        });
    });

    function goForward(step, steps, callback) {
        const delay = 500;
        if (step < steps && !stopRun) {
            runForwardButton.click();
            setTimeout(function() {
                goForward(step + 1, steps, callback);
            }, delay);
        }
        else {
            callback();
        }
    }

    const runFirstButton = document.getElementById('run-first');
    runFirstButton.addEventListener('click', function() {
        runFirstButton.disabled = true;
        runLastButton.disabled = true;
        buttonNew.disabled = true;
        buttonOpen.disabled = true;
        stopRun = false;
        goBackward(sequenceId, 0, function() {
            runFirstButton.disabled = false;
            runLastButton.disabled = false;
            buttonNew.disabled = false;
            buttonOpen.disabled = false;
            currentMove = rules.getCurrentMove(moveSequence, sequenceId);
            updateColor();
        });
    });

    function goBackward(step, steps, callback) {
        const delay = 500;
        if (step > steps && !stopRun) {
            runBackwardButton.click();
            setTimeout(function() {
                goBackward(step - 1, steps, callback);
            }, delay);
        }
        else {
            callback();
        }
    }

    function moveFigure(idx, position, steps, step, callback) {
        const dt = 10;
        const figure = document.getElementById('figure-' + idx);
        const posX = parseInt(figure.style.left);
        const posY = parseInt(figure.style.top);
        const dx = (position.x - posX) / (steps - step);
        const dy = (position.y - posY) / (steps - step);
        figure.style.left = (posX + dx).toString() + 'px';
        figure.style.top = (posY + dy).toString() + 'px';
        if (step < steps) {
            setTimeout(function() {
                moveFigure(idx, position, steps, step + 1, callback);
            }, dt);
        }
        else {
            callback();
        }
    }

    function removeFigure(idx) {
        const figure = document.getElementById('figure-' + idx);
        if (figure) {
            figure.style.display = 'none';
        }
    }

    function restoreFigure(idx) {
        const figure = document.getElementById('figure-' + idx);
        if (figure) {
            figure.style.display = 'inline';
        }
    }

    function updateCounter() {
        const stepId = document.getElementById('step-id');
        stepId.innerText = sequenceId.toString() + ' of ' + moveSequence.length.toString();
    }

    function updateColor() {
        const move = document.getElementById('move');
        move.classList.remove('white', 'black');
        move.classList.add(currentMove == player.WHITE ? 'white' : 'black');
    }

    function markSelection(ownerId, kind) {
        const delay = 1000, mate = 1500;
        const figureId = document.getElementById('figure-id');
        const originId = document.getElementById('origin-id');
        const fieldId = document.getElementById('field-id');
        const killId = document.getElementById('kill-id');
        var pieceId, placeId;
        if (kind == 'field') {
            const id = parseInt(ownerId.replace('field-', ''));
            pieceId = fieldOccupancy[id] != undefined ? 'figure-' + fieldOccupancy[id].toString() : '--';
            placeId = ownerId;
        }
        if (kind == 'figure') {
            const id = parseInt(ownerId.replace('figure-', ''));
            pieceId = 'figure-' + id.toString();
            placeId = 'field-' + figurePositions[id].toString();
        }
        if (!readOnlyMode && !editPositionMode && !deletePositionMode && sequenceId == moveSequence.length) {
            if (selection.length == 0) {
                if (pieceId != '--' && pieceId != '-1' && pieceId != 'figure--1') {
                    figureId.innerText = pieceId.replace('figure-', '');
                    originId.innerText = placeId.replace('field-', '');
                    if (rules.checkMoveOrder(parseInt(figureId.innerText))) {
                        document.getElementById(placeId).classList.add('selected');
                        selection.push(placeId);
                        buttonEdit.disabled = true;
                        if (markMoves) {
                            const possibleMoves = rules.getPossibleMoves(figureId.innerText, fieldOccupancy);
                            for (var i = 0; i < possibleMoves.length; i++) {
                                document.getElementById('field-' + possibleMoves[i].toString()).classList.add('free');
                            }
                        }
                    }
                }
            }
            else if (selection.length == 1) {
                if (placeId != selection[0]) {
                    document.getElementById(placeId).classList.add('selected');
                    selection.push(placeId);
                    buttonEdit.disabled = false;
                    fieldId.innerText = placeId.replace('field-', '');
                    killId.innerText = pieceId.replace('figure-', '');
                    if (rules.checkIsLegalMove(figureId, originId, fieldId, killId, fieldOccupancy)) {
                        registerMove();
                        if (rules.isCastling(figureId.innerText, originId.innerText, fieldId.innerText)) {
                            registerCastling();
                        }
                        if (rules.isPromotion(figureId.innerText, fieldId.innerText)) {
                            registerPromotion();
                        }
                        if (rules.isPassant(figureId.innerText, originId.innerText, fieldId.innerText)) {
                            registerPassant();
                        }
                        currentMove = currentMove == player.WHITE ? player.BLACK : player.WHITE;
                        buttonSend.disabled = readOnlyMode;
                        msg.innerText = 'Moving...';
                    }
                    else {
                        for (var i = 0; i < selection.length; i++) {
                            document.getElementById(selection[i]).classList.add('failed');
                        }
                        const kingId = rules.checkMyKing(originId.innerText, fieldId.innerText, figureId.innerText);
                        if (kingId) {
                            document.getElementById('field-' + kingId.toString()).classList.add('check');
                        }
                        msg.innerText = 'Illegal move.';
                        setTimeout(function() {
                            buttonReset.click();
                        }, delay);
                    }
                    setTimeout(function() {
                        if (rules.checkIsMate()) {
                            const kingField = currentMove == player.WHITE ? rules.getFigureField(28) : rules.getFigureField(4);
                            document.getElementById('field-' + kingField).classList.add('debug');
                            msg.innerText = 'Check mate.';
                        }
                    }, mate);
                }
            }
        }
        if (!readOnlyMode && editPositionMode && sequenceId == moveSequence.length) {
            if (selection.length == 0) {
                if (pieceId != '--' && pieceId != '-1' && pieceId != 'figure--1') {
                    figureId.innerText = pieceId.replace('figure-', '');
                    originId.innerText = placeId.replace('field-', '');
                    document.getElementById(placeId).classList.add('selected');
                    selection.push(placeId);
                }
            }
            else if (selection.length == 1) {
                if (placeId != selection[0]) {
                    document.getElementById(placeId).classList.add('selected');
                    selection.push(placeId);
                    fieldId.innerText = placeId.replace('field-', '');
                    killId.innerText = pieceId.replace('figure-', '');
                    if (killId.innerText != 4 && killId.innerText != 28) {
                        registerMove();
                    }
                    else {
                        for (var i = 0; i < selection.length; i++) {
                            document.getElementById(selection[i]).classList.add('failed');
                        }
                        setTimeout(function() {
                            buttonReset.click();
                        }, delay);
                    }
                }
            }
        }
        if (!readOnlyMode && deletePositionMode && sequenceId == moveSequence.length) {
            if (pieceId != '--' && pieceId != '-1' && pieceId != 'figure--1') {
                figureId.innerText = pieceId.replace('figure-', '');
                originId.innerText = placeId.replace('field-', '');
                if (figureId.innerText != 4 && figureId.innerText != 28) {
                    removeFigure(parseInt(figureId.innerText));
                    fieldOccupancy[parseInt(originId.innerText)] = -1;
                }
                else {
                    document.getElementById(placeId).classList.add('failed');
                    setTimeout(function() {
                        buttonReset.click();
                    }, delay);
                }
            }
        }
    }

    function getFieldName(id) {
        const col = Math.floor(parseInt(id) % BOARD_SIZE);
        const row = BOARD_SIZE - Math.floor(parseInt(id) / BOARD_SIZE) - 1;
        return labelsHorizontal[col] + labelsVertical[row];
    }

    function getFigureName(id) {
        var idx;
        if (parseInt(id) == 0 || parseInt(id) == 7) {
            idx = 3;
        }
        if (parseInt(id) == 1 || parseInt(id) == 6) {
            idx = 2;
        }
        if (parseInt(id) == 2 || parseInt(id) == 5) {
            idx = 4;
        }
        if (parseInt(id) == 3 || parseInt(id) >= 32 && parseInt(id) < 40) {
            idx = 0;
        }
        if (parseInt(id) == 4) {
            idx = 1;
        }
        if (parseInt(id) >= 8 && parseInt(id) < 16) {
            idx = 5;
        }
        if (parseInt(id) == 24 || parseInt(id) == 31) {
            idx = 9;
        }
        if (parseInt(id) == 25 || parseInt(id) == 30) {
            idx = 8;
        }
        if (parseInt(id) == 26 || parseInt(id) == 29) {
            idx = 10;
        }
        if (parseInt(id) == 27 || parseInt(id) >= 40 && parseInt(id) < 48) {
            idx = 6;
        }
        if (parseInt(id) == 28) {
            idx = 7;
        }
        if (parseInt(id) >= 16 && parseInt(id) < 24) {
            idx = 11;
        }
        return figureImages[idx];
    }

    function clearSelection() {
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            const field = 'field-' + i.toString();
            document.getElementById(field).classList.remove('selected', 'failed', 'check', 'debug', 'free');
        }
        selection = [];
    }

    function updatePromotions(mode) {
        if (mode == 'hide') {
            if (promotions[sequenceId - 1]) {
                removeFigure(promotions[sequenceId - 1]);
            }
        }
        if (mode == 'show') {
            if (promotions[sequenceId - 2]) {
                restoreFigure(promotions[sequenceId - 2]);
            }
        }
    }

    function loadPromotions() {
        promotions = [];
        for (var i = 0; i < moveSequence.length; i++) {
            if (moveSequence[i].figure >= 32 && moveSequence[i].figure < 48) {
                if (!promotions.includes(moveSequence[i].figure)) {
                    promotions[i - 1] = moveSequence[i].figure;
                }
            }
        }
    }

    function registerMove() {
        const delay = 500;
        const figure = document.getElementById('figure-id').innerText;
        const origin = document.getElementById('origin-id').innerText;
        const field = document.getElementById('field-id').innerText;
        const kill = document.getElementById('kill-id').innerText;
        if (figure == '--' || origin == '--' || field == '--') return;
        const moveParams = { figure: parseInt(figure), origin: parseInt(origin), field: parseInt(field), kill: parseInt(kill) };
        moveSequence.push(moveParams);
        setTimeout(function() {
            runForwardButton.disabled = false;
            runForwardButton.click();
            buttonReset.click();
            updateColor();
            noteStep(sequenceId);
            if (playUserMode) {
                makePlayMoves();
            }
        }, delay);
        rules.registerCastling(moveParams.figure);
        const kingId = rules.checkIsKingAttacked(origin, field, null);
        if (kingId) {
            document.getElementById('field-' + kingId.toString()).classList.add('check');
        }
    }

    function registerCastling() {
        const delay = 1000;
        const castlingParams = { figure: rules.castling.figure, origin: rules.castling.origin, field: rules.castling.field, kill: null };
        moveSequence.push(castlingParams);
        setTimeout(function() {
            markSelection('figure-' + rules.castling.figure, 'figure');
            markSelection('field-' + rules.castling.field, 'field');
            runForwardButton.disabled = false;
            runForwardButton.click();
            buttonReset.click();
            noteStep(sequenceId);
        }, delay);
        const kingId = rules.checkIsKingAttacked(rules.castling.origin, rules.castling.field, null);
        if (kingId) {
            document.getElementById('field-' + kingId.toString()).classList.add('check');
        }
    }

    function registerPromotion() {
        const delay = 1000;
        const origin = document.getElementById('origin-id').innerText;
        const field = document.getElementById('field-id').innerText;
        const orig = document.getElementById('figure-' + rules.promotion.kill);
        const figure = document.getElementById('figure-' + rules.promotion.figure);
        const promotionParams = { figure: rules.promotion.figure, origin: rules.promotion.origin, field: rules.promotion.field, kill: rules.promotion.kill };
        moveSequence.push(promotionParams);
        promotions[sequenceId] = rules.promotion.figure;
        setTimeout(function() {
            removeFigure(rules.promotion.kill);
            figure.style.left = orig.style.left;
            figure.style.top = orig.style.top;
            restoreFigure(rules.promotion.figure);
            runForwardButton.disabled = false;
            runForwardButton.click();
            buttonReset.click();
            noteStep(sequenceId);
        }, delay);
        const kingId = rules.checkIsKingAttacked(origin, field, rules.promotion.figure);
        if (kingId) {
            document.getElementById('field-' + kingId.toString()).classList.add('check');
        }
    }

    function registerPassant() {
        const delay = 1000;
        const origin = document.getElementById('origin-id').innerText;
        const field = document.getElementById('field-id').innerText;
        moveSequence[sequenceId].kill = rules.passant.kill;
        setTimeout(function() {
            runForwardButton.disabled = false;
            runForwardButton.click();
            buttonReset.click();
        }, delay);
        const kingId = rules.checkIsKingAttacked(origin, field, rules.passant.figure);
        if (kingId) {
            document.getElementById('field-' + kingId.toString()).classList.add('check');
        }
    }

    function noteStep(id) {
        const itemHeight = 26, pageLength = 17;
        const parentElement = document.getElementById('games');
        const item = document.createElement('div');
        item.id = 'step-' + id.toString();
        item.className = 'step';
        item.innerHTML = moveSequence[id] ? '<span class="lp">' + (id + 1).toString() + '</span><span class="val">' + moveSequence[id].figure + '</span><span class="val">' + moveSequence[id].origin + '</span><span class="val">' + moveSequence[id].field + '</span><span class="val">' + moveSequence[id].kill + '</span>' : '-';
        item.addEventListener('click', function() {
            stopRun = false;
            buttonNew.disabled = true;
            buttonOpen.disabled = true;
            const id = parseInt(item.id.replace('step-', '')) + 1;
            if (id < sequenceId) {
                goBackward(sequenceId, id, function() {
                    buttonNew.disabled = false;
                    buttonOpen.disabled = false;
                });
            }
            if (id > sequenceId) {
                goForward(sequenceId, id, function() {
                    buttonNew.disabled = false;
                    buttonOpen.disabled = false;
                });
            }
        });
        parentElement.appendChild(item);
        parentElement.scrollTop = id > pageLength ? (id - pageLength) * itemHeight : 0;
    }

    function selectStep(id) {
        const figureId = document.getElementById('figure-id');
        const originId = document.getElementById('origin-id');
        const fieldId = document.getElementById('field-id');
        const killId = document.getElementById('kill-id');
        const parentElement = document.getElementById('games');
        var items = parentElement.children;
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('selected');
        }
        const element = document.getElementById('step-' + (id - 1).toString());
        if (element) {
            element.classList.add('selected');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        currentMove = rules.getCurrentMove(moveSequence, sequenceId);
        buttonUndo.disabled = id != moveSequence.length;
        buttonEdit.disabled = id != moveSequence.length;
        buttonDelete.disabled = id != moveSequence.length;
        if (moveSequence[sequenceId - 1]) {
            figureId.innerText = sequenceId ? moveSequence[sequenceId - 1].figure : '--';
            originId.innerText = sequenceId ? moveSequence[sequenceId - 1].origin : '--';
            fieldId.innerText = sequenceId ? moveSequence[sequenceId - 1].field : '--';
            killId.innerText = sequenceId ? moveSequence[sequenceId - 1].kill : '--';
            msg.innerText = sequenceId ? sequenceId.toString() + '. ' + getFigureName(moveSequence[sequenceId - 1].figure) + ': ' + getFieldName(moveSequence[sequenceId - 1].origin) + ' - ' + getFieldName(moveSequence[sequenceId - 1].field) : '';
        }
        updateColor();
    }

    const buttonNew = document.getElementById('new');
    buttonNew.addEventListener('click', function() {
        msg.innerText = 'New game ready.';
        status.innerText = '';
        fieldOccupancy = [];
        fieldPositions = [];
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            if (i < 2 * BOARD_SIZE) {
                fieldOccupancy[i] = i;
            }
            if (i >= 6 * BOARD_SIZE) {
                fieldOccupancy[i] = i - 4 * BOARD_SIZE;
            }
            const x = Math.floor(i % BOARD_SIZE) * FIELD_SIZE + BORDER_WIDTH;
            const y = Math.floor(i / BOARD_SIZE) * FIELD_SIZE + BORDER_WIDTH;
            fieldPositions.push({ x: x, y: y });
        }
        for (var i = 0; i < 4 * BOARD_SIZE; i++) {
            const figure = document.getElementById('figure-' + i.toString());
            if (i < 2 * BOARD_SIZE) {
                figure.style.left = fieldPositions[i].x + 'px';
                figure.style.top = fieldPositions[i].y + 'px';
                figurePositions[i] = i;
            }
            else {
                figure.style.left = fieldPositions[i + 4 * BOARD_SIZE].x + 'px';
                figure.style.top = fieldPositions[i + 4 * BOARD_SIZE].y + 'px';
                figurePositions[i] = i + 4 * BOARD_SIZE;
            }
            figure.style.display = 'inline';
        }
        for (var i = 0; i < 2 * BOARD_SIZE; i++) {
            removeFigure(i + 32);
        }
        const parentElement = document.getElementById('games');
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild);
        }
        promotions = [];
        moveSequence = [];
        sequenceId = 0;
        stopRun = true;
        stopDemo = true;
        playUserMode = false;
        updateCounter();
        buttonReset.click();
        buttonCancel.click();
        runForwardButton.disabled = false;
        runBackwardButton.disabled = false;
        runFirstButton.disabled = false;
        runLastButton.disabled = false;
        buttonSend.disabled = true;
        buttonUndo.disabled = true;
        buttonEdit.disabled = false;
        buttonDelete.disabled = false;
        readOnlyMode = false;
        editPositionMode = false;
        deletePositionMode = false;
        rules.init();
        updateColor();
    });

    const API_URL = 'https://fx4001zfw9.execute-api.eu-central-1.amazonaws.com';

    const buttonOpen = document.getElementById('open');
    buttonOpen.addEventListener('click', function() {
        msg.innerText = 'Loading...';
        fetch(API_URL + '/games', {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        }).then((response) => response.json()).then((response) => {
            msg.innerText = response.message;
            const items = response.data;
            const parentElement = document.getElementById('games');
            while (parentElement.firstChild) {
                parentElement.removeChild(parentElement.firstChild);
            }
            for (var i = 0; i < items.length; i++) {
                const item = document.createElement('div');
                item.id = 'game-' + items[i].id;
                item.className = 'game';
                item.innerHTML = '<a>' + items[i].user + ' : ' + items[i].email + '<br>'  + items[i].saved + ' : [' + items[i].sequences + ']</a>';
                const gameId = items[i].id;
                item.addEventListener('click', function() {
                    buttonNew.click();
                    fetch(API_URL + '/games?id=' + gameId, {
                        method: "GET",
                        headers: { "Content-type": "application/json; charset=UTF-8" }
                    }).then((response) => response.json()).then((response) => {
                        msg.innerText = response.message;
                        const data = response.data.details;
                        for (var i = 0; i < data.length; i++) {
                            const moveParams = { figure: parseInt(data[i].figure), origin: parseInt(data[i].origin), field: parseInt(data[i].field), kill: parseInt(data[i].killed) };
                            moveSequence.push(moveParams);
                            noteStep(i);
                        }
                        updateCounter();
                        loadPromotions();
                        runForwardButton.disabled = false;
                        runBackwardButton.disabled = false;
                        runFirstButton.disabled = false;
                        runLastButton.disabled = false;
                        readOnlyMode = false;
                    });
                });
                parentElement.appendChild(item);
            }
        });
        buttonNew.click();
        buttonCancel.click();
        readOnlyMode = true;
    });

    const buttonSend = document.getElementById('send');
    buttonSend.addEventListener('click', function() {
        const userDetails = document.getElementById('user');
        userDetails.style.display = 'block';
    });
    buttonSend.disabled = true;

    const buttonSave = document.getElementById('ok');
    buttonSave.addEventListener('click', function() {
        msg.innerText = 'Enter your name and email...';
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const today = new Date();
        if (username.length && email.length) {
            msg.innerText = 'Saving...';
            fetch(API_URL + '/games', {
                method: "POST",
                body: JSON.stringify({
                    id: today.getTime().toString(),
                    saved: today.getFullYear().toString() + '-' + (today.getMonth() + 1).toString() + '-' + today.getDate().toString() + ' ' + today.getHours().toString() + ':' + today.getMinutes().toString() + ':' + today.getSeconds().toString(),
                    user: username,
                    email: email,
                    sequences: moveSequence.length,
                    details: moveSequence,
                }),
                headers: { "Content-type": "application/json; charset=UTF-8" }
            }).then((response) => response.json()).then((response) => {
                msg.innerText = response.message;
                readOnlyMode = true;
                buttonSend.disabled = true;
                buttonOpen.click();
            });
        }
    });

    const buttonCancel = document.getElementById('cancel');
    buttonCancel.addEventListener('click', function() {
        const userDetails = document.getElementById('user');
        userDetails.style.display = 'none';
        stopDemo = true;
        playUserMode = false;
    });

    const buttonReset = document.getElementById('reset');
    buttonReset.addEventListener('click', function() {
        document.getElementById('figure-id').innerText = '--';
        document.getElementById('origin-id').innerText = '--';
        document.getElementById('field-id').innerText = '--';
        document.getElementById('kill-id').innerText = '--';
        clearSelection();
    });

    const buttonStop = document.getElementById('stop');
    buttonStop.addEventListener('click', function() {
        stopRun = true;
        editPositionMode = false;
        deletePositionMode = false;
        buttonEdit.disabled = false;
        buttonDelete.disabled = false;
        msg.innerText = 'Normal mode.';
        status.innerText = '';
    });

    const buttonEdit = document.getElementById('edit');
    buttonEdit.addEventListener('click', function() {
        stopRun = false;
        editPositionMode = true;
        deletePositionMode = false;
        buttonEdit.disabled = true;
        buttonDelete.disabled = false;
        msg.innerText = 'Edit mode.';
        status.innerText = 'E';
    });

    const buttonDelete = document.getElementById('delete');
    buttonDelete.addEventListener('click', function() {
        stopRun = false;
        editPositionMode = false;
        deletePositionMode = true;
        buttonEdit.disabled = false;
        buttonDelete.disabled = true;
        msg.innerText = 'Delete mode.';
        status.innerText = 'D';
    });

    const buttonUndo = document.getElementById('undo');
    buttonUndo.addEventListener('click', function() {
        const delay = 500;
        const lastMove = rules.getCurrentMove(moveSequence, sequenceId);
        buttonUndo.disabled = true;
        runBackwardButton.click();
        setTimeout(function() {
            moveSequence.pop();
            rules.clearCastling(moveSequence);
            const element = document.getElementById('step-' + moveSequence.length.toString());
            if (element) {
                element.remove();
            }
            for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
                if (isNaN(fieldOccupancy[i]) || fieldOccupancy[i] == null) {
                    fieldOccupancy[i] = -1;
                }
            }
            rules.attackedFields = [];
            updateCounter();
            buttonUndo.disabled = moveSequence.length == 0;
            buttonSend.disabled = moveSequence.length == 0;
            buttonEdit.disabled = moveSequence.length == 0;
            buttonDelete.disabled = moveSequence.length == 0;
            const currentMove = rules.getCurrentMove(moveSequence, sequenceId);
            if (sequenceId && currentMove == lastMove) {
                rules.undoCastling(moveSequence[sequenceId - 1].figure, moveSequence[sequenceId - 1].origin, moveSequence[sequenceId - 1].field);
                buttonUndo.click();
            }
        }, delay);
    });

    const buttonPanel = document.getElementById('panel');
    buttonPanel.addEventListener('click', function() {
        const tools = document.getElementById('tools');
        tools.style.display = tools.style.display == 'block' ? 'none' : 'block';
    });

    const checkboxMark = document.getElementById('mark-moves');
    checkboxMark.addEventListener('click', function() {
        markMoves = checkboxMark.checked;
    });

    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'ArrowLeft':
                runBackwardButton.click();
                break;
            case 'ArrowRight':
                runForwardButton.click();
                break;
            case 'Home':
                runFirstButton.click();
                break;
            case 'End':
                runLastButton.click();
                break;
            case 'Escape':
                buttonStop.click();
                break;
        }
    });

    const buttonRunDemo = document.getElementById('run-demo');
    buttonRunDemo.addEventListener('click', function() {
        stopDemo = false;
        playUserMode = false;
        msg.innerText = 'Computer mode.';
        status.innerText = 'C';
        makeDemoMoves();
    });

    function makeDemoMoves() {
        const delay = 1500;
        var result = false, source, destination, figure, kill, board = [], possibleMoves = [];
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) board.push(i);
        const shuffled = shuffle(board);
        for (var idx = 0; idx < BOARD_SIZE * BOARD_SIZE; idx++) {
            source = shuffled[idx];
            figure = fieldOccupancy[shuffled[idx]];
            if (currentMove == player.BLACK) {
                if (figure >= 0 && figure < 16 || figure >= 32 && figure < 40) {
                    possibleMoves = rules.getPossibleMoves(figure, fieldOccupancy);
                    if (possibleMoves.length) {
                        destination = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                        kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                        result = true;
                        break;
                    }
                }
            }
            if (currentMove == player.WHITE) {
                if (figure >= 16 && figure < 32 || figure >= 40 && figure < 48) {
                    possibleMoves = rules.getPossibleMoves(figure, fieldOccupancy);
                    if (possibleMoves.length) {
                        destination = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                        kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                        result = true;
                        break;
                    }
                }
            }
        }
        var preferredSource, preferredFigure, found = false;
        for (var idx = 0; idx < BOARD_SIZE * BOARD_SIZE; idx++) {
            preferredSource = shuffled[idx];
            preferredFigure = fieldOccupancy[shuffled[idx]];
            if (currentMove == player.BLACK) {
                if (preferredFigure >= 0 && preferredFigure < 16 || preferredFigure >= 32 && preferredFigure < 40) {
                    possibleMoves = rules.getPossibleMoves(preferredFigure, fieldOccupancy);
                    if (possibleMoves.length) {
                        for (var i = 0; i < possibleMoves.length; i++) {
                            if (fieldOccupancy[possibleMoves[i]] >= 16 && fieldOccupancy[possibleMoves[i]] < 32 || fieldOccupancy[possibleMoves[i]] >= 40 && fieldOccupancy[possibleMoves[i]] < 48) {
                                source = preferredSource;
                                figure = preferredFigure;
                                destination = possibleMoves[i];
                                kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                                found = true;
                            }
                        }
                    }
                }
            }
            if (currentMove == player.WHITE) {
                if (preferredFigure >= 16 && preferredFigure < 32 || preferredFigure >= 40 && preferredFigure < 48) {
                    possibleMoves = rules.getPossibleMoves(preferredFigure, fieldOccupancy);
                    if (possibleMoves.length) {
                        for (var i = 0; i < possibleMoves.length; i++) {
                            if (fieldOccupancy[possibleMoves[i]] >= 0 && fieldOccupancy[possibleMoves[i]] < 16 || fieldOccupancy[possibleMoves[i]] >= 32 && fieldOccupancy[possibleMoves[i]] < 40) {
                                source = preferredSource;
                                figure = preferredFigure;
                                destination = possibleMoves[i];
                                kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                                found = true;
                            }
                        }
                    }
                }
            }
            if (found) break;
        }
        if (result) {
            result = rules.checkIsKingSafe(figure.toString(), source.toString(), destination.toString(), kill);
            if (result) {
                document.getElementById('field-' + source.toString()).click();
                document.getElementById('field-' + destination.toString()).click();
                setTimeout(function() {
                    if (moveSequence.length == sequenceId && !stopDemo) makeDemoMoves();
                }, delay);
            }
            else {
                makeDemoMoves();
            }
        }
    }

    const buttonRunUser = document.getElementById('run-user');
    buttonRunUser.addEventListener('click', function() {
        stopDemo = true;
        playUserMode = true;
        msg.innerText = 'Player mode.';
        status.innerText = 'P';
    });

    function makePlayMoves() {
        const delay = 1000;
        var result = false, source, destination, figure, kill, board = [], possibleMoves = [];
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) board.push(i);
        const shuffled = shuffle(board);
        if (currentMove == player.BLACK) {
            for (var idx = 0; idx < BOARD_SIZE * BOARD_SIZE; idx++) {
                source = shuffled[idx];
                figure = fieldOccupancy[shuffled[idx]];
                if (figure >= 0 && figure < 16 || figure >= 32 && figure < 40) {
                    possibleMoves = rules.getPossibleMoves(figure, fieldOccupancy);
                    if (possibleMoves.length) {
                        destination = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                        kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                        result = true;
                        break;
                    }
                }
            }
            var preferredSource, preferredFigure, found = false;
            for (var idx = 0; idx < BOARD_SIZE * BOARD_SIZE; idx++) {
                preferredSource = shuffled[idx];
                preferredFigure = fieldOccupancy[shuffled[idx]];
                if (preferredFigure >= 0 && preferredFigure < 16 || preferredFigure >= 32 && preferredFigure < 40) {
                    possibleMoves = rules.getPossibleMoves(preferredFigure, fieldOccupancy);
                    if (possibleMoves.length) {
                        for (var i = 0; i < possibleMoves.length; i++) {
                            if (fieldOccupancy[possibleMoves[i]] >= 16 && fieldOccupancy[possibleMoves[i]] < 32 || fieldOccupancy[possibleMoves[i]] >= 40 && fieldOccupancy[possibleMoves[i]] < 48) {
                                source = preferredSource;
                                figure = preferredFigure;
                                destination = possibleMoves[i];
                                kill = fieldOccupancy[destination] >= 0 ? fieldOccupancy[destination] : '--';
                                found = true;
                            }
                        }
                    }
                }
                if (found) break;
            }
            if (result) {
                result = rules.checkIsKingSafe(figure.toString(), source.toString(), destination.toString(), kill);
                if (result) {
                    setTimeout(function() {
                        document.getElementById('field-' + source.toString()).click();
                        document.getElementById('field-' + destination.toString()).click();
                    }, delay);
                }
            }
        }
    }

    buttonNew.click();

    var shuffle = function(obj) {
        var randomIndex, used = false;
        var result = [], usedIndex = [];
        for (var i = 0; i < obj.length; i++) {
            do {
                randomIndex = Math.floor(Math.random() * obj.length);
                used = false;
                for (var j = 0; j < i; j++) {
                    if (randomIndex == usedIndex[j]) used = true;
                }
            }
            while (used);
            usedIndex.push(randomIndex);
            result.push(obj[randomIndex]);
        }
        return result;
    };

};
