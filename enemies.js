/* =========================================================
   MUNCHING 2
   ENEMIES.JS
========================================================= */


/* =========================================================
   ENEMY PREFIXES
========================================================= */

const ENEMY_PREFIXES = [
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


/* =========================================================
   NORMAL ENEMIES
========================================================= */

const ENEMY_SPECIES = [

    {
        id: "slime",
        name: "Slime",
        icon: "🧪"
    },

    {
        id: "goblin",
        name: "Goblin",
        icon: "👺"
    },

    {
        id: "spider",
        name: "Spider",
        icon: "🕷️"
    },

    {
        id: "skeleton",
        name: "Skeleton",
        icon: "💀"
    },

    {
        id: "bat",
        name: "Bat",
        icon: "🦇"
    },

    {
        id: "wolf",
        name: "Wolf",
        icon: "🐺"
    },

    {
        id: "zombie",
        name: "Zombie",
        icon: "🧟"
    },

    {
        id: "rat",
        name: "Rat",
        icon: "🐀"
    },

    {
        id: "cobra",
        name: "Cobra",
        icon: "🐍"
    },

    {
        id: "ghost",
        name: "Ghost",
        icon: "👻"
    }

];


/* =========================================================
   BOSS DATABASE
========================================================= */

const BOSSES = {

    level3: {
        id: "kargath",
        name: "🛡️ Kargath the Gatekeeper",
        icon: "👹",
        power: 20,
        boss: true
    },

    level6: [

        {
            id: "xenomorph_queen",
            name: "👑 Xenomorph Queen",
            icon: "👽",
            power: 40,
            boss: true
        },

        {
            id: "void_reaver",
            name: "🌌 Void Reaver",
            icon: "👻",
            power: 45,
            boss: true
        }

    ],

    level10: {
        id: "lord_munching",
        name: "👑 LORD MUNCHING",
        icon: "🐲",
        power: 85,
        boss: true,
        finalBoss: true
    }

};


/* =========================================================
   RANDOM UTILITY
========================================================= */

function randomEnemyPrefix() {

    return ENEMY_PREFIXES[
        Math.floor(
            Math.random() *
            ENEMY_PREFIXES.length
        )
    ];

}


function randomEnemySpecies() {

    return ENEMY_SPECIES[
        Math.floor(
            Math.random() *
            ENEMY_SPECIES.length
        )
    ];

}


/* =========================================================
   GENERATE NORMAL ENEMY POWER
========================================================= */

function calculateEnemyPower(level) {

    /*
     * Base scaling:
     *
     * Level 1:
     * roughly 4 - 8
     *
     * Higher levels:
     * enemy becomes progressively stronger.
     */

    const base =
        4 +
        (level * 3.5);

    const variation =
        Math.random() * 5;


    return Math.floor(
        base + variation
    );

}


/* =========================================================
   CREATE NORMAL ENEMY
========================================================= */

function createNormalEnemy(level) {

    const species =
        randomEnemySpecies();

    const prefix =
        randomEnemyPrefix();

    const power =
        calculateEnemyPower(level);


    return {

        id:
            `${prefix}_${species.id}`,

        n:
            `${prefix} ${species.name}`,

        name:
            `${prefix} ${species.name}`,

        i:
            species.icon,

        icon:
            species.icon,

        pwr:
            power,

        power:
            power,

        boss:
            false,

        finalBoss:
            false,

        level:
            level

    };

}


/* =========================================================
   CREATE BOSS
========================================================= */

function createBoss(bossData) {

    return {

        id:
            bossData.id,

        n:
            bossData.name,

        name:
            bossData.name,

        i:
            bossData.icon,

        icon:
            bossData.icon,

        pwr:
            bossData.power,

        power:
            bossData.power,

        boss:
            true,

        finalBoss:
            bossData.finalBoss === true,

        level:
            p.lvl

    };

}


/* =========================================================
   GET BOSS FOR CURRENT LEVEL
========================================================= */

function getBossForLevel(level) {

    /*
     * Level 3
     */

    if (level === 3) {

        return createBoss(
            BOSSES.level3
        );

    }


    /*
     * Level 6
     *
     * Randomly choose one of two bosses.
     */

    if (level === 6) {

        const bossList =
            BOSSES.level6;

        const selectedBoss =
            bossList[
                Math.floor(
                    Math.random() *
                    bossList.length
                )
            ];


        return createBoss(
            selectedBoss
        );

    }


    /*
     * Level 10
     *
     * Final Boss.
     */

    if (level === 10) {

        return createBoss(
            BOSSES.level10
        );

    }


    return null;

}


/* =========================================================
   CHECK IF CURRENT LEVEL IS A BOSS LEVEL
========================================================= */

function isBossLevel(level) {

    return (
        level === 3 ||
        level === 6 ||
        level === 10
    );

}


/* =========================================================
   SPAWN NORMAL MONSTER
========================================================= */

function spawnMonster() {

    if (p.gameOver) {
        return;
    }


    const enemy =
        createNormalEnemy(
            p.lvl
        );


    p.curEn = enemy;


    /*
     * Display enemy.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card monster">

            <span class="m-icon">
                ${enemy.icon}
            </span>

            <h2 style="color: var(--red)">
                ${enemy.name}
            </h2>

            <h3>
                Power: ${enemy.power}
            </h3>

        </div>

    `;


    /*
     * Combat UI.
     */

    showControls(
        "group-combat"
    );


    /*
     * Log.
     */

    log(
        `👾 Encountered ${enemy.name}!`,
        "var(--red)"
    );


    /*
     * Update attack preview / UI.
     */

    updateUI();


    if (
        typeof updateCombatButtons ===
        "function"
    ) {

        updateCombatButtons();

    }

}


/* =========================================================
   SPAWN BOSS
========================================================= */

function spawnBoss(
    name,
    power,
    icon
) {

    if (p.gameOver) {
        return;
    }


    /*
     * This function is kept compatible
     * with the previous game.js version.
     *
     * If you call:
     *
     * spawnBoss("Boss", 30, "👹")
     *
     * it will still work.
     */

    p.curEn = {

        id:
            `boss_${Date.now()}`,

        n:
            name,

        name:
            name,

        i:
            icon,

        icon:
            icon,

        pwr:
            power,

        power:
            power,

        boss:
            true,

        finalBoss:
            p.lvl === 10,

        level:
            p.lvl

    };


    /*
     * Display boss.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

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

            <div style="
                color: var(--purple);
                font-weight: bold;
                margin-top: 10px;
            ">
                👑 BOSS
            </div>

        </div>

    `;


    /*
     * Combat UI.
     */

    showControls(
        "group-combat"
    );


    /*
     * Log.
     */

    log(
        `🔥 BOSS ${name} HAS APPEARED!`,
        "var(--purple)"
    );


    /*
     * Update UI.
     */

    updateUI();


    if (
        typeof updateCombatButtons ===
        "function"
    ) {

        updateCombatButtons();

    }

}


/* =========================================================
   SPAWN BOSS FOR CURRENT LEVEL
========================================================= */

function spawnBossForCurrentLevel() {

    const boss =
        getBossForLevel(
            p.lvl
        );


    if (!boss) {

        return false;

    }


    p.curEn =
        boss;


    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card boss">

            <span class="m-icon">
                ${boss.icon}
            </span>

            <h2 style="color: var(--purple)">
                ${boss.name}
            </h2>

            <h3 style="font-size: 2rem">
                Power: ${boss.power}
            </h3>

            <div style="
                color: var(--purple);
                font-weight: bold;
                margin-top: 10px;
            ">
                👑 BOSS
            </div>

        </div>

    `;


    showControls(
        "group-combat"
    );


    log(
        `🔥 BOSS ${boss.name} HAS APPEARED!`,
        "var(--purple)"
    );


    updateUI();


    if (
        typeof updateCombatButtons ===
        "function"
    ) {

        updateCombatButtons();

    }


    return true;

}


/* =========================================================
   CLEAR CURRENT ENEMY
========================================================= */

function clearEnemy() {

    p.curEn = null;


    if (
        typeof updateCombatButtons ===
        "function"
    ) {

        updateCombatButtons();

    }

}


/* =========================================================
   GET CURRENT ENEMY TYPE
========================================================= */

function isCurrentEnemyBoss() {

    if (!p.curEn) {
        return false;
    }


    return (
        p.curEn.boss === true
    );

}


/* =========================================================
   GET CURRENT ENEMY POWER
========================================================= */

function getCurrentEnemyPower() {

    if (!p.curEn) {
        return 0;
    }


    return Number(
        p.curEn.pwr
    ) || 0;

}


/* =========================================================
   GET CURRENT ENEMY NAME
========================================================= */

function getCurrentEnemyName() {

    if (!p.curEn) {
        return "Unknown Enemy";
    }


    return (
        p.curEn.name ||
        p.curEn.n ||
        "Unknown Enemy"
    );

}


/* =========================================================
   ENEMY DEBUG INFO
========================================================= */

function getEnemyStatus() {

    if (!p.curEn) {

        return {
            active: false
        };

    }


    return {

        active: true,

        id:
            p.curEn.id,

        name:
            getCurrentEnemyName(),

        power:
            getCurrentEnemyPower(),

        boss:
            isCurrentEnemyBoss(),

        finalBoss:
            p.curEn.finalBoss === true,

        level:
            p.curEn.level

    };

}
