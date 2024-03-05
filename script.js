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
    var readOnlyMode = false;
    var selectedGame = null;

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
                clearSelection();
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
                clearSelection();
            });
            fieldOccupancy[moveSequence[sequenceId - 1].origin] = moveSequence[sequenceId - 1].figure;
            fieldOccupancy[moveSequence[sequenceId - 1].field] = moveSequence[sequenceId - 1].kill;
            figurePositions[moveSequence[sequenceId - 1].figure] = moveSequence[sequenceId - 1].origin;
        }
    });

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
        if (sequenceId == moveSequence.length) {
            if (selection.length == 0) {
                if (pieceId != '--') {
                    document.getElementById(placeId).classList.add('selected');
                    selection.push(placeId);
                    figureId.innerText = pieceId.replace('figure-', '');
                    originId.innerText = placeId.replace('field-', '');
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
                        currentMove = currentMove == player.WHITE ? player.BLACK : player.WHITE;
                    }
                    else {
                        for (var i = 0; i < selection.length; i++) {
                            document.getElementById(selection[i]).classList.add('failed');
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
            document.getElementById(field).classList.remove('selected', 'failed');
        }
        selection = [];
        const msg = document.getElementById('msg');
        msg.innerText = '';
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
        }, delay);
        buttonSend.disabled = readOnlyMode;
    }

    const buttonNew = document.getElementById('new');
    buttonNew.addEventListener('click', function() {
        const msg = document.getElementById('msg');
        msg.innerText = 'Inicjalizacja nowej gry.';
        const item = document.getElementById(selectedGame);
        if (item) {
            item.classList.remove('selected', 'failed');
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
        moveSequence = [];
        sequenceId = 0;
        updateCounter();
        buttonReset.click();
        buttonCancel.click();
        runForwardButton.disabled = true;
        runBackwardButton.disabled = true;
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
                item.innerHTML = '<a>' + items[i].user + ' : ' + items[i].email + ' : '  + items[i].ip + '<br>' + items[i].modified + ' : [' + items[i].sequences + ']</a>';
                const gameId = items[i].id;
                item.addEventListener('click', function() {
                    buttonNew.click();
                    if (item.id != selectedGame) {
                        selectedGame = item.id;
                        const childrenElements = parentElement.children;
                        for (var i = 0; i < childrenElements.length; i++) {
                            const childElement = childrenElements[i];
                            childElement.classList.remove('selected', 'failed');
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
                            }
                            updateCounter();
                            runForwardButton.disabled = false;
                            runBackwardButton.disabled = true;
                            readOnlyMode = true;
                        });    
                    }
                });
                parentElement.appendChild(item);
            }
        });
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

    rules.init();

};
