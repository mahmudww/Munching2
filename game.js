/* =========================================================
   MUNCHING 2
   GAME.JS
========================================================= */


/* =========================================================
   AUDIO ENGINE
========================================================= */

let audioCtx = null;
let bgmStarted = false;
let bgmInterval = null;


function initAudio() {
    if (!audioCtx) {
        audioCtx = new (
            window.AudioContext ||
            window.webkitAudioContext
        )();
    }

    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}


function playNote(freq, type, duration, vol) {
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;

    osc.frequency.setValueAtTime(
        freq,
        audioCtx.currentTime
    );

    gain.gain.setValueAtTime(
        vol,
        audioCtx.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();

    osc.stop(
        audioCtx.currentTime + duration
    );
}


const sfx = {

    attack: () => {
        initAudio();

        playNote(
            150,
            "square",
            0.2,
            0.08
        );

        setTimeout(() => {
            playNote(
                100,
                "sawtooth",
                0.25,
                0.08
            );
        }, 50);
    },


    loot: () => {
        initAudio();

        playNote(
            880,
            "sine",
            0.1,
            0.1
        );

        setTimeout(() => {
            playNote(
                1320,
                "sine",
                0.2,
                0.1
            );
        }, 100);
    },


    trap: () => {
        initAudio();

        playNote(
            200,
            "sawtooth",
            0.4,
            0.1
        );

        setTimeout(() => {
            playNote(
                150,
                "sawtooth",
                0.4,
                0.08
            );
        }, 120);
    },


    run: () => {
        initAudio();

        playNote(
            440,
            "triangle",
            0.1,
            0.05
        );
    },


    success: () => {
        initAudio();

        playNote(
            660,
            "sine",
            0.12,
            0.08
        );

        setTimeout(() => {
            playNote(
                880,
                "sine",
                0.2,
                0.08
            );
        }, 120);
    },


    death: () => {
        initAudio();

        [
            300,
            250,
            200,
            150
        ].forEach((freq, i) => {

            setTimeout(() => {
                playNote(
                    freq,
                    "sawtooth",
                    0.5,
                    0.1
                );
            }, i * 150);

        });
    },


    victory: () => {
        initAudio();

        const notes = [
            523,
            659,
            784,
            1046
        ];

        notes.forEach((freq, i) => {

            setTimeout(() => {
                playNote(
                    freq,
                    "sine",
                    0.35,
                    0.08
                );
            }, i * 150);

        });
    }
};


function startBGM() {

    if (bgmStarted) return;

    bgmStarted = true;

    const notes = [
        261.63,
        329.63,
        392.00,
        329.63
    ];

    let i = 0;

    bgmInterval = setInterval(() => {

        if (!audioCtx) return;

        playNote(
            notes[i % notes.length] / 2,
            "triangle",
            0.5,
            0.018
        );

        i++;

    }, 700);
}


/* =========================================================
   GAME DATA
========================================================= */

const PREFIXES = [

    "💢 Angry",
    "🤢 Toxic",
    "❄️ Frozen",
    "🔥 Blazing",
    "💀 Cursed",
    "🌪️ Swift",
    "💎 Ancient",
    "🧬 Mutant",
    "🌑 Shadow",
    "🔱 Elite"

];


const SPECIES = [

    {
        n: "Slime",
        i: "🧪"
    },

    {
        n: "Goblin",
        i: "👺"
    },

    {
        n: "Spider",
        i: "🕷️"
    },

    {
        n: "Skeleton",
        i: "💀"
    },

    {
        n: "Bat",
        i: "🦇"
    },

    {
        n: "Wolf",
        i: "🐺"
    },

    {
        n: "Zombie",
        i: "🧟"
    },

    {
        n: "Rat",
        i: "🐀"
    },

    {
        n: "Cobra",
        i: "🐍"
    },

    {
        n: "Ghost",
        i: "👻"
    }

];


const ITEMS_BASE = [

    {
        id: "sword",
        n: "Sword",
        e: "⚔️",
        p: 4
    },

    {
        id: "shield",
        n: "Shield",
        e: "🛡️",
        p: 3
    },

    {
        id: "axe",
        n: "Axe",
        e: "🪓",
        p: 5
    },

    {
        id: "wand",
        n: "Wand",
        e: "🪄",
        p: 6
    },

    {
        id: "ring",
        n: "Ring",
        e: "💍",
        p: 4
    }

];


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
   RACE CONFIG
========================================================= */

const RACE_CONFIG = {

    Orc: {

        baseAtk: 5,

        escapeBonus: 0

    },

    Elf: {

        /*
         * Elf gets a small early-game advantage.
         *
         * +2 Base ATK
         * +1 Escape roll
         * +1 additional starting level
         *
         * The extra level is the main balancing factor
         * because Elf has the weakest raw ATK.
         */

        baseAtk: 2,

        escapeBonus: 1

    },

    Dwarf: {

        baseAtk: 2,

        escapeBonus: 0

    }

};


/* =========================================================
   UI HELPERS
========================================================= */

function showControls(groupId) {

    document
        .querySelectorAll(".control-group")
        .forEach(element => {

            element.style.display = "none";

        });


    const target =
        document.getElementById(groupId);

    if (target) {
        target.style.display = "grid";
    }

}


function setEventHTML(html) {

    const display =
        document.getElementById("event-display");

    if (!display) return;

    display.innerHTML = html;

}


function updateArenaLevel() {

    const arenaLevel =
        document.getElementById("arena-level");

    if (arenaLevel) {
        arenaLevel.innerText =
            Math.max(1, p.lvl);
    }

}


function updateSkillUI() {

    const status =
        document.getElementById("ui-skill-status");

    const button =
        document.getElementById("skill-btn");


    if (!status || !button) return;


    if (p.skillActive) {

        status.innerText = "ACTIVE";

        status.style.color =
            "var(--purple)";

        button.disabled = true;

        button.classList.remove("ready");

    }

    else if (p.skillUsed) {

        status.innerText = "USED";

        status.style.color =
            "#666";

        button.disabled = true;

        button.classList.remove("ready");

    }

    else {

        status.innerText = "READY";

        status.style.color =
            "var(--green)";

        button.disabled = false;

        button.classList.add("ready");

    }

}


/* =========================================================
   INITIALIZE GAME
========================================================= */

function initGame(race) {

    initAudio();

    startBGM();


    const config =
        RACE_CONFIG[race];


    if (!config) return;


    p.race = race;

    p.baseAtk =
        config.baseAtk;

    /*
     * Elf gets a slight starting advantage.
     *
     * This is intentionally small so Elf isn't
     * stronger than Orc, but doesn't instantly die
     * in the first few encounters.
     */

    p.lvl =
        race === "Elf"
            ? 2
            : 1;


    p.inv = [];

    p.skillUsed = false;

    p.skillActive = false;

    p.curEn = null;

    p.pendingItem = null;

    p.gameOver = false;


    document
        .getElementById("overlay")
        .style.display = "none";


    document
        .getElementById("ui-race")
        .innerText =
        race.toUpperCase();


    updateUI();

    resetArena();

    showControls(
        "group-door"
    );


    log(
        `🚪 Adventure begins! You are an ${race}.`,
        "white"
    );


    if (race === "Elf") {

        log(
            "🧝 Elf starts at Level 2 and gets +1 Escape Roll.",
            "var(--blue)"
        );

    }

    if (race === "Orc") {

        log(
            "👹 Orc starts with +5 Base ATK and Berserk.",
            "var(--red)"
        );

    }

    if (race === "Dwarf") {

        log(
            "🧔 Dwarf gains +1 ATK from every inventory item.",
            "var(--gold)"
        );

    }

}


/* =========================================================
   DOOR
========================================================= */

function openDoor() {

    if (p.gameOver) return;


    if (p.lvl <= 0) {

        triggerDeath(
            "You have reached Level 0."
        );

        return;

    }


    /*
     * Boss floors
     */

    if (p.lvl === 3) {

        spawnBoss(
            "🛡️ Kargath the Gatekeeper",
            18,
            "👹"
        );

        return;

    }


    if (p.lvl === 6) {

        const boss =
            Math.random() > 0.5

                ? {
                    n: "👑 Xenomorph Queen",
                    p: 32,
                    i: "👽"
                }

                : {
                    n: "🌌 Void Reaver",
                    p: 36,
                    i: "👻"
                };


        spawnBoss(
            boss.n,
            boss.p,
            boss.i
        );

        return;

    }


    if (p.lvl === 10) {

        spawnBoss(
            "👑 LORD MUNCHING",
            75,
            "🐲"
        );

        return;

    }


    /*
     * Normal event
     */

    const rng =
        Math.random();


    if (rng < 0.45) {

        spawnMonster();

    }

    else if (rng < 0.68) {

        spawnTrap();

    }

    else {

        spawnLoot();

    }

}


/* =========================================================
   NORMAL MONSTER
========================================================= */

function spawnMonster() {

    const spec =
        SPECIES[
            Math.floor(
                Math.random() *
                SPECIES.length
            )
        ];


    /*
     * Early-game balancing.
     *
     * Old formula could produce monsters that
     * were too strong for Elf/Dwarf.
     *
     * New formula:
     *
     * Level 1 -> roughly 4-7
     * Level 2 -> roughly 6-9
     * Level 3 -> boss floor
     */

    const minPower =
        3 + (p.lvl * 2.2);

    const power =
        Math.floor(
            minPower +
            Math.random() * 3
        );


    const prefix =
        PREFIXES[
            Math.floor(
                Math.random() *
                PREFIXES.length
            )
        ];


    p.curEn = {

        n: `${prefix} ${spec.n}`,

        pwr: power,

        i: spec.i,

        boss: false

    };


    setEventHTML(`

        <div class="card monster">

            <span class="m-icon">
                ${spec.i}
            </span>

            <h2 style="color: var(--red)">
                ${p.curEn.n}
            </h2>

            <h3>
                Power: ${power}
            </h3>

        </div>

    `);


    showControls(
        "group-combat"
    );


    log(
        `👾 ${p.curEn.n} appeared! Power ${power}.`,
        "var(--red)"
    );


    updateUI();

}


/* =========================================================
   BOSS
========================================================= */

function spawnBoss(
    name,
    power,
    icon
) {

    p.curEn = {

        n: name,

        pwr: power,

        i: icon,

        boss: true

    };


    setEventHTML(`

        <div class="card boss">

            <span class="m-icon">
                ${icon}
            </span>

            <h2 style="color: var(--purple)">
                ${name}
            </h2>

            <h3 style="font-size: 2rem">
                Power: ${power}
            </h3>

        </div>

    `);


    showControls(
        "group-combat"
    );


    log(
        `🔥 BOSS ${name} HAS APPEARED! Power ${power}.`,
        "var(--purple)"
    );


    updateUI();

}


/* =========================================================
   ATTACK
========================================================= */

function handleFight() {

    if (
        p.gameOver ||
        !p.curEn
    ) return;


    sfx.attack();


    const attack =
        calculateAtk();


    const enemyPower =
        p.curEn.pwr;


    log(
        `⚔️ You attack with ${attack} Power against ${enemyPower}.`,
        "white"
    );


    /*
     * IMPORTANT:
     *
     * Skill multiplier is already included
     * inside calculateAtk().
     *
     * Therefore we compare the calculated
     * attack directly against enemy power.
     *
     * This fixes the previous Berserk bug.
     */

    if (attack >= enemyPower) {

        handleVictory();

    }

    else {

        handleCombatLoss();

    }

}


/* =========================================================
   WIN COMBAT
========================================================= */

function handleVictory() {

    const enemyIcon =
        document.querySelector(
            ".m-icon"
        );


    if (enemyIcon) {

        enemyIcon.classList.add(
            "dead-icon"
        );

    }


    log(
        `✅ Defeated ${p.curEn.n}!`,
        "var(--bright-green)"
    );


    /*
     * LORD MUNCHING
     */

    if (
        p.lvl >= 10 &&
        p.curEn.boss
    ) {

        p.gameOver = true;

        sfx.victory();

        setTimeout(() => {

            document
                .getElementById(
                    "win-screen"
                )
                .style.display = "flex";

        }, 700);

        return;

    }


    /*
     * Normal victory:
     * +1 level
     */

    p.lvl += 1;


    /*
     * Orc Berserk drawback.
     *
     * Berserk doubles ATK for the attack,
     * but costs 2 levels after winning.
     *
     * This happens AFTER the attack,
     * so Berserk can never cause the
     * attack itself to fail.
     */

    if (
        p.race === "Orc" &&
        p.skillActive
    ) {

        p.lvl -= 2;

        log(
            "🔥 Berserk consumed 2 levels.",
            "var(--purple)"
        );

    }


    if (p.lvl <= 0) {

        triggerDeath(
            "You collapsed from exhaustion."
        );

        return;

    }


    /*
     * Skill is always consumed after the action.
     */

    p.skillActive = false;

    p.skillUsed = false;


    updateUI();


    setTimeout(
        endTurn,
        600
    );

}


/* =========================================================
   COMBAT LOSS
========================================================= */

function handleCombatLoss() {

    log(
        `❌ You lost the fight against ${p.curEn.n}!`,
        "var(--red)"
    );


    /*
     * Failed combat:
     * -2 levels
     */

    p.lvl -= 2;


    /*
     * Skill is consumed even when attack fails.
     */

    p.skillActive = false;

    p.skillUsed = false;


    if (p.lvl <= 0) {

        triggerDeath(
            `You were defeated by ${p.curEn.n}.`
        );

        return;

    }


    updateUI();


    endTurn();

}


/* =========================================================
   RUN
========================================================= */

function handleRun() {

    if (
        p.gameOver ||
        !p.curEn
    ) return;


    /*
     * Prevent accidental double click.
     */

    const buttons =
        document.querySelectorAll(
            "#group-combat .btn"
        );


    buttons.forEach(button => {
        button.disabled = true;
    });


    /*
     * Show rolling screen
     */

    setEventHTML(`

        <div class="card">

            <div class="dice-roll">
                🎲
            </div>

            <p>
                ROLLING...
            </p>

        </div>

    `);


    showControls(
        "group-combat"
    );


    let rolls = 0;


    const interval =
        setInterval(() => {

            sfx.run();

            rolls++;


            if (rolls >= 6) {

                clearInterval(
                    interval
                );

            }

        }, 100);


    setTimeout(() => {

        const roll =
            Math.floor(
                Math.random() * 6
            ) + 1;


        /*
         * Elf gets +1 escape bonus.
         *
         * Maximum remains 6.
         */

        const finalRoll =
            Math.min(
                6,
                roll +
                (
                    p.race === "Elf"
                        ? 1
                        : 0
                )
            );


        showRunResult(
            roll,
            finalRoll
        );


    }, 750);

}


/* =========================================================
   RUN RESULT
========================================================= */

function showRunResult(
    rawRoll,
    finalRoll
) {

    const isBoss =
        p.curEn &&
        p.curEn.boss;


    const runResult =
        document.getElementById(
            "run-result"
        );


    const runDice =
        document.getElementById(
            "run-dice"
        );


    const runText =
        document.getElementById(
            "run-result-text"
        );


    if (runResult) {

        runResult.style.display =
            "block";

    }


    if (runDice) {

        runDice.innerText =
            `🎲 ${finalRoll}`;

    }


    /*
     * 1-2
     *
     * FAIL
     * Level -3
     * Lose ALL inventory
     */

    if (finalRoll <= 2) {

        if (runText) {

            runText.innerText =
                "❌ FAILED TO ESCAPE!";

            runText.style.color =
                "var(--red)";

        }


        log(
            `🎲 Roll: ${rawRoll}${p.race === "Elf" ? ` → ${finalRoll} (Elf +1)` : ""}`,
            "var(--gold)"
        );


        log(
            "❌ Escape failed! Level -3 and all inventory lost.",
            "var(--red)"
        );


        p.lvl -= 3;

        p.inv = [];


        p.skillActive = false;

        p.skillUsed = false;


        if (p.lvl <= 0) {

            setTimeout(() => {

                triggerDeath(
                    "You failed to escape and lost everything."
                );

            }, 700);

            return;

        }


        sfx.death();


        showRunCard(
            "💥",
            "ESCAPE FAILED!",
            "You lost 3 levels and all inventory.",
            "var(--red)"
        );


        updateUI();


        setTimeout(
            endTurn,
            900
        );


        return;

    }


    /*
     * 3-4
     *
     * SUCCESS
     * Lose 1 random item
     * Level -1 normal
     * Level -2 boss
     */

    if (
        finalRoll >= 3 &&
        finalRoll <= 4
    ) {

        const levelLoss =
            isBoss
                ? 2
                : 1;


        let lostItem = null;


        if (p.inv.length > 0) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    p.inv.length
                );


            lostItem =
                p.inv.splice(
                    randomIndex,
                    1
                )[0];

        }


        p.lvl -= levelLoss;


        p.skillActive = false;

        p.skillUsed = false;


        if (runText) {

            runText.innerText =
                "⚠️ ESCAPED — BUT LOST AN ITEM!";

            runText.style.color =
                "var(--orange)";

        }


        log(
            `🎲 Roll: ${rawRoll}${p.race === "Elf" ? ` → ${finalRoll} (Elf +1)` : ""}`,
            "var(--gold)"
        );


        if (lostItem) {

            log(
                `💔 Lost ${lostItem.n} during the escape.`,
                "var(--orange)"
            );

        }

        else {

            log(
                "🎒 No inventory item was available to lose.",
                "#777"
            );

        }


        log(
            `👟 Escaped! Level -${levelLoss}.`,
            "var(--green)"
        );


        if (p.lvl <= 0) {

            setTimeout(() => {

                triggerDeath(
                    "You escaped, but your journey ended at Level 0."
                );

            }, 700);

            return;

        }


        sfx.success();


        showRunCard(
            "🏃",
            "ESCAPED!",
            lostItem
                ? `Lost ${lostItem.e} ${lostItem.n}. Level -${levelLoss}.`
                : `No item lost. Level -${levelLoss}.`,
            "var(--orange)"
        );


        updateUI();


        setTimeout(
            endTurn,
            1000
        );


        return;

    }


    /*
     * 5-6
     *
     * SAFE ESCAPE
     * Normal -> -1 level
     * Boss -> -2 levels
     */

    if (finalRoll >= 5) {

        const levelLoss =
            isBoss
                ? 2
                : 1;


        p.lvl -= levelLoss;


        p.skillActive = false;

        p.skillUsed = false;


        if (runText) {

            runText.innerText =
                "✨ PERFECT ESCAPE!";

            runText.style.color =
                "var(--bright-green)";

        }


        log(
            `🎲 Roll: ${rawRoll}${p.race === "Elf" ? ` → ${finalRoll} (Elf +1)` : ""}`,
            "var(--gold)"
        );


        log(
            `✨ Escaped safely! Level -${levelLoss}.`,
            "var(--bright-green)"
        );


        if (p.lvl <= 0) {

            setTimeout(() => {

                triggerDeath(
                    "You escaped safely, but your journey ended at Level 0."
                );

            }, 700);

            return;

        }


        sfx.success();


        showRunCard(
            "🏃‍♂️",
            "SAFE ESCAPE!",
            `You escaped without losing any items. Level -${levelLoss}.`,
            "var(--bright-green)"
        );


        updateUI();


        setTimeout(
            endTurn,
            1000
        );

    }

}


