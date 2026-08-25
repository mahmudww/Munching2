/* =========================================================
   MUNCHING 2
   GAME.JS
========================================================= */


/* =========================================================
   PLAYER STATE
========================================================= */

let p = {

    race: "",

    lvl: 1,

    baseAtk: 0,

    inv: [],

    skillUsed: false,

    skillActive: false,

    curEn: null,

    pendingItem: null,

    gameOver: false

};


/* =========================================================
   GAME SETTINGS
========================================================= */

const MIN_LEVEL = 1;


/* =========================================================
   CONTROL GROUPS
========================================================= */

function showControls(groupId) {

    document
        .querySelectorAll(".control-group")
        .forEach(element => {

            element.style.display = "none";

        });


    const group =
        document.getElementById(groupId);


    if (group) {

        group.style.display = "grid";

    }

}


/* =========================================================
   INITIALIZE GAME
========================================================= */

function initGame(race) {

    /*
     * Resume browser audio after user interaction.
     */

    if (
        typeof resumeAudio === "function"
    ) {

        resumeAudio();

    }


    if (
        typeof startBGM === "function"
    ) {

        startBGM();

    }


    /*
     * Reset player state.
     */

    p.race = race;

    p.lvl = 1;

    p.inv = [];

    p.skillUsed = false;

    p.skillActive = false;

    p.curEn = null;

    p.pendingItem = null;

    p.gameOver = false;


    /*
     * Race base attack.
     */

    if (race === "Orc") {

        p.baseAtk = 5;

    }

    else if (race === "Elf") {

        p.baseAtk = 2;

    }

    else if (race === "Dwarf") {

        p.baseAtk = 2;

    }

    else {

        p.baseAtk = 0;

    }


    /*
     * Hide start screen.
     */

    const overlay =
        document.getElementById("overlay");


    if (overlay) {

        overlay.style.display = "none";

    }


    /*
     * Update race UI.
     */

    const raceUI =
        document.getElementById("ui-race");


    if (raceUI) {

        raceUI.innerText =
            race.toUpperCase();

    }


    /*
     * Update passive description.
     */

    updatePassiveUI();


    /*
     * Update everything.
     */

    updateUI();


    /*
     * Start at the first door.
     */

    resetArena();


    log(
        `🚪 Your adventure begins as an ${race}!`,
        "white"
    );

}


/* =========================================================
   OPEN DOOR
========================================================= */

function openDoor() {

    if (p.gameOver) {
        return;
    }


    /*
     * Boss levels.
     *
     * Level 3
     * Level 6
     * Level 10
     */

    if (
        typeof isBossLevel === "function" &&
        isBossLevel(p.lvl)
    ) {

        if (
            typeof spawnBossForCurrentLevel ===
            "function"
        ) {

            spawnBossForCurrentLevel();

        }

        return;

    }


    /*
     * Normal random event.
     *
     * 45% Monster
     * 25% Trap
     * 30% Loot
     */

    const rng =
        Math.random();


    if (rng < 0.45) {

        if (
            typeof spawnMonster ===
            "function"
        ) {

            spawnMonster();

        }

    }

    else if (rng < 0.70) {

        spawnTrap();

    }

    else {

        if (
            typeof spawnLoot ===
            "function"
        ) {

            spawnLoot();

        }

    }

}


/* =========================================================
   TRAP EVENT
========================================================= */

