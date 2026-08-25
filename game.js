/* =========================================================
   MUNCHING 2
   GAME LOGIC
========================================================= */


/* =========================================================
   AUDIO
========================================================= */

const audioCtx =
    new (window.AudioContext || window.webkitAudioContext)();


function playNote(
    frequency,
    type,
    duration,
    volume
) {

    const oscillator =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();


    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
        frequency,
        audioCtx.currentTime
    );


    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioCtx.destination
    );


    oscillator.start();

    oscillator.stop(
        audioCtx.currentTime + duration
    );

}


const sfx = {

    attack() {

        playNote(
            150,
            'square',
            .2,
            .1
        );

        playNote(
            100,
            'sawtooth',
            .3,
            .1
        );

    },


    loot() {

        playNote(
            880,
            'sine',
            .1,
            .1
        );

        setTimeout(() => {

            playNote(
                1320,
                'sine',
                .2,
                .1
            );

        }, 100);

    },


    trap() {

        playNote(
            200,
            'sawtooth',
            .4,
            .1
        );

        playNote(
            180,
            'sawtooth',
            .4,
            .1
        );

    },


    run() {

        playNote(
            440,
            'triangle',
            .1,
            .05
        );

    },


    success() {

        [523, 659, 784].forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playNote(
                        frequency,
                        'sine',
                        .2,
                        .08
                    );

                }, index * 100);

            }
        );

    },


    failure() {

        [300, 250, 200].forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playNote(
                        frequency,
                        'sawtooth',
                        .3,
                        .08
                    );

                }, index * 100);

            }
        );

    },


    death() {

        [300, 250, 200, 150].forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playNote(
                        frequency,
                        'sawtooth',
                        .5,
                        .1
                    );

                }, index * 150);

            }
        );

    }

};


/* =========================================================
   BACKGROUND MUSIC
========================================================= */

let bgmStarted = false;


function startBGM() {

    if (bgmStarted) {
        return;
    }

    bgmStarted = true;


    const notes = [
        261.63,
        329.63,
        392,
        329.63
    ];


    let index = 0;


    setInterval(() => {

        playNote(
            notes[index % notes.length] / 2,
            'triangle',
            .5,
            .02
        );

        index++;

    }, 600);

}


/* =========================================================
   DATA
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
   PLAYER
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

    stats: {

        monstersDefeated: 0,

        bossesDefeated: 0,

        escapes: 0,

        failedEscapes: 0,

        itemsFound: 0,

        itemsLost: 0

    }

};


/* =========================================================
   HELPERS
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


function setTurn(text, color = null) {

    const element =
        document.getElementById(
            "turn-indicator"
        );


    element.innerText = text;


    if (color) {

        element.style.color = color;

    }

}


/* =========================================================
   INIT GAME
========================================================= */

function initGame(race) {

    audioCtx.resume();

    startBGM();


    p.race = race;


    /*
        Race balancing
    */

    if (race === "Orc") {

        p.baseAtk = 5;

    }

    else if (race === "Elf") {

        p.baseAtk = 3;

    }

    else if (race === "Dwarf") {

        p.baseAtk = 2;

    }


    document
        .getElementById("overlay")
        .style.display = "none";


    document
        .getElementById("ui-race")
        .innerText =
        race.toUpperCase();


    updateSkillButton();

    updateUI();


    showControls("group-door");


    setTurn(
        "READY",
        "#2ecc71"
    );


    log(
        "🚪 Your adventure begins!",
        "#ffffff"
    );


    log(
        `${getRaceDescription()}`
    );

}


/* =========================================================
   RACE DESCRIPTION
========================================================= */

function getRaceDescription() {

    if (p.race === "Orc") {

        return "👹 Orc: High damage. Berserk doubles ATK for one combat.";

    }


    if (p.race === "Elf") {

        return "🧝 Elf: Agile fighter. Escape rolls gain +1.";

    }


    if (p.race === "Dwarf") {

        return "🧔 Dwarf: Every item grants an additional +1 ATK.";

    }


    return "";

}


/* =========================================================
   OPEN DOOR
========================================================= */

function openDoor() {

    setTurn(
        "EXPLORING...",
        "#f0e68c"
    );


    if (p.lvl === 3) {

        spawnBoss(
            "Kargath the Gatekeeper",
            20,
            "👹"
        );

        return;

    }


    if (p.lvl === 6) {

        const boss =
            Math.random() > .5

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


        spawnBoss(
            boss.n,
            boss.p,
            boss.i
        );

        return;

    }


    if (p.lvl === 10) {

        spawnBoss(
            "LORD MUNCHING",
            85,
            "🐲"
        );

        return;

    }


    const rng =
        Math.random();


    if (rng < .45) {

        spawnMonster();

    }

    else if (rng < .70) {

        spawnTrap();

    }

    else {

        spawnLoot();

    }

}


