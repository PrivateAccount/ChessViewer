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

    const sequences = [
        { figure: 19, origin: 51, field: 35, kill: null },
        { figure: 6, origin: 6, field: 21, kill: null },
        { figure: 17, origin: 49, field: 41, kill: null },
        { figure: 12, origin: 12, field: 20, kill: null },
        { figure: 27, origin: 59, field: 43, kill: null },
        { figure: 1, origin: 1, field: 18, kill: null },
        { figure: 26, origin: 58, field: 30, kill: null },
        { figure: 15, origin: 15, field: 23, kill: null },
        { figure: 26, origin: 30, field: 39, kill: null },
        { figure: 5, origin: 5, field: 33, kill: null },
        { figure: 26, origin: 39, field: 21, kill: 6 },
        { figure: 14, origin: 14, field: 21, kill: 26 },
    ];

    var fieldPositions = [];
    var moveSequence = [];
    var sequenceId = 0;

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
            console.log('Field id:', field.id);
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
            console.log('Figure id:', figure.id);
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
        stepId.innerText = sequenceId.toString() + ' of ' + sequences.length.toString();
    }

};