function spawnTrap() {

    if (p.gameOver) {
        return;
    }


    if (
        typeof sfx !== "undefined" &&
        typeof sfx.trap === "function"
    ) {

        sfx.trap();

    }


    const trapType =
        Math.floor(
            Math.random() * 3
        );


    let message = "";

    let icon = "";

    let levelChange = 0;


    /*
     * =====================================================
     * ARROW TRAP
     * =====================================================
     */

    if (trapType === 0) {

        p.lvl -= 1;

        levelChange = -1;

        message =
            "🏹 Arrow Trap! Level -1";

        icon = "🏹";

    }


    /*
     * =====================================================
     * VOID PORTAL
     * =====================================================
     */

    else if (trapType === 1) {

        p.lvl = 1;

        message =
            "🌀 Void Portal! Returned to Level 1";

        icon = "🌀";

    }


    /*
     * =====================================================
     * SHADOW THIEF
     * =====================================================
     */

    else {

        icon = "👤";


        if (
            typeof loseRandomItem ===
            "function"
        ) {

            const lost =
                loseRandomItem();


            if (lost) {

                message =
                    `👤 Shadow Thief! Lost ${getItemName(lost)}`;

            }

            else {

                message =
                    "👤 Shadow Thief! Your inventory was empty.";

            }

        }

        else {

            message =
                "👤 Shadow Thief! Item stolen.";

        }

    }


    /*
     * Display trap.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card trap">

            <span class="m-icon">
                ${icon}
            </span>

            <h2>
                ${message}
            </h2>

        </div>

    `;


    log(
        `⚠️ ${message}`,
        "var(--purple)"
    );


    /*
     * Check death.
     */

    if (
        p.lvl <= 0
    ) {

        triggerDeath(
            "You died because your level reached 0."
        );

        return;

    }


    /*
     * Clamp level.
     */

    p.lvl =
        Math.max(
            MIN_LEVEL,
            p.lvl
        );


    updateUI();

    endTurn();

}


/* =========================================================
   RUN / ESCAPE
========================================================= */