/* =========================================================
   RUN CARD
========================================================= */

function showRunCard(
    icon,
    title,
    description,
    color
) {

    setEventHTML(`

        <div
            class="card"
            style="border-color: ${color};"
        >

            <span class="m-icon">
                ${icon}
            </span>

            <h2 style="color: ${color};">
                ${title}
            </h2>

            <p>
                ${description}
            </p>

        </div>

    `);

}


/* =========================================================
   TRAP
========================================================= */

function spawnTrap() {

    sfx.trap();


    const trapType =
        Math.floor(
            Math.random() * 3
        );


    let message = "";

    let visual = "";


    if (trapType === 0) {

        /*
         * Arrow Trap
         */

        p.lvl -= 1;

        message =
            "🏹 Arrow Trap! Level -1";

        visual = "🏹";

    }


    else if (trapType === 1) {

        /*
         * Void Portal
         */

        p.lvl = 1;

        message =
            "🌀 Void Portal! Back to Level 1";

        visual = "🌀";

    }


    else {

        /*
         * Shadow Thief
         */

        if (p.inv.length > 0) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    p.inv.length
                );


            const lost =
                p.inv.splice(
                    randomIndex,
                    1
                )[0];


            message =
                `👤 Shadow Thief! ${lost.n} stolen`;

        }

        else {

            message =
                "👤 Shadow Thief! But your inventory was empty.";

        }


        visual = "👤";

    }


    setEventHTML(`

        <div class="card trap">

            <span class="m-icon">
                ${visual}
            </span>

            <h2>
                ${message}
            </h2>

        </div>

    `);


    log(
        `⚠️ ${message}`,
        "var(--purple)"
    );


    if (p.lvl <= 0) {

        triggerDeath(
            "You were killed by a trap."
        );

        return;

    }


    updateUI();


    endTurn();

}


