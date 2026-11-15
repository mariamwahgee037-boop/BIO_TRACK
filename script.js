
/* =====================================
   ASTRO MIND - BIO TRACK
   Cognitive Game Prototype
===================================== */

// HTML Elements
const welcomeScreen = document.getElementById("welcomeScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const launchButton = document.getElementById("launchButton");
const actionButton = document.getElementById("actionButton");
const exitButton = document.getElementById("exitButton");
const replayButton = document.getElementById("replayButton");
const downloadButton = document.getElementById("downloadButton");

const stageTitle = document.getElementById("stageTitle");
const stageLabel = document.getElementById("stageLabel");
const stageIcon = document.getElementById("stageIcon");
const stageType = document.getElementById("stageType");

const instructionTitle = document.getElementById("instructionTitle");
const instructionText = document.getElementById("instructionText");

const gameContent = document.getElementById("gameContent");
const countdown = document.getElementById("countdown");
const feedback = document.getElementById("feedback");

const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");
const roundLabel = document.getElementById("roundLabel");
const gameHint = document.getElementById("gameHint");


// Game configuration
const stages = [
    {
        name: "Number Memory",
        icon: "▦",
        type: "MEMORY RECALL",
        rounds: 5
    },
    {
        name: "Color Focus",
        icon: "◉",
        type: "SELECTIVE ATTENTION",
        rounds: 8
    },
    {
        name: "Spatial Memory",
        icon: "⌗",
        type: "SPATIAL RECALL",
        rounds: 4
    }
];

const colors = [
    { name: "CYAN", value: "#45c7e8" },
    { name: "CORAL", value: "#ff7f78" },
    { name: "VIOLET", value: "#aa8df2" },
    { name: "LIME", value: "#a8d96c" },
    { name: "GOLD", value: "#f1c66d" },
    { name: "PINK", value: "#ed8fc5" }
];


// Game state
let stageIndex = 0;
let roundIndex = 0;
let results = [];

let roundStartTime = 0;
let acceptingAnswers = false;
let timer = null;

let numberSequence = [];
let targetPosition = 0;

let targetColor = null;
let selectedColor = false;

let spatialSequence = [];
let spatialInput = [];


// -------------------------------------
// General helpers
// -------------------------------------

function showScreen(screen) {
    welcomeScreen.classList.remove("active");
    gameScreen.classList.remove("active");
    resultScreen.classList.remove("active");

    screen.classList.add("active");
}

function shuffle(array) {
    const items = [...array];

    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
}

function stopTimer() {
    if (timer !== null) {
        clearTimeout(timer);
        clearInterval(timer);
        timer = null;
    }
}

function showFeedback(message, type = "") {
    feedback.textContent = message;
    feedback.className = type;
}

function updateProgress() {
    const totalRounds = stages.reduce(
        (sum, stage) => sum + stage.rounds,
        0
    );

    const completedBefore = stages
        .slice(0, stageIndex)
        .reduce((sum, stage) => sum + stage.rounds, 0);

    const completed = completedBefore + roundIndex;

    const percent = Math.round(
        (completed / totalRounds) * 100
    );

    progressBar.style.width = percent + "%";
    progressPercent.textContent = percent + "%";

    stageLabel.textContent =
        `MODULE 0${stageIndex + 1} / 03`;

    roundLabel.textContent =
        `ROUND ${roundIndex + 1} / ${stages[stageIndex].rounds}`;
}


// -------------------------------------
// Mission start
// -------------------------------------

function startMission() {
    stopTimer();

    stageIndex = 0;
    roundIndex = 0;
    results = [];

    showScreen(gameScreen);

    startStage();
}

function startStage() {
    stopTimer();

    const stage = stages[stageIndex];

    results[stageIndex] = {
        name: stage.name,
        total: stage.rounds,
        correct: 0,
        times: [],
        rounds: []
    };

    stageTitle.textContent = stage.name;
    stageIcon.textContent = stage.icon;
    stageType.textContent = stage.type;

    roundIndex = 0;

    prepareRound();
}


// -------------------------------------
// Prepare round
// -------------------------------------

function prepareRound() {
    stopTimer();

    acceptingAnswers = false;

    gameContent.innerHTML = "";
    countdown.textContent = "";
    showFeedback("");

    actionButton.disabled = false;
    actionButton.textContent = "START ROUND →";
    actionButton.onclick = startCurrentRound;

    updateProgress();

    if (stageIndex === 0) {
        prepareNumberRound();
    }

    if (stageIndex === 1) {
        prepareColorRound();
    }

    if (stageIndex === 2) {
        prepareSpatialRound();
    }
}


// =====================================
// STAGE 1 - NUMBER MEMORY
// =====================================

function prepareNumberRound() {
    instructionTitle.textContent = "Remember the cards";

    instructionText.textContent =
        "Memorize the five numbers and their positions.";

    gameHint.textContent =
        "Remember the number AND its position.";

    numberSequence = Array.from(
        { length: 5 },
        () => Math.floor(Math.random() * 9) + 1
    );

    const grid = document.createElement("div");
    grid.className = "number-grid";

    numberSequence.forEach(number => {
        const card = document.createElement("div");

        card.className = "memory-card";
        card.textContent = number;

        grid.appendChild(card);
    });

    gameContent.appendChild(grid);
}

function runNumberRound() {
    const cards = gameContent.querySelectorAll(".memory-card");

    instructionTitle.textContent = "Memorize the sequence";

    instructionText.textContent =
        "You have three seconds to memorize the cards.";

    let seconds = 3;

    countdown.textContent = seconds;

    timer = setInterval(() => {
        seconds--;

        if (seconds > 0) {
            countdown.textContent = seconds;
        } else {
            clearInterval(timer);
            timer = null;

            hideNumberCards(cards);
        }
    }, 1000);
}

function hideNumberCards(cards) {
    cards.forEach(card => {
        card.textContent = "✦";
        card.classList.add("hidden-card");
    });

    targetPosition = Math.floor(Math.random() * 5);

    instructionTitle.textContent =
        `What was in position ${targetPosition + 1}?`;

    instructionText.textContent =
        "Choose the number that appeared in this card position.";

    countdown.textContent = "";

    const correctNumber = numberSequence[targetPosition];

    let options = new Set([correctNumber]);

    while (options.size < 5) {
        options.add(Math.floor(Math.random() * 9) + 1);
    }

    const choiceGrid = document.createElement("div");
    choiceGrid.className = "choice-grid";

    shuffle([...options]).forEach(number => {
        const button = document.createElement("button");

        button.className = "choice-btn";
        button.textContent = number;

        button.addEventListener("click", () => {
            answerNumber(number, button, correctNumber);
        });

        choiceGrid.appendChild(button);
    });

    gameContent.appendChild(choiceGrid);

    acceptingAnswers = true;
    roundStartTime = performance.now();

    actionButton.disabled = true;
}

function answerNumber(number, selectedButton, correctNumber) {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;

    const elapsed = performance.now() - roundStartTime;

    const correct = number === correctNumber;

    const buttons = gameContent.querySelectorAll(".choice-btn");

    buttons.forEach(button => {
        button.disabled = true;

        if (Number(button.textContent) === correctNumber) {
            button.classList.add("correct");
        }
    });

    if (!correct) {
        selectedButton.classList.add("wrong");
    }

    finishRound(
        correct,
        elapsed,
        correct
            ? "Correct! Excellent visual memory."
            : `Incorrect. The correct answer was ${correctNumber}.`
    );
}


// =====================================
// STAGE 2 - COLOR FOCUS
// =====================================

function prepareColorRound() {
    instructionTitle.textContent = "Find the target color";

    instructionText.textContent =
        "Select the card matching the target color.";

    gameHint.textContent =
        "Ignore the distracting colors.";

    targetColor = colors[
        Math.floor(Math.random() * colors.length)
    ];

    const target = document.createElement("p");

    target.id = "targetText";
    target.textContent = `FIND: ${targetColor.name}`;

    gameContent.appendChild(target);

    const grid = document.createElement("div");
    grid.className = "color-grid";

    let options = [
        targetColor,
        ...shuffle(colors.filter(
            color => color.name !== targetColor.name
        )).slice(0, 7)
    ];

    shuffle(options).forEach(color => {
        const card = document.createElement("button");

        card.className = "color-card";
        card.style.background = color.value;

        card.dataset.correct =
            color.name === targetColor.name ? "true" : "false";

        card.addEventListener("click", () => {
            answerColor(card);
        });

        grid.appendChild(card);
    });

    gameContent.appendChild(grid);
}

function runColorRound() {
    instructionTitle.textContent =
        `Select ${targetColor.name}`;

    instructionText.textContent =
        "Find the card with the target color.";

    acceptingAnswers = true;

    roundStartTime = performance.now();
}

function answerColor(card) {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;

    const elapsed = performance.now() - roundStartTime;

    const correct = card.dataset.correct === "true";

    const cards = gameContent.querySelectorAll(".color-card");

    cards.forEach(item => {
        item.disabled = true;

        if (item.dataset.correct === "true") {
            item.classList.add("correct");
        }
    });

    if (!correct) {
        card.classList.add("wrong");
    }

    finishRound(
        correct,
        elapsed,
        correct
            ? "Great focus! You found the correct color."
            : "Not quite. Look for the highlighted target color."
    );
}


// =====================================
// STAGE 3 - SPATIAL MEMORY
// =====================================

function prepareSpatialRound() {
    instructionTitle.textContent = "Watch the light sequence";

    instructionText.textContent =
        "Remember the order of the glowing squares.";

    gameHint.textContent =
        "Repeat the sequence in exactly the same order.";

    const sequenceLength = Math.min(3 + roundIndex, 6);

    spatialSequence = Array.from(
        { length: sequenceLength },
        () => Math.floor(Math.random() * 9)
    );

    spatialInput = [];

    const grid = document.createElement("div");
    grid.className = "spatial-grid";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("button");

        cell.className = "spatial-cell";
        cell.disabled = true;

        cell.addEventListener("click", () => {
            answerSpatial(i, cell);
        });

        grid.appendChild(cell);
    }

    gameContent.appendChild(grid);
}