function handleRun() {

    if (
        p.gameOver ||
        !p.curEn
    ) {

        return;

    }


    /*
     * Prevent multiple clicks.
     */

    showControls("group-next");


    /*
     * Disable all combat buttons
     * during dice animation.
     */

    document
        .querySelectorAll(
            "#group-combat button"
        )
        .forEach(button => {

            button.disabled = true;

        });


    /*
     * Show dice animation.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card">

            <div class="dice-roll">
                🎲
            </div>

            <p>
                ROLLING...
            </p>

        </div>

    `;


    let rolls = 0;


    const rollAnimation =
        setInterval(() => {

            if (
                typeof sfx !== "undefined" &&
                typeof sfx.run === "function"
            ) {

                sfx.run();

            }


            rolls++;


            if (rolls >= 6) {

                clearInterval(
                    rollAnimation
                );

            }

        }, 100);


    /*
     * Wait for animation.
     */

    setTimeout(() => {

        /*
         * Raw dice roll.
         */

        const rawRoll =
            Math.floor(
                Math.random() * 6
            ) + 1;


        /*
         * Elf gets +1 escape bonus.
         */

        const bonus =
            p.race === "Elf"
                ? 1
                : 0;


        const finalRoll =
            rawRoll + bonus;


        /*
         * Boss or normal enemy?
         */

        const escapedBoss =
            p.curEn &&
            p.curEn.boss === true;


        const enemyName =
            typeof getCurrentEnemyName ===
            "function"

                ? getCurrentEnemyName()

                : (
                    p.curEn.name ||
                    p.curEn.n ||
                    "Enemy"
                );


        /*
         * Log exact roll.
         */

        if (bonus > 0) {

            log(
                `🎲 Roll: ${rawRoll} + 1 Elf bonus = ${finalRoll}`,
                "var(--gold)"
            );

        }

        else {

            log(
                `🎲 Roll: ${rawRoll}`,
                "var(--gold)"
            );

        }


        /*
         * =================================================
         * ROLL 1-2
         *
         * FAILURE
         *
         * Level -3
         * Lose ALL inventory
         * =================================================
         */

        if (rawRoll <= 2) {

            if (
                typeof sfx !== "undefined" &&
                typeof sfx.escapeFail ===
                "function"
            ) {

                sfx.escapeFail();

            }


            p.lvl -= 3;


            if (
                typeof loseAllItems ===
                "function"
            ) {

                loseAllItems();

            }

            else {

                p.inv = [];

            }


            log(
                `❌ Failed to escape ${enemyName}! Level -3 and all items lost.`,
                "var(--red)"
            );


            document.getElementById(
                "event-display"
            ).innerHTML = `

                <div class="card monster">

                    <span class="m-icon">
                        💥
                    </span>

                    <h2>
                        ESCAPE FAILED!
                    </h2>

                    <p>
                        Roll: ${rawRoll}
                    </p>

                    <p style="color: var(--red);">
                        Level -3
                    </p>

                    <p style="color: var(--red);">
                        All inventory lost
                    </p>

                </div>

            `;


            /*
             * Death check.
             */

            if (
                p.lvl <= 0
            ) {

                triggerDeath(
                    `You were overwhelmed by ${enemyName} while trying to escape.`
                );

                return;

            }


            p.lvl =
                Math.max(
                    MIN_LEVEL,
                    p.lvl
                );


            p.curEn =
                null;


            updateUI();


            setTimeout(() => {

                resetArena();

            }, 1200);


            return;

        }


        /*
         * =================================================
         * ROLL 3-4
         *
         * SUCCESS
         *
         * Lose 1 random item
         *
         * Normal mob: Level -1
         * Boss: Level -2
         * =================================================
         */

        if (rawRoll <= 4) {

            if (
                typeof sfx !== "undefined" &&
                typeof sfx.escapeSuccess ===
                "function"
            ) {

                sfx.escapeSuccess();

            }


            const levelPenalty =
                escapedBoss
                    ? 2
                    : 1;


            p.lvl -=
                levelPenalty;


            let lostItem =
                null;


            if (
                typeof loseRandomItem ===
                "function"
            ) {

                lostItem =
                    loseRandomItem();

            }


            let itemMessage;


            if (lostItem) {

                itemMessage =
                    `${getItemEmoji(lostItem)} ${getItemName(lostItem)} was lost.`;

            }

            else {

                itemMessage =
                    "No item was lost because your inventory was empty.";

            }


            log(
                `👟 Escaped from ${enemyName}! Level -${levelPenalty}. ${itemMessage}`,
                "var(--green)"
            );


            document.getElementById(
                "event-display"
            ).innerHTML = `

                <div class="card loot">

                    <span class="m-icon">
                        🏃
                    </span>

                    <h2>
                        ESCAPED!
                    </h2>

                    <p>
                        Roll: ${rawRoll}
                    </p>

                    <p style="color: var(--green);">
                        Level -${levelPenalty}
                    </p>

                    <p>
                        ${itemMessage}
                    </p>

                </div>

            `;


            /*
             * Death check.
             */

            if (
                p.lvl <= 0
            ) {

                triggerDeath(
                    "You collapsed while escaping."
                );

                return;

            }


            p.lvl =
                Math.max(
                    MIN_LEVEL,
                    p.lvl
                );


            p.curEn =
                null;


            updateUI();


            setTimeout(() => {

                resetArena();

            }, 1500);


            return;

        }


        /*
         * =================================================
         * ROLL 5-6
         *
         * SUCCESS
         *
         * No item lost
         *
         * Normal mob: Level -1
         * Boss: Level -2
         * =================================================
         */

        if (rawRoll >= 5) {

            if (
                typeof sfx !== "undefined" &&
                typeof sfx.escapeSuccess ===
                "function"
            ) {

                sfx.escapeSuccess();

            }


            const levelPenalty =
                escapedBoss
                    ? 2
                    : 1;


            p.lvl -=
                levelPenalty;


            log(
                `🏃 Successfully escaped ${enemyName}! Level -${levelPenalty}.`,
                "var(--green)"
            );


            document.getElementById(
                "event-display"
            ).innerHTML = `

                <div class="card loot">

                    <span class="m-icon">
                        🏃
                    </span>

                    <h2>
                        ESCAPED SAFELY!
                    </h2>

                    <p>
                        Roll: ${rawRoll}
                    </p>

                    <p style="color: var(--green);">
                        Level -${levelPenalty}
                    </p>

                    <p>
                        Your inventory is safe.
                    </p>

                </div>

            `;


            /*
             * Death check.
             */

            if (
                p.lvl <= 0
            ) {

                triggerDeath(
                    "You collapsed while escaping."
                );

                return;

            }


            p.lvl =
                Math.max(
                    MIN_LEVEL,
                    p.lvl
                );


            p.curEn =
                null;


            updateUI();


            setTimeout(() => {

                resetArena();

            }, 1500);


            return;

        }


    }, 900);

}


/* =========================================================
   RESET ARENA
========================================================= */

