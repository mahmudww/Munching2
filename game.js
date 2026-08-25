/* =========================================================
   MUNCHING 2
   game.js
   Main Game State + UI Controller
   ========================================================= */


/* =========================================================
   GAME STATE
   ========================================================= */

const game = {
    race: null,

    level: 1,

    baseAtk: 0,

    inventory: [],

    currentEnemy: null,

    currentEvent: null,

    pendingItem: null,

    skillUsed: false,

    skillActive: false,

    gameOver: false,

    victory: false,

    turnLocked: false
};


/* =========================================================
   GAME CONFIG
   ========================================================= */

const GAME_CONFIG = {

    maxInventory: 5,

    startingLevel: 1,

    maxLevel: 10,

    run: {
        normalSuccessPenalty: 1,
        bossSuccessPenalty: 2,
        failurePenalty: 3
    },

    races: {

        Orc: {
            baseAtk: 5,

            icon: "👹",

            color: "var(--red)",

            skillName: "Berserk",

            skillDescription: "Double total attack for one attack."
        },

        Elf: {
            baseAtk: 2,

            icon: "🧝",

            color: "var(--blue)",

            skillName: "Swift Step",

            skillDescription: "Gain +1 to escape rolls."
        },

        Dwarf: {
            baseAtk: 2,

            icon: "🧔",

            color: "var(--gold)",

            skillName: "Forge Master",

            skillDescription: "Items provide additional attack."
        }
    }
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


function setText(id, value) {

    const element = $(id);

    if (element) {
        element.textContent = value;
    }
}


function show(id) {

    const element = $(id);

    if (element) {
        element.style.display = "flex";
    }
}


function hide(id) {

    const element = $(id);

    if (element) {
        element.style.display = "none";
    }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initGame(race) {

    if (!GAME_CONFIG.races[race]) {
        console.error("Unknown race:", race);
        return;
    }

    const raceData = GAME_CONFIG.races[race];

    game.race = race;

    game.level = GAME_CONFIG.startingLevel;

    game.baseAtk = raceData.baseAtk;

    game.inventory = [];

    game.currentEnemy = null;

    game.currentEvent = null;

    game.pendingItem = null;

    game.skillUsed = false;

    game.skillActive = false;

    game.gameOver = false;

    game.victory = false;

    game.turnLocked = false;


    /* Resume audio after user interaction */

    if (
        typeof audioCtx !== "undefined" &&
        audioCtx.state === "suspended"
    ) {
        audioCtx.resume();
    }


    if (typeof startBGM === "function") {
        startBGM();
    }


    /* Hide start screen */

    hide("overlay");


    /* Update UI */

    updateUI();

    updateSkillButton();

    updateArenaLevel();

    updateMobileHUD();


    /* Show first door */

    resetArena();


    /* Log */

    log(
        `⚔️ ${race} begins the adventure!`,
        raceData.color
    );

    log(
        `🚪 You are standing before Level ${game.level}.`,
        "#aaa"
    );
}


/* =========================================================
   UI UPDATE
   ========================================================= */

function updateUI() {

    updatePlayerInfo();

    updateStats();

    updateInventory();

    updateSkillButton();

    updateArenaLevel();

    updateMobileHUD();
}


/* =========================================================
   PLAYER INFO
   ========================================================= */

function updatePlayerInfo() {

    if (!game.race) {
        return;
    }

    const raceData = GAME_CONFIG.races[game.race];

    setText(
        "ui-race",
        game.race.toUpperCase()
    );

    const avatar = $("player-avatar");

    if (avatar) {
        avatar.textContent = raceData.icon;
    }
}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    const attack = calculateAttack();

    setText(
        "ui-level",
        game.level
    );

    setText(
        "ui-atk",
        attack
    );
}


/* =========================================================
   MOBILE HUD
   ========================================================= */

function updateMobileHUD() {

    setText(
        "mobile-level",
        game.level
    );

    setText(
        "mobile-atk",
        calculateAttack()
    );

    setText(
        "mobile-inventory",
        `${game.inventory.length}/${GAME_CONFIG.maxInventory}`
    );
}


/* =========================================================
   ARENA LEVEL
   ========================================================= */

function updateArenaLevel() {

    const element = $("arena-level");

    if (!element) {
        return;
    }

    element.textContent =
        `LEVEL ${game.level}`;
}


/* =========================================================
   INVENTORY
   ========================================================= */

function updateInventory() {

    const containers = [
        $("ui-inv"),
        $("inventory-container")
    ];

    const countElement = $("inventory-count");

    if (countElement) {

        countElement.textContent =
            `${game.inventory.length}/${GAME_CONFIG.maxInventory}`;
    }


    containers.forEach(container => {

        if (!container) {
            return;
        }


        if (game.inventory.length === 0) {

            container.innerHTML = `
                <div class="inv-empty">
                    Empty
                </div>
            `;

            return;
        }


        container.innerHTML =
            game.inventory
                .map((item, index) => {

                    return `
                        <div
                            class="inv-slot"
                            data-index="${index}"
                        >
                            <span>
                                ${item.e}
                                ${item.n}
                            </span>

                            <span>
                                +${item.p}
                            </span>
                        </div>
                    `;
                })
                .join("");
    });
}


/* =========================================================
   ATTACK CALCULATION
   ========================================================= */

function calculateAttack() {

    let total =
        game.level +
        game.baseAtk;


    /*
     * Every inventory item contributes
     * its power.
     */

    game.inventory.forEach(item => {

        let itemPower = item.p;


        /*
         * Dwarf passive:
         * additional +1 attack per item.
         */

        if (game.race === "Dwarf") {
            itemPower += 1;
        }


        total += itemPower;
    });


    /*
     * Active skills.
     */

    if (game.skillActive) {

        /*
         * Orc:
         * DOUBLE TOTAL ATTACK.
         */

        if (game.race === "Orc") {

            total *= 2;
        }


        /*
         * Dwarf:
         * additional bonus based on
         * inventory size.
         */

        else if (game.race === "Dwarf") {

            total +=
                game.inventory.length * 3;
        }
    }


    return Math.floor(total);
}


/* =========================================================
   SKILL
   ========================================================= */

function useSkill() {

    if (game.gameOver || game.victory) {
        return;
    }

    if (game.turnLocked) {
        return;
    }

    if (game.skillUsed) {

        log(
            "⚠️ Skill has already been used this turn.",
            "#888"
        );

        return;
    }


    game.skillUsed = true;

    game.skillActive = true;


    const raceData =
        GAME_CONFIG.races[game.race];


    log(
        `🔥 ${raceData.skillName} activated!`,
        "var(--purple)"
    );


    if (game.race === "Orc") {

        log(
            `💥 Attack doubled: ${calculateAttack()} ATK`,
            "var(--bright-green)"
        );
    }


    else if (game.race === "Elf") {

        log(
            "👟 Escape rolls gain +1 this turn.",
            "var(--blue)"
        );
    }


    else if (game.race === "Dwarf") {

        log(
            `🔨 Item bonus activated: +${game.inventory.length * 3} ATK`,
            "var(--gold)"
        );
    }


    updateUI();
}


/* =========================================================
   SKILL BUTTON
   ========================================================= */

function updateSkillButton() {

    const button = $("skill-btn");

    if (!button) {
        return;
    }


    if (!game.race) {

        button.disabled = true;

        return;
    }


    const raceData =
        GAME_CONFIG.races[game.race];


    button.textContent =
        `🔥 ${raceData.skillName.toUpperCase()}`;


    button.title =
        raceData.skillDescription;


    button.disabled =
        game.skillUsed ||
        game.turnLocked ||
        game.gameOver ||
        game.victory;


    if (game.skillUsed) {

        button.style.opacity = "0.45";

        button.style.cursor = "not-allowed";

    } else {

        button.style.opacity = "1";

        button.style.cursor = "pointer";
    }
}


/* =========================================================
   CONTROL GROUP
   ========================================================= */

function showControls(groupId) {

    document
        .querySelectorAll(".control-group")
        .forEach(element => {

            element.style.display = "none";
        });


    const target =
        $(groupId);

    if (!target) {
        return;
    }


    target.style.display = "grid";
}


/* =========================================================
   DOOR
   ========================================================= */

function openDoor() {

    if (game.gameOver || game.victory) {
        return;
    }

    if (game.turnLocked) {
        return;
    }


    game.turnLocked = true;

    game.currentEnemy = null;

    game.currentEvent = null;


    updateUI();


    /*
     * Boss levels
     */

    if (game.level === 3) {

        if (typeof spawnBoss === "function") {

            spawnBoss(
                "Kargath the Gatekeeper",
                20,
                "👹"
            );
        }

        return;
    }


    if (game.level === 6) {

        const boss =
            Math.random() > 0.5

                ? {
                    n: "Xenomorph Queen",
                    p: 40,
                    i: "👽"
                }

                : {
                    n: "Void Reaver",
                    p: 45,
                    i: "👻"
                };


        if (typeof spawnBoss === "function") {

            spawnBoss(
                boss.n,
                boss.p,
                boss.i
            );
        }

        return;
    }


    if (game.level === 10) {

        if (typeof spawnBoss === "function") {

            spawnBoss(
                "LORD MUNCHING",
                85,
                "🐲"
            );
        }

        return;
    }


    /*
     * Normal random event.
     */

    const rng =
        Math.random();


    if (rng < 0.45) {

        if (typeof spawnMonster === "function") {
            spawnMonster();
        }

    } else if (rng < 0.70) {

        if (typeof spawnTrap === "function") {
            spawnTrap();
        }

    } else {

        if (typeof spawnLoot === "function") {
            spawnLoot();
        }
    }
}


/* =========================================================
   SET CURRENT EVENT
   ========================================================= */

function setCurrentEnemy(enemy) {

    game.currentEnemy = enemy;

    game.currentEvent = "combat";
}


function setCurrentEvent(type) {

    game.currentEvent = type;
}


/* =========================================================
   COMBAT STATE
   ========================================================= */

function beginCombat(enemy) {

    setCurrentEnemy(enemy);

    game.turnLocked = false;

    game.skillUsed = false;

    game.skillActive = false;

    updateUI();

    showControls("group-combat");

    updateSkillButton();
}


/* =========================================================
   END TURN
   ========================================================= */

function endTurn() {

    if (game.gameOver || game.victory) {
        return;
    }


    game.skillActive = false;

    game.skillUsed = false;

    game.turnLocked = false;

    game.currentEnemy = null;

    game.currentEvent = null;


    updateUI();

    updateSkillButton();

    showControls("group-next");
}


/* =========================================================
   RESET ARENA
   ========================================================= */

function resetArena() {

    if (game.gameOver || game.victory) {
        return;
    }


    game.turnLocked = false;

    game.skillUsed = false;

    game.skillActive = false;

    game.currentEnemy = null;

    game.currentEvent = null;


    const display =
        $("event-display");


    if (display) {

        display.innerHTML = `
            <div class="card idle-card">

                <span class="m-icon">
                    🚪
                </span>

                <h2>
                    Level ${game.level}
                </h2>

                <p>
                    Something awaits behind the door...
                </p>

            </div>
        `;
    }


    updateArenaLevel();

    updateSkillButton();

    showControls("group-door");
}


/* =========================================================
   LEVEL MANAGEMENT
   ========================================================= */

function changeLevel(amount) {

    game.level += amount;


    /*
     * Never allow level below 1
     * unless death is handled separately.
     */

    if (game.level < 1) {
        game.level = 0;
    }


    updateUI();
}


/* =========================================================
   DEATH
   ========================================================= */

function triggerDeath(reason) {

    if (game.gameOver) {
        return;
    }


    game.gameOver = true;

    game.turnLocked = true;

    game.skillActive = false;


    if (typeof sfx !== "undefined" &&
        sfx.death) {

        sfx.death();
    }


    const reasonElement =
        $("death-reason");


    if (reasonElement) {
        reasonElement.textContent =
            reason;
    }


    show("death-screen");


    updateSkillButton();


    log(
        `💀 ${reason}`,
        "var(--red)"
    );
}


/* =========================================================
   VICTORY
   ========================================================= */

function triggerVictory() {

    if (game.victory) {
        return;
    }


    game.victory = true;

    game.turnLocked = true;

    game.skillActive = false;


    show("win-screen");


    updateSkillButton();


    log(
        "🏆 LORD MUNCHING HAS FALLEN!",
        "var(--gold)"
    );
}


/* =========================================================
   LOG
   ========================================================= */

function log(message, color = "#eee") {

    const container =
        $("game-log");


    if (!container) {
        return;
    }


    const entry =
        document.createElement("div");


    entry.className =
        "log-entry";


    entry.style.color =
        color;


    entry.textContent =
        `> ${message}`;


    container.appendChild(entry);


    container.scrollTop =
        container.scrollHeight;
}


/* =========================================================
   MOBILE LOG TOGGLE
   ========================================================= */

function toggleLog() {

    const wrapper =
        document.querySelector(
            ".log-panel-wrapper"
        );


    if (!wrapper) {
        return;
    }


    wrapper.classList.toggle(
        "log-open"
    );
}


/* =========================================================
   SWAP SCREEN
   ========================================================= */

function showSwapScreen(item) {

    game.pendingItem =
        item;


    setText(
        "new-item-name",
        `${item.e}${item.n} (+${item.p})`
    );


    const list =
        $("swap-list");


    if (!list) {
        return;
    }


    list.innerHTML =
        game.inventory
            .map((existingItem, index) => {

                return `
                    <div
                        class="inv-slot selectable"
                        onclick="confirmSwap(${index})"
                    >

                        <span>
                            ${existingItem.e}
                            ${existingItem.n}
                            (+${existingItem.p})
                        </span>

                        <span>
                            🔄
                        </span>

                    </div>
                `;
            })
            .join("");


    show("swap-screen");
}


/* =========================================================
   CONFIRM SWAP
   ========================================================= */

function confirmSwap(index) {

    if (!game.pendingItem) {
        return;
    }


    if (
        index < 0 ||
        index >= game.inventory.length
    ) {
        return;
    }


    const oldItem =
        game.inventory[index];


    const newItem =
        game.pendingItem;


    game.inventory[index] =
        newItem;


    game.pendingItem =
        null;


    hide("swap-screen");


    log(
        `🔄 Replaced ${oldItem.n} with ${newItem.n}!`,
        "var(--gold)"
    );


    updateUI();

    endTurn();
}


/* =========================================================
   CANCEL SWAP
   ========================================================= */

function cancelSwap() {

    game.pendingItem =
        null;


    hide("swap-screen");


    log(
        "🗑️ New item discarded.",
        "#888"
    );


    endTurn();
}


/* =========================================================
   RANDOM ITEM REMOVAL
   ========================================================= */

function removeRandomItem() {

    if (game.inventory.length === 0) {

        log(
            "🎒 Inventory is already empty.",
            "#777"
        );

        return null;
    }


    const index =
        Math.floor(
            Math.random() *
            game.inventory.length
        );


    const removed =
        game.inventory.splice(
            index,
            1
        )[0];


    updateUI();


    return removed;
}


/* =========================================================
   CLEAR INVENTORY
   ========================================================= */

function clearInventory() {

    const amount =
        game.inventory.length;


    game.inventory = [];


    updateUI();


    return amount;
}


/* =========================================================
   RUN PENALTY
   ========================================================= */

function applyRunPenalty(type) {

    /*
     * type:
     *
     * "failure"
     * "normal"
     * "boss"
     */


    if (type === "failure") {

        changeLevel(
            -GAME_CONFIG.run.failurePenalty
        );

        return;
    }


    if (type === "boss") {

        changeLevel(
            -GAME_CONFIG.run.bossSuccessPenalty
        );

        return;
    }


    changeLevel(
        -GAME_CONFIG.run.normalSuccessPenalty
    );
}


/* =========================================================
   CHECK DEATH
   ========================================================= */

function checkLevelDeath(reason) {

    if (game.level <= 0) {

        triggerDeath(
            reason
        );

        return true;
    }


    return false;
}


/* =========================================================
   ESCAPE ROLL MODIFIER
   ========================================================= */

function getRunRollModifier() {

    if (game.race === "Elf") {
        return 1;
    }


    return 0;
}


/* =========================================================
   ENEMY TYPE
   ========================================================= */

function isBossEnemy() {

    if (!game.currentEnemy) {
        return false;
    }


    return (
        game.currentEnemy.isBoss === true
    );
}


/* =========================================================
   RESET TURN STATE
   ========================================================= */

function resetTurnState() {

    game.skillUsed = false;

    game.skillActive = false;

    game.turnLocked = false;

    updateUI();
}


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateUI();

        updateSkillButton();

        /*
         * Make sure the log starts closed
         * on mobile.
         */

        const logWrapper =
            document.querySelector(
                ".log-panel-wrapper"
            );


        if (
            logWrapper &&
            window.innerWidth <= 767
        ) {

            logWrapper.classList.remove(
                "log-open"
            );
        }
    }
);