function runSpatialRound() {
    instructionTitle.textContent = "Watch carefully";

    instructionText.textContent =
        "The squares will light up one by one.";

    const cells = gameContent.querySelectorAll(".spatial-cell");

    let index = 0;

    actionButton.disabled = true;

    function showNext() {
        if (index >= spatialSequence.length) {
            cells.forEach(cell => {
                cell.disabled = false;
            });

            instructionTitle.textContent = "Your turn";

            instructionText.textContent =
                "Repeat the sequence by tapping the squares in order.";

            countdown.textContent = "";

            acceptingAnswers = true;

            roundStartTime = performance.now();

            return;
        }

        const cell = cells[spatialSequence[index]];

        countdown.textContent =
            `${index + 1} / ${spatialSequence.length}`;

        cell.classList.add("lit");

        timer = setTimeout(() => {
            cell.classList.remove("lit");

            index++;

            timer = setTimeout(showNext, 300);

        }, 550);
    }

    timer = setTimeout(showNext, 500);
}

function answerSpatial(position, cell) {
    if (!acceptingAnswers) return;

    const expected = spatialSequence[spatialInput.length];

    const correctTap = position === expected;

    spatialInput.push(position);

    if (!correctTap) {
        acceptingAnswers = false;

        finishRound(
            false,
            performance.now() - roundStartTime,
            "Sequence incorrect. Try again in the next round."
        );

        return;
    }

    cell.classList.add("lit");

    setTimeout(() => {
        cell.classList.remove("lit");
    }, 180);

    if (spatialInput.length === spatialSequence.length) {
        acceptingAnswers = false;

        finishRound(
            true,
            performance.now() - roundStartTime,
            "Perfect! You repeated the entire sequence."
        );
    }
}


