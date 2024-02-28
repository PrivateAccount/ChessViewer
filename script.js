window.onload = function() {
    
    const BOARD_SIZE = 8;
    const FIELD_SIZE = 100;
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

    const sequences = [];

    var fieldPositions = [];
    var moveSequence = [];
    var sequenceId = 0;
    var source = false;
    var destination = false;

    for (var i = 0; i < sequences.length; i++) {
        moveSequence.push(sequences[i]);
    }
    updateCounter();

    const steps = 20;

    const fields = document.getElementById('fields');

    for (var i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
        const swap = Math.floor(i / BOARD_SIZE) % 2 == 0;
        const field = document.createElement('div');
        field.id = 'field-' + i.toString();
        field.classList.add('field');
        if (swap) field.classList.add(i % 2 ? 'dark' : 'light');
        else field.classList.add(i % 2 ? 'light' : 'dark');
        field.addEventListener('click', function() {
            const originId = document.getElementById('origin-id');
            const fieldId = document.getElementById('field-id');
            destination = !destination;
            if (destination) originId.innerText = field.id.replace('field-', '');
            else fieldId.innerText = field.id.replace('field-', '');
        });
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
        }
        else {
            figure.style.left = fieldPositions[i + 4 * BOARD_SIZE].x + 'px';
            figure.style.top = fieldPositions[i + 4 * BOARD_SIZE].y + 'px';    
        }
        figure.addEventListener('click', function() {
            const figureId = document.getElementById('figure-id');
            const killId = document.getElementById('kill-id');
            source = !source;
            if (source) figureId.innerText = figure.id.replace('figure-', '');
            else killId.innerText = figure.id.replace('figure-', '');
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
                buttonSend.disabled = sequenceId != moveSequence.length;
                buttonReset.click();
            });
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
                buttonSend.disabled = sequenceId != moveSequence.length;
                buttonReset.click();
            });
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

    const buttonSend = document.getElementById('send');
    buttonSend.addEventListener('click', function() {
        const figure = document.getElementById('figure-id').innerText;
        const origin = document.getElementById('origin-id').innerText;
        const field = document.getElementById('field-id').innerText;
        const kill = document.getElementById('kill-id').innerText;
        if (figure == '--' || origin == '--' || field == '--') return;
        const moveParams = { figure: parseInt(figure), origin: parseInt(origin), field: parseInt(field), kill: parseInt(kill) };
        moveSequence.push(moveParams);
        runForwardButton.disabled = false;
        runForwardButton.click();
        buttonReset.click();
    });

    const buttonReset = document.getElementById('reset');
    buttonReset.addEventListener('click', function() {
        source = false;
        destination = false;
        document.getElementById('figure-id').innerText = '--';
        document.getElementById('origin-id').innerText = '--';
        document.getElementById('field-id').innerText = '--';
        document.getElementById('kill-id').innerText = '--';
    });

};