/* =========================================================
   GLOBAL COMPATIBILITY
   ========================================================= */

/*
 * These aliases make it easier for
 * combat.js / enemies.js / item.js
 * to interact with the central state.
 */

window.game = game;

window.GAME_CONFIG =
    GAME_CONFIG;

window.calculateAtk =
    calculateAttack;

window.calculateAttack =
    calculateAttack;

window.updateUI =
    updateUI;

window.showControls =
    showControls;

window.endTurn =
    endTurn;

window.resetArena =
    resetArena;

window.triggerDeath =
    triggerDeath;

window.triggerVictory =
    triggerVictory;

window.changeLevel =
    changeLevel;

window.log =
    log;

window.beginCombat =
    beginCombat;

window.setCurrentEnemy =
    setCurrentEnemy;

window.setCurrentEvent =
    setCurrentEvent;

window.useSkill =
    useSkill;

window.openDoor =
    openDoor;

window.confirmSwap =
    confirmSwap;

window.cancelSwap =
    cancelSwap;

window.showSwapScreen =
    showSwapScreen;

window.removeRandomItem =
    removeRandomItem;

window.clearInventory =
    clearInventory;

window.applyRunPenalty =
    applyRunPenalty;

window.checkLevelDeath =
    checkLevelDeath;

window.getRunRollModifier =
    getRunRollModifier;

window.isBossEnemy =
    isBossEnemy;

window.toggleLog =
    toggleLog;