// =====================================
// ROUND CONTROL
// =====================================

function startCurrentRound() {
    if (acceptingAnswers) return;

    actionButton.disabled = true;
    actionButton.textContent = "IN PROGRESS...";

    if (stageIndex === 0) {
        runNumberRound();
    }

    if (stageIndex === 1) {
        runColorRound();
    }

    if (stageIndex === 2) {
        runSpatialRound();
    }
}

function finishRound(correct, elapsed, message) {
    acceptingAnswers = false;

    const stageResult = results[stageIndex];

    if (correct) {
        stageResult.correct++;
    }

    const responseTime = Math.round(elapsed);

    stageResult.times.push(responseTime);

    stageResult.rounds.push({
        correct: correct,
        reactionTimeMs: responseTime
    });

    showFeedback(
        message,
        correct ? "good" : "bad"
    );

    actionButton.disabled = false;

    actionButton.textContent =
        roundIndex === stages[stageIndex].rounds - 1
            ? "CONTINUE →"
            : "NEXT ROUND →";

    actionButton.onclick = nextRound;
}

function nextRound() {
    if (roundIndex < stages[stageIndex].rounds - 1) {
        roundIndex++;

        prepareRound();

        return;
    }

    if (stageIndex < stages.length - 1) {
        stageIndex++;

        startStage();

        return;
    }

    showResults();
}