function resetArena() {

    if (p.gameOver) {
        return;
    }


    p.curEn =
        null;


    /*
     * Reset skill state.
     */

    p.skillActive =
        false;

    p.skillUsed =
        false;


    /*
     * Reset event display.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card">

            <span class="m-icon">
                🚪
            </span>

            <h2>
                Level ${p.lvl} Door
            </h2>

            <p class="event-description">
                Something awaits beyond the door...
            </p>

        </div>

    `;


    /*
     * Show door button.
     */

    showControls(
        "group-door"
    );


    updateUI();


    /*
     * Re-enable combat buttons.
     */

    document
        .querySelectorAll(
            "#group-combat button"
        )
        .forEach(button => {

            button.disabled = false;

        });


    /*
     * Update combat display.
     */

    updateCombatInfo();

}


/* =========================================================
   END TURN
========================================================= */

function endTurn() {

    if (p.gameOver) {
        return;
    }


    /*
     * Skill lasts only for one turn.
     */

    p.skillActive =
        false;


    p.skillUsed =
        false;


    updateUI();


    showControls(
        "group-next"
    );


    updateCombatInfo();


    /*
     * Re-enable buttons.
     */

    document
        .querySelectorAll(
            "#group-combat button"
        )
        .forEach(button => {

            button.disabled = false;

        });

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    /*
     * Level
     */

    const levelUI =
        document.getElementById(
            "ui-level"
        );


    if (levelUI) {

        levelUI.innerText =
            p.lvl;

    }


    /*
     * Attack
     */

    const atkUI =
        document.getElementById(
            "ui-atk"
        );


    if (
        atkUI &&
        typeof calculateAtk ===
        "function"
    ) {

        atkUI.innerText =
            calculateAtk();

    }


    /*
     * Inventory
     */

    const inventoryUI =
        document.getElementById(
            "ui-inv"
        );


    if (
        inventoryUI &&
        typeof p.inv !== "undefined"
    ) {

        if (
            p.inv.length === 0
        ) {

            inventoryUI.innerHTML = `

                <div class="inv-slot empty-slot">
                    Empty
                </div>

            `;

        }

        else {

            inventoryUI.innerHTML =
                p.inv.map(
                    item => `

                        <div class="inv-slot">

                            <span>
                                ${getItemEmoji(item)}
                                ${getItemName(item)}
                            </span>

                            <span>
                                +${getItemPower(item)}
                            </span>

                        </div>

                    `
                ).join("");

        }

    }


    /*
     * Inventory count
     */

    const inventoryCount =
        document.getElementById(
            "inventory-count"
        );


    if (inventoryCount) {

        const maxInventory =
            typeof MAX_INVENTORY !==
            "undefined"

                ? MAX_INVENTORY
                : 5;


        inventoryCount.innerText =
            `${p.inv.length} / ${maxInventory}`;

    }


    /*
     * Passive
     */

    updatePassiveUI();


    /*
     * Combat info
     */

    updateCombatInfo();


    /*
     * Skill button
     */

    updateSkillButton();

}


/* =========================================================
   PASSIVE UI
========================================================= */

function updatePassiveUI() {

    const passiveText =
        document.getElementById(
            "passive-text"
        );


    if (!passiveText) {
        return;
    }


    if (p.race === "Orc") {

        passiveText.innerHTML =
            "🔥 <strong>Berserk</strong><br>" +
            "Double your total ATK for one turn.";

    }

    else if (p.race === "Elf") {

        passiveText.innerHTML =
            "👟 <strong>Swift</strong><br>" +
            "+1 to escape rolls.";

    }

    else if (p.race === "Dwarf") {

        passiveText.innerHTML =
            "🔨 <strong>Master Crafter</strong><br>" +
            "Each item gives +1 bonus ATK.";

    }

    else {

        passiveText.innerText =
            "Choose a race to begin.";

    }

}


/* =========================================================
   SKILL BUTTON UI
========================================================= */

function updateSkillButton() {

    const button =
        document.getElementById(
            "skill-btn"
        );


    if (!button) {
        return;
    }


    if (!p.curEn) {

        button.disabled =
            true;

        button.innerText =
            "🔥 SKILL";

        return;

    }


    if (p.skillUsed) {

        button.disabled =
            true;

        button.innerText =
            "🔥 SKILL USED";

        return;

    }


    button.disabled =
        false;

    button.innerText =
        p.race === "Orc"

            ? "🔥 BERSERK"

            : "🔥 SKILL";

}


/* =========================================================
   COMBAT INFO
========================================================= */