/* =========================================================
   LOOT
========================================================= */

function spawnLoot() {

    sfx.loot();


    const itemData =
        ITEMS_BASE[
            Math.floor(
                Math.random() *
                ITEMS_BASE.length
            )
        ];


    /*
     * Random item power.
     */

    const newItem = {

        ...itemData,

        p:
            itemData.p +
            Math.floor(
                Math.random() * 3
            ) +
            1

    };


    /*
     * Auto stacking
     */

    const existingIndex =
        p.inv.findIndex(
            item =>
                item.id === newItem.id
        );


    if (existingIndex !== -1) {

        p.inv[
            existingIndex
        ].p += newItem.p;


        log(
            `✨ ${newItem.n} stacked! +${newItem.p} Power.`,
            "var(--gold)"
        );


        setEventHTML(`

            <div class="card loot">

                <span class="m-icon">
                    🔨
                </span>

                <h2>
                    STACKED!
                </h2>

                <p>
                    ${newItem.e}
                    ${newItem.n}
                    +${newItem.p} Power
                </p>

            </div>

        `);


        updateUI();

        endTurn();

        return;

    }


    /*
     * Inventory full
     */

    if (p.inv.length >= 5) {

        p.pendingItem =
            newItem;


        document
            .getElementById(
                "new-item-name"
            )
            .innerText =
            `${newItem.e} ${newItem.n} (+${newItem.p})`;


        const list =
            document.getElementById(
                "swap-list"
            );


        list.innerHTML =
            p.inv
                .map(
                    (item, index) => `

                        <div
                            class="inv-slot"
                            onclick="confirmSwap(${index})"
                        >

                            <span>
                                ${item.e}
                                ${item.n}
                                (+${item.p})
                            </span>

                            <span>
                                🔄
                            </span>

                        </div>

                    `
                )
                .join("");


        document
            .getElementById(
                "swap-screen"
            )
            .style.display =
            "flex";


        return;

    }


    /*
     * Add new item
     */

    p.inv.push(
        newItem
    );


    log(
        `🎁 Found ${newItem.n} (+${newItem.p} Power)!`,
        "var(--gold)"
    );


    setEventHTML(`

        <div class="card loot">

            <span class="m-icon">
                🎁
            </span>

            <h2>
                FOUND LOOT!
            </h2>

            <p>
                ${newItem.e}
                ${newItem.n}
                (+${newItem.p})
            </p>

        </div>

    `);


    updateUI();

    endTurn();

}


