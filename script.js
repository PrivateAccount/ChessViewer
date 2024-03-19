window.onload = function() {
    
    const BOARD_SIZE = 8;
    const FIELD_SIZE = 100;
    const BORDER_WIDTH = 10;
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
    var selectedGame = null;
    var stopRun = false;

    const fields = document.getElementById('fields');

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
        if (sequenceId < moveSequence.length) {
            moveFigure(moveSequence[sequenceId].figure, fieldPositions[moveSequence[sequenceId].field], steps, 0, function() {
                removeFigure(moveSequence[sequenceId].kill);
                sequenceId++;
                updateCounter();
                runForwardButton.disabled = sequenceId == moveSequence.length;
                runBackwardButton.disabled = sequenceId == 0;
                runFirstButton.disabled = false;
                runLastButton.disabled = false;
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
        if (sequenceId > 0) {
            moveFigure(moveSequence[sequenceId - 1].figure, fieldPositions[moveSequence[sequenceId - 1].origin], steps, 0, function() {
                restoreFigure(moveSequence[sequenceId - 1].kill);
                sequenceId--;
                updateCounter();
                runForwardButton.disabled = sequenceId == moveSequence.length;
                runBackwardButton.disabled = sequenceId == 0;
                runFirstButton.disabled = false;
                runLastButton.disabled = false;
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
        stopRun = false;
        goForward(sequenceId, moveSequence.length, function() {
            runFirstButton.disabled = false;
            runLastButton.disabled = false;
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
        stopRun = false;
        goBackward(sequenceId, 0, function() {
            runFirstButton.disabled = false;
            runLastButton.disabled = false;
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
        const delay = 1000;
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
        if (!readOnlyMode && sequenceId == moveSequence.length) {
            if (selection.length == 0) {
                if (pieceId != '--' && pieceId != '-1' && pieceId != 'figure--1') {
                    figureId.innerText = pieceId.replace('figure-', '');
                    originId.innerText = placeId.replace('field-', '');
                    if (rules.checkMoveOrder(parseInt(figureId.innerText))) {
                        document.getElementById(placeId).classList.add('selected');
                        selection.push(placeId);
                    }
                }
            }
            else if (selection.length == 1) {
                if (placeId != selection[0]) {
                    document.getElementById(placeId).classList.add('selected');
                    selection.push(placeId);
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
                        currentMove = currentMove == player.WHITE ? player.BLACK : player.WHITE;
                    }
                    else {
                        for (var i = 0; i < selection.length; i++) {
                            document.getElementById(selection[i]).classList.add('failed');
                        }
                        const kingId = rules.checkMyKing(originId.innerText, fieldId.innerText, figureId.innerText);
                        if (kingId) {
                            document.getElementById('field-' + kingId.toString()).classList.add('check');
                        }
                        const msg = document.getElementById('msg');
                        msg.innerText = 'Niedozwolony ruch.';
                        setTimeout(function() {
                            buttonReset.click();
                        }, delay);
                    }
                }
            }
        }
    }

    function clearSelection() {
        for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
            const field = 'field-' + i.toString();
            document.getElementById(field).classList.remove('selected', 'failed', 'check');
        }
        selection = [];
        const msg = document.getElementById('msg');
        msg.innerText = '';
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
        }, delay);
        buttonSend.disabled = readOnlyMode;
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
        buttonSend.disabled = readOnlyMode;
        const kingId = rules.checkIsKingAttacked(origin, field, rules.promotion.figure);
        if (kingId) {
            document.getElementById('field-' + kingId.toString()).classList.add('check');
        }
    }

    function noteStep(id) {
        const itemHeight = 26, pageLength = 17;
        var parentElement = document.getElementById('games');
        const item = document.createElement('div');
        item.id = 'step-' + id.toString();
        item.className = 'step';
        item.innerHTML = '<span class="lp">' + (id + 1).toString() + '</span><span class="val">' + moveSequence[id].figure + '</span><span class="val">' + moveSequence[id].origin + '</span><span class="val">' + moveSequence[id].field + '</span><span class="val">' + moveSequence[id].kill + '</span>';
        item.addEventListener('click', function() {
            stopRun = false;
            const id = parseInt(item.id.replace('step-', '')) + 1;
            if (id < sequenceId) {
                goBackward(sequenceId, id, function() {});
            }
            if (id > sequenceId) {
                goForward(sequenceId, id, function() {});
            }
        });
        parentElement.appendChild(item);
        parentElement.scrollTop = id > pageLength ? (id - pageLength) * itemHeight : 0;
    }

    function selectStep(id) {
        const itemHeight = 26, pageLength = 17;
        var parentElement = document.getElementById('games');
        var items = parentElement.children;
        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove('selected');
        }
        const element = document.getElementById('step-' + (id - 1).toString());
        if (element) {
            element.classList.add('selected');
        }
        parentElement.scrollTop = id > pageLength ? (id - pageLength) * itemHeight : 0;
        currentMove = rules.getCurrentMove(moveSequence, sequenceId);
        updateColor();
    }

    const buttonNew = document.getElementById('new');
    buttonNew.addEventListener('click', function() {
        const msg = document.getElementById('msg');
        msg.innerText = 'Inicjalizacja nowej gry.';
        const item = document.getElementById(selectedGame);
        if (item) {
            item.classList.remove('selected', 'failed', 'check');
        }
        fieldOccupancy = [];
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
        var parentElement = document.getElementById('games');
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild);
        }
        promotions = [];
        moveSequence = [];
        sequenceId = 0;
        stopRun = false;
        updateCounter();
        buttonReset.click();
        buttonCancel.click();
        runForwardButton.disabled = true;
        runBackwardButton.disabled = true;
        runFirstButton.disabled = true;
        runLastButton.disabled = true;
        buttonSend.disabled = true;
        readOnlyMode = false;
        rules.init();
        updateColor();
    });

    const buttonOpen = document.getElementById('open');
    buttonOpen.addEventListener('click', function() {
        const msg = document.getElementById('msg');
        msg.innerText = 'Ładowanie...';
        fetch('https://my-notes.pl/api/get_games.php', {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8" }
        }).then((response) => response.json()).then((response) => {
            msg.innerText = response.message;
            const items = response.data;
            var parentElement = document.getElementById('games');
            while (parentElement.firstChild) {
                parentElement.removeChild(parentElement.firstChild);
            }
            selectedGame = null;
            for (var i = 0; i < items.length; i++) {
                const item = document.createElement('div');
                item.id = 'game-' + items[i].id;
                item.className = 'game';
                item.innerHTML = '<a>' + items[i].user + ' : ' + items[i].email + '<br>'  + items[i].ip + '<br>' + items[i].modified + ' : [' + items[i].sequences + ']</a>';
                const gameId = items[i].id;
                item.addEventListener('click', function() {
                    buttonNew.click();
                    if (item.id != selectedGame) {
                        selectedGame = item.id;
                        const childrenElements = parentElement.children;
                        for (var i = 0; i < childrenElements.length; i++) {
                            const childElement = childrenElements[i];
                            childElement.classList.remove('selected', 'failed', 'check');
                        }
                        item.classList.add('selected');
                        fetch('https://my-notes.pl/api/get_game.php?id=' + gameId, {
                            method: "GET",
                            headers: { "Content-type": "application/json; charset=UTF-8" }
                        }).then((response) => response.json()).then((response) => {
                            msg.innerText = response.message;
                            const data = response.data;
                            for (var i = 0; i < data.length; i++) {
                                const moveParams = { figure: parseInt(data[i].figure), origin: parseInt(data[i].origin), field: parseInt(data[i].field), kill: parseInt(data[i].killed) };
                                moveSequence.push(moveParams);
                                noteStep(i);
                            }
                            updateCounter();
                            loadPromotions();
                            runForwardButton.disabled = false;
                            runBackwardButton.disabled = true;
                            runFirstButton.disabled = true;
                            runLastButton.disabled = false;
                            readOnlyMode = false;
                        });
                    }
                });
                parentElement.appendChild(item);
            }
        });
        readOnlyMode = true;
        buttonSend.disabled = true;
        buttonCancel.click();
    });

    const buttonSend = document.getElementById('send');
    buttonSend.addEventListener('click', function() {
        const userDetails = document.getElementById('user');
        userDetails.style.display = 'block';
    });
    buttonSend.disabled = true;

    const buttonSave = document.getElementById('ok');
    buttonSave.addEventListener('click', function() {
        const msg = document.getElementById('msg');
        msg.innerText = 'Wpisz swoje dane...';
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        if (username.length && email.length) {
            const msg = document.getElementById('msg');
            msg.innerText = 'Zapisywanie...';
            fetch('https://my-notes.pl/api/store_game.php', {
                method: "POST",
                body: JSON.stringify({
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
    });

    rules.init();

};