/* =========================================================
   MONSTER
========================================================= */

function spawnMonster() {

    const spec =
        SPECIES[
            Math.floor(
                Math.random() *
                SPECIES.length
            )
        ];


    let power;


    /*
        EARLY GAME BALANCING

        Level 1 is intentionally easier.

        This prevents:
        Elf ATK 4
        vs
        Monster ATK 8-11

        which was way too punishing.
    */

    if (p.lvl <= 1) {

        power =
            Math.floor(
                3 +
                Math.random() * 3
            );

    }

    else {

        power =
            Math.floor(
                3 +
                (p.lvl * 2.2) +
                Math.random() * 3
            );

    }


    p.curEn = {

        n:
            `${PREFIXES[
                Math.floor(
                    Math.random() *
                    PREFIXES.length
                )
            ]} ${spec.n}`,

        pwr:
            power,

        i:
            spec.i,

        boss:
            false

    };


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card monster">

            <span class="m-icon">
                ${spec.i}
            </span>

            <h2 style="color:var(--red)">
                ${p.curEn.n}
            </h2>

            <div class="enemy-power">
                POWER ${power}
            </div>

            <p>
                Will you fight or run?
            </p>

        </div>

    `;


    showControls(
        "group-combat"
    );


    setTurn(
        "COMBAT",
        "#ff4d4d"
    );


    log(
        `👾 ${p.curEn.n} appeared! Power ${power}`,
        "var(--red)"
    );


    updateSkillButton();

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


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card boss">

            <span class="m-icon">
                ${icon}
            </span>

            <h2 style="color:var(--purple)">
                ${name}
            </h2>

            <div
                class="enemy-power"
                style="color:var(--purple)"
            >
                POWER ${power}
            </div>

            <p>
                ⚠️ BOSS ENCOUNTER
            </p>

        </div>

    `;


    showControls(
        "group-combat"
    );


    setTurn(
        "BOSS",
        "var(--purple)"
    );


    log(
        `🔥 BOSS ${name} has appeared!`,
        "var(--purple)"
    );


    updateSkillButton();

}


/* =========================================================
   FIGHT
========================================================= */

function handleFight() {

    if (!p.curEn) {
        return;
    }


    sfx.attack();


    const attack =
        calculateAtk();


    const enemyPower =
        p.curEn.pwr;


    log(
        `⚔️ Your ATK: ${attack} vs ${enemyPower}`,
        "#ffffff"
    );


    /*
        WIN
    */

    if (attack >= enemyPower) {

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
            `✅ You defeated ${p.curEn.n}!`,
            "var(--bright-green)"
        );


        if (p.curEn.boss) {

            p.stats.bossesDefeated++;

        }

        else {

            p.stats.monstersDefeated++;

        }


        /*
            LORD MUNCHING
        */

        if (
            p.lvl >= 10 &&
            p.curEn.boss
        ) {

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
            Normal progression
        */

        p.lvl++;


        /*
            Orc Berserk cost
        */

        if (
            p.race === "Orc" &&
            p.skillActive
        ) {

            p.lvl -= 1;


            log(
                "🔥 Berserk drained you. Level -1.",
                "var(--purple)"
            );

        }


        /*
            Never allow invalid level
        */

        if (p.lvl <= 0) {

            triggerDeath(
                "You collapsed from exhaustion."
            );

            return;

        }


        setTimeout(
            endTurn,
            700
        );


        return;

    }


    /*
        LOSS

        Normal monster:
        -1 level

        Boss:
        -2 levels
    */

    const penalty =
        p.curEn.boss
            ? 2
            : 1;


    log(
        `❌ You lost the fight! Level -${penalty}`,
        "var(--red)"
    );


    p.lvl -= penalty;


    if (p.lvl <= 0) {

        triggerDeath(
            `You were defeated by ${p.curEn.n}.`
        );

        return;

    }


    setTimeout(
        endTurn,
        500
    );

}


/* =========================================================
   RUN
========================================================= */