/* =========================================================
   INVENTORY SWAP
========================================================= */

function confirmSwap(index) {

    if (!p.pendingItem) return;


    const oldItem =
        p.inv[index];


    p.inv[index] =
        p.pendingItem;


    p.pendingItem = null;


    document
        .getElementById(
            "swap-screen"
        )
        .style.display =
        "none";


    log(
        `🔄 Replaced ${oldItem.n} with ${p.inv[index].n}.`,
        "var(--gold)"
    );


    setEventHTML(`

        <div class="card loot">

            <span class="m-icon">
                🔄
            </span>

            <h2>
                ITEM REPLACED
            </h2>

        </div>

    `);


    updateUI();


    endTurn();

}


function cancelSwap() {

    p.pendingItem = null;


    document
        .getElementById(
            "swap-screen"
        )
        .style.display =
        "none";


    log(
        "🗑️ New item discarded.",
        "#777"
    );


    setEventHTML(`

        <div class="card loot">

            <span class="m-icon">
                🗑️
            </span>

            <h2>
                LOOT DISCARDED
            </h2>

        </div>

    `);


    endTurn();

}


/* =========================================================
   ATTACK CALCULATION
========================================================= */

function calculateAtk() {

    /*
     * Base:
     *
     * Level
     * +
     * Race Base ATK
     * +
     * Inventory Power
     */

    let itemPower =
        p.inv.reduce(
            (sum, item) => {

                let value =
                    item.p;


                /*
                 * Dwarf:
                 * +1 ATK per item
                 */

                if (
                    p.race === "Dwarf"
                ) {

                    value += 1;

                }


                return sum + value;

            },
            0
        );


    let total =
        p.lvl +
        p.baseAtk +
        itemPower;


    /*
     * ACTIVE SKILLS
     */

    if (p.skillActive) {

        /*
         * Orc:
         * DOUBLE TOTAL ATK
         */

        if (
            p.race === "Orc"
        ) {

            total *= 2;

        }


        /*
         * Dwarf:
         * Extra power based on inventory size
         */

        if (
            p.race === "Dwarf"
        ) {

            total +=
                p.inv.length * 2;

        }


        /*
         * Elf:
         *
         * Elf skill is defensive/escape-oriented,
         * so it does not increase attack.
         */

    }


    return Math.floor(
        total
    );

}