function updateCombatInfo() {

    const playerPower =
        document.getElementById(
            "combat-player-power"
        );


    const enemyPower =
        document.getElementById(
            "combat-enemy-power"
        );


    if (
        playerPower &&
        typeof calculateAtk ===
        "function"
    ) {

        playerPower.innerText =
            calculateAtk();

    }


    if (enemyPower) {

        if (
            p.curEn &&
            typeof getCurrentEnemyPower ===
            "function"
        ) {

            enemyPower.innerText =
                getCurrentEnemyPower();

        }

        else if (
            p.curEn
        ) {

            enemyPower.innerText =
                p.curEn.pwr ||
                p.curEn.power ||
                0;

        }

        else {

            enemyPower.innerText =
                "-";

        }

    }

}


/* =========================================================
   LOG SYSTEM
========================================================= */

function log(
    message,
    color = "white"
) {

    const logPanel =
        document.getElementById(
            "game-log"
        );


    if (!logPanel) {
        return;
    }


    const entry =
        document.createElement(
            "div"
        );


    entry.className =
        "log-entry";


    entry.style.color =
        color;


    entry.innerText =
        `> ${message}`;


    logPanel.appendChild(
        entry
    );


    /*
     * Scroll to latest message.
     */

    logPanel.scrollTop =
        logPanel.scrollHeight;

}


/* =========================================================
   DEATH
========================================================= */

function triggerDeath(
    reason
) {

    if (p.gameOver) {
        return;
    }


    p.gameOver =
        true;


    p.curEn =
        null;


    /*
     * Stop BGM.
     */

    if (
        typeof stopBGM ===
        "function"
    ) {

        stopBGM();

    }


    /*
     * Death sound.
     */

    if (
        typeof sfx !== "undefined" &&
        typeof sfx.death === "function"
    ) {

        sfx.death();

    }


    /*
     * Disable controls.
     */

    document
        .querySelectorAll(
            ".control-group button"
        )
        .forEach(button => {

            button.disabled =
                true;

        });


    /*
     * Death reason.
     */

    const reasonUI =
        document.getElementById(
            "death-reason"
        );


    if (reasonUI) {

        reasonUI.innerText =
            reason;

    }


    /*
     * Show death screen.
     */

    const deathScreen =
        document.getElementById(
            "death-screen"
        );


    if (deathScreen) {

        deathScreen.style.display =
            "flex";

    }


    log(
        `💀 ${reason}`,
        "var(--red)"
    );

}


/* =========================================================
   VICTORY
========================================================= */

function triggerVictory() {

    if (p.gameOver) {
        return;
    }


    p.gameOver =
        true;


    p.curEn =
        null;


    /*
     * Stop BGM.
     */

    if (
        typeof stopBGM ===
        "function"
    ) {

        stopBGM();

    }


    /*
     * Victory sound.
     */

    if (
        typeof sfx !== "undefined" &&
        typeof sfx.victory ===
        "function"
    ) {

        sfx.victory();

    }


    /*
     * Disable controls.
     */

    document
        .querySelectorAll(
            ".control-group button"
        )
        .forEach(button => {

            button.disabled =
                true;

        });


    /*
     * Show victory screen.
     */

    const winScreen =
        document.getElementById(
            "win-screen"
        );


    if (winScreen) {

        winScreen.style.display =
            "flex";

    }


    log(
        "🏆 LORD MUNCHING HAS FALLEN!",
        "var(--gold)"
    );

}


/* =========================================================
   RESET GAME STATE
========================================================= */

function resetGameState() {

    p = {

        race: "",

        lvl: 1,

        baseAtk: 0,

        inv: [],

        skillUsed: false,

        skillActive: false,

        curEn: null,

        pendingItem: null,

        gameOver: false

    };


    updateUI();

}


/* =========================================================
   INITIAL UI SETUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Hide controls until race is selected.
         */

        document
            .querySelectorAll(
                ".control-group"
            )
            .forEach(group => {

                group.style.display =
                    "none";

            });


        /*
         * Show start screen.
         */

        const overlay =
            document.getElementById(
                "overlay"
            );


        if (overlay) {

            overlay.style.display =
                "flex";

        }


        /*
         * Initial UI.
         */

        updateUI();

    }
);