// =====================================
// RESULTS
// =====================================

function showResults() {
    stopTimer();

    acceptingAnswers = false;

    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";

    const allRounds = results.flatMap(
        stage => stage.rounds
    );

    const totalCorrect = allRounds.filter(
        round => round.correct
    ).length;

    const totalRounds = allRounds.length;

    const accuracy = Math.round(
        (totalCorrect / totalRounds) * 100
    );

    const averageTime = Math.round(
        allRounds.reduce(
            (sum, round) => sum + round.reactionTimeMs,
            0
        ) / totalRounds
    );

    document.getElementById("overallAccuracy").textContent =
        accuracy + "%";

    document.getElementById("circleValue").textContent =
        accuracy + "%";

    document.getElementById("scoreCircle")
        .style.setProperty("--score", accuracy + "%");

    document.getElementById("overallDescription").textContent =
        `${totalCorrect} correct answers out of ${totalRounds}`;

    const resultsGrid = document.getElementById("resultsGrid");

    resultsGrid.innerHTML = "";

    results.forEach(stage => {
        const stageAccuracy = Math.round(
            (stage.correct / stage.total) * 100
        );

        const averageStageTime = Math.round(
            stage.times.reduce((sum, time) => sum + time, 0)
            / stage.times.length
        );

        const card = document.createElement("div");

        card.className = "result-card";

        const title = document.createElement("h3");
        title.textContent = stage.name;

        const stats = [
            ["Accuracy", stageAccuracy + "%"],
            ["Correct rounds", `${stage.correct}/${stage.total}`],
            ["Average response", averageStageTime + " ms"]
        ];

        card.appendChild(title);

        stats.forEach(([label, value]) => {
            const row = document.createElement("div");

            row.className = "result-stat";

            const name = document.createElement("span");
            name.textContent = label;

            const result = document.createElement("strong");
            result.textContent = value;

            row.append(name, result);

            card.appendChild(row);
        });

        resultsGrid.appendChild(card);
    });

    showScreen(resultScreen);
}


// =====================================
// DOWNLOAD JSON REPORT
// =====================================

function downloadReport() {
    const allRounds = results.flatMap(
        stage => stage.rounds
    );

    const correct = allRounds.filter(
        round => round.correct
    ).length;

    const report = {
        project: "ASTRO MIND - BIO TRACK",

        generatedAt: new Date().toISOString(),

        disclaimer:
            "Prototype only. Not a validated clinical assessment.",

        overall: {
            totalRounds: allRounds.length,

            correctAnswers: correct,

            accuracyPercent: Math.round(
                (correct / allRounds.length) * 100
            ),

            averageResponseTimeMs: Math.round(
                allRounds.reduce(
                    (sum, round) => sum + round.reactionTimeMs,
                    0
                ) / allRounds.length
            )
        },

        stages: results
    };

    const file = new Blob(
        [JSON.stringify(report, null, 4)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(file);

    const link = document.createElement("a");

    link.href = url;
    link.download = "astro-mind-report.json";

    link.click();

    URL.revokeObjectURL(url);
}


// =====================================
// BUTTON EVENTS
// =====================================

launchButton.addEventListener("click", startMission);

replayButton.addEventListener("click", startMission);

downloadButton.addEventListener("click", downloadReport);

exitButton.addEventListener("click", () => {
    stopTimer();
    acceptingAnswers = false;

    showScreen(welcomeScreen);
});


// Initial state
updateProgress();