/* =========================================================
   USE SKILL
========================================================= */

function useSkill() {

    if (
        p.gameOver ||
        p.skillUsed
    ) return;


    p.skillActive = true;

    p.skillUsed = true;


    /*
     * Race-specific skill message
     */

    if (p.race === "Orc") {

        log(
            "🔥 BERSERK ACTIVATED! Attack power x2 for this action.",
            "var(--purple)"
        );

    }

    else if (p.race === "Elf") {

        log(
            "👟 WINDSTEP ACTIVATED! Your next escape gets +2 instead of +1.",
            "var(--blue)"
        );

    }

    else if (p.race === "Dwarf") {

        log(
            "🔨 FORGE FURY ACTIVATED! Bonus power from inventory.",
            "var(--gold)"
        );

    }


    updateUI();

}


/* =========================================================
   END TURN
========================================================= */

function endTurn() {

    /*
     * Skill is always reset after the action.
     */

    p.skillActive = false;

    p.skillUsed = false;


    p.curEn = null;


    const runResult =
        document.getElementById(
            "run-result"
        );


    if (runResult) {

        runResult.style.display =
            "none";

    }


    updateUI();


    if (!p.gameOver) {

        showControls(
            "group-next"
        );

    }

}


/* =========================================================
   RESET ARENA
========================================================= */