function handleRun() {

    if (!p.curEn) {
        return;
    }


    /*
        Prevent double-click
    */

    const buttons =
        document.querySelectorAll(
            "#group-combat button"
        );


    buttons.forEach(
        button => {
            button.disabled = true;
        }
    );


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card">

            <div class="dice-roll">
                🎲
            </div>

            <h2>
                ROLLING...
            </h2>

            <p>
                Trying to escape...
            </p>

        </div>

    `;


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

        const rawRoll =
            Math.floor(
                Math.random() * 6
            ) + 1;


        /*
            Elf bonus
        */

        const finalRoll =
            rawRoll +
            (
                p.race === "Elf"
                    ? 1
                    : 0
            );


        const displayRoll =
            finalRoll > 6
                ? 6
                : finalRoll;


        log(
            `🎲 Roll: ${rawRoll}${p.race === "Elf" ? " + 1 Elf bonus" : ""} = ${displayRoll}`,
            "var(--gold)"
        );


        resolveEscape(
            displayRoll
        );

    }, 900);

}


/* =========================================================
   ESCAPE RESULT
========================================================= */

function resolveEscape(
    roll
) {

    const isBoss =
        p.curEn.boss;


    /*
        1-2
        FAIL

        -3 LEVEL
        ALL INVENTORY LOST
    */

    if (roll <= 2) {

        sfx.failure();


        p.stats.failedEscapes++;


        const lostCount =
            p.inv.length;


        p.inv = [];


        p.stats.itemsLost +=
            lostCount;


        p.lvl -= 3;


        document
            .getElementById(
                "event-display"
            )
            .innerHTML = `

            <div class="card monster">

                <div class="dice-result">
                    <div class="dice-roll">
                        ${roll}
                    </div>

                    <h2 style="color:var(--red)">
                        ESCAPE FAILED!
                    </h2>

                    <p>
                        💀 Level -3
                    </p>

                    <p>
                        🎒 All inventory lost
                    </p>

                </div>

            </div>

        `;


        log(
            "❌ Failed to escape! Level -3 and all inventory lost.",
            "var(--red)"
        );


        if (p.lvl <= 0) {

            triggerDeath(
                "You failed to escape and lost everything."
            );

            return;

        }


        showNextAfterEscape();

        return;

    }


    /*
        3-4
        SUCCESS

        Random item lost

        NO LEVEL LOSS
    */

    if (roll <= 4) {

        sfx.success();


        p.stats.escapes++;


        let lostItem = null;


        if (p.inv.length > 0) {

            const index =
                Math.floor(
                    Math.random() *
                    p.inv.length
                );


            lostItem =
                p.inv.splice(
                    index,
                    1
                )[0];


            p.stats.itemsLost++;

        }


        document
            .getElementById(
                "event-display"
            )
            .innerHTML = `

            <div class="card escape">

                <div class="dice-result">

                    <div class="dice-roll">
                        ${roll}
                    </div>

                    <h2 style="color:var(--green)">
                        ESCAPED!
                    </h2>

                    <p>
                        ${
                            lostItem
                                ? `💔 Lost ${lostItem.e}${lostItem.n}`
                                : "🎒 No item to lose"
                        }
                    </p>

                </div>

            </div>

        `;


        log(
            lostItem
                ? `👟 Escaped, but lost ${lostItem.n}.`
                : "👟 Escaped safely. No inventory to lose.",
            "var(--green)"
        );


        /*
            According to the rules,
            3-4 does NOT mention level loss.
            Therefore no level change.
        */

        showNextAfterEscape();

        return;

    }


    /*
        5-6
        PERFECT ESCAPE

        Normal = -1 level
        Boss = -2 levels

        Elf bonus is capped at 6.
    */

    sfx.success();


    p.stats.escapes++;


    const levelPenalty =
        isBoss
            ? 2
            : 1;


    p.lvl -= levelPenalty;


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card escape">

            <div class="dice-result">

                <div class="dice-roll">
                    ${roll}
                </div>

                <h2 style="color:var(--green)">
                    PERFECT ESCAPE!
                </h2>

                <p>
                    🏃 Escaped safely!
                </p>

                <p>
                    Level -${levelPenalty}
                </p>

            </div>

        </div>

    `;


    log(
        `🏃 Perfect escape! Level -${levelPenalty}.`,
        "var(--green)"
    );


    if (p.lvl <= 0) {

        triggerDeath(
            "You escaped, but the journey drained your last strength."
        );

        return;

    }


    showNextAfterEscape();

}


/* =========================================================
   NEXT AFTER ESCAPE
========================================================= */

function showNextAfterEscape() {

    updateUI();


    showControls(
        "group-next"
    );


    setTurn(
        "ESCAPED",
        "var(--green)"
    );

}


/* =========================================================
   TRAPS
========================================================= */