function resetArena() {

    if (p.gameOver) return;


    p.curEn = null;


    const runResult =
        document.getElementById(
            "run-result"
        );


    if (runResult) {

        runResult.style.display =
            "none";

    }


    setEventHTML(`

        <div class="card door-card">

            <span class="m-icon">
                🚪
            </span>

            <h2>
                Level ${p.lvl} Door
            </h2>

            <p>
                Something awaits beyond the door...
            </p>

        </div>

    `);


    showControls(
        "group-door"
    );


    updateUI();

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    const level =
        document.getElementById(
            "ui-level"
        );


    const attack =
        document.getElementById(
            "ui-atk"
        );


    const inventory =
        document.getElementById(
            "ui-inv"
        );


    const inventoryCount =
        document.getElementById(
            "ui-inv-count"
        );


    if (level) {

        level.innerText =
            Math.max(0, p.lvl);

    }


    if (attack) {

        attack.innerText =
            calculateAtk();

    }


    if (inventoryCount) {

        inventoryCount.innerText =
            `${p.inv.length} / 5`;

    }


    if (inventory) {

        if (p.inv.length === 0) {

            inventory.innerHTML = `

                <div class="inv-slot empty-slot">
                    Inventory Empty
                </div>

            `;

        }

        else {

            inventory.innerHTML =
                p.inv
                    .map(
                        item => `

                            <div class="inv-slot">

                                <span>
                                    ${item.e}
                                    ${item.n}
                                </span>

                                <span>
                                    +${item.p}
                                </span>

                            </div>

                        `
                    )
                    .join("");

        }

    }


    updateArenaLevel();

    updateSkillUI();

}