function spawnTrap() {

    sfx.trap();


    const trap =
        Math.floor(
            Math.random() * 3
        );


    let message = "";

    let icon = "";


    if (trap === 0) {

        p.lvl -= 1;

        message =
            "🏹 Arrow Trap! Level -1";

        icon =
            "🏹";

    }


    else if (trap === 1) {

        p.lvl = 1;

        message =
            "🌀 Void Portal! Back to Level 1";

        icon =
            "🌀";

    }


    else {

        if (p.inv.length > 0) {

            const index =
                Math.floor(
                    Math.random() *
                    p.inv.length
                );


            const lost =
                p.inv.splice(
                    index,
                    1
                )[0];


            p.stats.itemsLost++;


            message =
                `👤 Shadow Thief! ${lost.n} stolen`;

        }

        else {

            message =
                "👤 Shadow Thief! Nothing to steal";

        }


        icon =
            "👤";

    }


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

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


    if (p.lvl <= 0) {

        triggerDeath(
            "You died because of a trap."
        );

        return;

    }


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


    const newItem = {

        ...itemData,

        p:
            itemData.p +
            Math.floor(
                Math.random() * 4
            ) + 1

    };


    p.stats.itemsFound++;


    /*
        STACK
    */

    const existingIndex =
        p.inv.findIndex(
            item =>
                item.id ===
                newItem.id
        );


    if (existingIndex !== -1) {

        p.inv[
            existingIndex
        ].p += newItem.p;


        log(
            `✨ ${newItem.n} stacked! +${newItem.p} ATK`,
            "var(--gold)"
        );


        document
            .getElementById(
                "event-display"
            )
            .innerHTML = `

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
                    +${newItem.p} ATK
                </p>

            </div>

        `;


        endTurn();

        return;

    }


    /*
        INVENTORY FULL
    */

    if (p.inv.length >= 5) {

        p.pendingItem =
            newItem;


        document
            .getElementById(
                "new-item-name"
            )
            .innerText =
            `${newItem.e} ${newItem.n} (+${newItem.p} ATK)`;


        const list =
            document.getElementById(
                "swap-list"
            );


        list.innerHTML =
            p.inv.map(
                (item, index) => `

                <div
                    class="inv-slot selectable"
                    onclick="confirmSwap(${index})"
                >

                    <span>
                        ${item.e}
                        ${item.n}
                    </span>

                    <span class="item-power">
                        +${item.p}
                    </span>

                </div>

            `
            ).join("");


        document
            .getElementById(
                "swap-screen"
            )
            .classList.remove(
                "hidden"
            );


        return;

    }


    /*
        NORMAL LOOT
    */

    p.inv.push(
        newItem
    );


    log(
        `🎁 Found ${newItem.n} (+${newItem.p} ATK)`,
        "var(--gold)"
    );


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card loot">

            <span class="m-icon">
                🎁
            </span>

            <h2>
                LOOT FOUND!
            </h2>

            <p>
                ${newItem.e}
                ${newItem.n}
            </p>

            <strong style="color:var(--gold)">
                +${newItem.p} ATK
            </strong>

        </div>

    `;


    endTurn();

}


/* =========================================================
   INVENTORY SWAP
========================================================= */

function confirmSwap(index) {

    if (!p.pendingItem) {
        return;
    }


    p.inv[index] =
        p.pendingItem;


    p.pendingItem =
        null;


    document
        .getElementById(
            "swap-screen"
        )
        .classList.add(
            "hidden"
        );


    log(
        "🔄 Replaced an inventory item.",
        "var(--gold)"
    );


    endTurn();

}


function cancelSwap() {

    p.pendingItem =
        null;


    document
        .getElementById(
            "swap-screen"
        )
        .classList.add(
            "hidden"
        );


    log(
        "🗑️ New item discarded.",
        "#888"
    );


    endTurn();

}


/* =========================================================
   CALCULATE ATK
========================================================= */

function calculateAtk() {

    let itemPower =
        p.inv.reduce(
            (total, item) =>
                total + item.p,
            0
        );


    /*
        Dwarf:
        +1 ATK per item
    */

    if (p.race === "Dwarf") {

        itemPower +=
            p.inv.length;

    }


    let total =
        p.lvl +
        p.baseAtk +
        itemPower;


    /*
        ORC BERSERK
    */

    if (
        p.skillActive &&
        p.race === "Orc"
    ) {

        total *= 2;

    }


    /*
        Elf Shadowstep is
        primarily escape based,
        so it doesn't increase ATK.
    */


    return total;

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    document
        .getElementById(
            "ui-level"
        )
        .innerText =
        p.lvl;


    document
        .getElementById(
            "ui-atk"
        )
        .innerText =
        calculateAtk();


    document
        .getElementById(
            "inventory-count"
        )
        .innerText =
        `${p.inv.length}/5`;


    /*
        Progress
    */

    const progress =
        Math.min(
            100,
            Math.max(
                10,
                (p.lvl / 10) * 100
            )
        );


    document
        .getElementById(
            "ui-progress"
        )
        .style.width =
        `${progress}%`;


    document
        .getElementById(
            "ui-progress-text"
        )
        .innerText =
        `${p.lvl} / 10`;


    /*
        Inventory
    */

    const inventory =
        document.getElementById(
            "ui-inv"
        );


    if (p.inv.length === 0) {

        inventory.innerHTML = `

            <div class="inv-slot">
                Empty
            </div>

        `;

    }

    else {

        inventory.innerHTML =
            p.inv.map(
                item => `

                <div class="inv-slot">

                    <span>
                        ${item.e}
                        ${item.n}
                    </span>

                    <span class="item-power">
                        +${item.p}
                    </span>

                </div>

            `
            ).join("");

    }


    updateSkillButton();

}


/* =========================================================
   SKILL
========================================================= */

function useSkill() {

    if (p.skillUsed) {

        return;

    }


    p.skillUsed =
        true;


    p.skillActive =
        true;


    /*
        ORC
    */

    if (p.race === "Orc") {

        log(
            "🔥 BERSERK ACTIVE! ATK ×2 for this combat.",
            "var(--purple)"
        );

    }


    /*
        ELF
    */

    else if (p.race === "Elf") {

        log(
            "👟 SHADOWSTEP ACTIVE! Escape roll +2.",
            "var(--blue)"
        );

    }


    /*
        DWARF
    */

    else if (p.race === "Dwarf") {

        log(
            "🔨 MASTER SMITH ACTIVE! Item bonuses enhanced.",
            "var(--gold)"
        );

    }


    updateSkillButton();

    updateUI();

}


/* =========================================================
   SKILL BUTTON
========================================================= */

function updateSkillButton() {

    const button =
        document.getElementById(
            "skill-btn"
        );


    if (!button) {
        return;
    }


    button.disabled =
        p.skillUsed;


    if (p.race === "Orc") {

        button.innerText =
            p.skillUsed
                ? "🔥 BERSERK USED"
                : "🔥 BERSERK — ATK ×2";

    }


    else if (p.race === "Elf") {

        button.innerText =
            p.skillUsed
                ? "👟 SHADOWSTEP USED"
                : "👟 SHADOWSTEP — ESCAPE +2";

    }


    else if (p.race === "Dwarf") {

        button.innerText =
            p.skillUsed
                ? "🔨 MASTER SMITH USED"
                : "🔨 MASTER SMITH";

    }

}


/* =========================================================
   END TURN
========================================================= */

function endTurn() {

    p.skillActive =
        false;


    p.skillUsed =
        false;


    updateUI();


    showControls(
        "group-next"
    );


    setTurn(
        "TURN COMPLETE",
        "#f0e68c"
    );

}


/* =========================================================
   RESET ARENA
========================================================= */

function resetArena() {

    p.curEn =
        null;


    document
        .getElementById(
            "event-display"
        )
        .innerHTML = `

        <div class="card door-card">

            <div class="event-icon">
                🚪
            </div>

            <h2>
                LEVEL ${p.lvl}
            </h2>

            <p>
                What awaits beyond the door?
            </p>

        </div>

    `;


    showControls(
        "group-door"
    );


    setTurn(
        "READY",
        "#2ecc71"
    );


    updateUI();

}


/* =========================================================
   LOG
========================================================= */

function log(
    message,
    color = "#aaa"
) {

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "log-entry";


    element.style.color =
        color;


    element.innerText =
        `> ${message}`;


    const logPanel =
        document.getElementById(
            "game-log"
        );


    logPanel.appendChild(
        element
    );


    logPanel.scrollTop =
        logPanel.scrollHeight;

}


/* =========================================================
   DEATH
========================================================= */

function triggerDeath(
    reason
) {

    sfx.death();


    document
        .getElementById(
            "death-screen"
        )
        .classList.remove(
            "hidden"
        );


    document
        .getElementById(
            "death-reason"
        )
        .innerText =
        reason;


    /*
        Disable game controls
    */

    document
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {
                button.disabled = true;
            }
        );

}