/* =========================================================
   LOG SYSTEM
========================================================= */

function log(
    message,
    color = "#aaa"
) {

    const logContainer =
        document.getElementById(
            "game-log"
        );


    if (!logContainer) return;


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


    logContainer.appendChild(
        entry
    );


    logContainer.scrollTop =
        logContainer.scrollHeight;

}


/* =========================================================
   DEATH
========================================================= */

function triggerDeath(reason) {

    if (p.gameOver) return;


    p.gameOver = true;


    p.skillActive = false;

    p.skillUsed = false;


    sfx.death();


    const screen =
        document.getElementById(
            "death-screen"
        );


    const reasonElement =
        document.getElementById(
            "death-reason"
        );


    if (reasonElement) {

        reasonElement.innerText =
            reason;

    }


    if (screen) {

        setTimeout(() => {

            screen.style.display =
                "flex";

        }, 350);

    }


    log(
        `💀 ${reason}`,
        "var(--red)"
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Don't trigger shortcuts while
         * typing in an input.
         */

        if (
            event.target.tagName ===
            "INPUT" ||
            event.target.tagName ===
            "TEXTAREA"
        ) {
            return;
        }


        /*
         * A = Attack
         */

        if (
            event.key.toLowerCase() === "a"
        ) {

            const combatGroup =
                document.getElementById(
                    "group-combat"
                );


            if (
                combatGroup &&
                combatGroup.style.display !== "none"
            ) {

                handleFight();

            }

        }


        /*
         * R = Run
         */

        if (
            event.key.toLowerCase() === "r"
        ) {

            const combatGroup =
                document.getElementById(
                    "group-combat"
                );


            if (
                combatGroup &&
                combatGroup.style.display !== "none"
            ) {

                handleRun();

            }

        }


        /*
         * S = Skill
         */

        if (
            event.key.toLowerCase() === "s"
        ) {

            useSkill();

        }


        /*
         * Space = Open / Continue
         */

        if (
            event.code === "Space"
        ) {

            event.preventDefault();


            const doorGroup =
                document.getElementById(
                    "group-door"
                );


            const nextGroup =
                document.getElementById(
                    "group-next"
                );


            if (
                doorGroup &&
                doorGroup.style.display !== "none"
            ) {

                openDoor();

            }

            else if (
                nextGroup &&
                nextGroup.style.display !== "none"
            ) {

                resetArena();

            }

        }

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateUI();


        /*
         * Make sure combat/next controls
         * are hidden when page loads.
         */

        document
            .querySelectorAll(
                ".control-group"
            )
            .forEach(element => {

                element.style.display =
                    "none";

            });

    }
);
