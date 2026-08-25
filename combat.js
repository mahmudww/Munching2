/* =========================================================
   MUNCHING 2
   COMBAT.JS
========================================================= */


/* =========================================================
   START COMBAT
========================================================= */

function startCombat() {

    if (p.gameOver || !p.curEn) {
        return;
    }

    showControls("group-combat");

    updateUI();

}


/* =========================================================
   ATTACK
========================================================= */

function handleFight() {

    if (
        p.gameOver ||
        !p.curEn
    ) {
        return;
    }

    sfx.attack();

    const playerPower = calculateAtk();
    const enemyPower = p.curEn.pwr;

    log(
        `⚔️ You attack with ${playerPower} Power against ${enemyPower}.`,
        "white"
    );

    /*
     * Player wins if their total ATK
     * is equal to or higher than enemy Power.
     */

    if (playerPower >= enemyPower) {

        handleVictory();

    } else {

        handleCombatLoss();

    }

}


/* =========================================================
   COMBAT VICTORY
========================================================= */

function handleVictory() {

    if (!p.curEn) {
        return;
    }

    const enemyName = p.curEn.n;
    const wasBoss = p.curEn.boss === true;

    /*
     * Visual death effect
     */

    const enemyIcon =
        document.querySelector(".m-icon");

    if (enemyIcon) {

        enemyIcon.classList.add(
            "dead-icon"
        );

    }


    log(
        `✅ Defeated ${enemyName}!`,
        "var(--bright-green)"
    );


    /*
     * LORD MUNCHING
     *
     * Winning the Level 10 boss
     * ends the game immediately.
     */

    if (
        wasBoss &&
        p.lvl >= 10
    ) {

        p.gameOver = true;

        p.skillActive = false;
        p.skillUsed = false;

        sfx.victory();

        setTimeout(() => {

            const winScreen =
                document.getElementById(
                    "win-screen"
                );

            if (winScreen) {
                winScreen.style.display =
                    "flex";
            }

        }, 700);

        return;

    }


    /*
     * Normal combat victory:
     *
     * +1 Level
     */

    p.lvl += 1;


    /*
     * ORC BERSERK
     *
     * Berserk doubles attack power.
     *
     * After successfully using it,
     * the Orc pays the Berserk cost:
     *
     * -2 Levels
     */

    if (
        p.race === "Orc" &&
        p.skillActive
    ) {

        p.lvl -= 2;

        log(
            "🔥 Berserk consumed 2 Levels.",
            "var(--purple)"
        );

    }


    /*
     * Make sure level never stays at 0
     * without triggering death.
     */

    if (p.lvl <= 0) {

        triggerDeath(
            "You collapsed from exhaustion after using Berserk."
        );

        return;

    }


    /*
     * Combat skill lasts for ONE ACTION only.
     */

    p.skillActive = false;
    p.skillUsed = false;


    updateUI();


    /*
     * Give player a small moment to see
     * the enemy's death animation.
     */

    setTimeout(() => {

        endTurn();

    }, 650);

}


/* =========================================================
   COMBAT DEFEAT
========================================================= */

function handleCombatLoss() {

    if (!p.curEn) {
        return;
    }

    const enemyName =
        p.curEn.n;


    log(
        `❌ You lost against ${enemyName}!`,
        "var(--red)"
    );


    /*
     * Failed combat:
     *
     * -2 Levels
     */

    p.lvl -= 2;


    /*
     * Skill is consumed regardless of
     * whether the attack succeeds.
     */

    p.skillActive = false;
    p.skillUsed = false;


    /*
     * Level 0 = death
     */

    if (p.lvl <= 0) {

        triggerDeath(
            `You were defeated by ${enemyName}.`
        );

        return;

    }


    updateUI();


    /*
     * End combat and allow player
     * to continue.
     */

    setTimeout(() => {

        endTurn();

    }, 400);

}


/* =========================================================
   CALCULATE ATTACK
========================================================= */

function calculateAtk() {

    /*
     * Base formula:
     *
     * Level
     * +
     * Race Base ATK
     * +
     * Inventory Power
     */

    let itemPower = 0;


    p.inv.forEach(item => {

        let power =
            Number(item.p) || 0;


        /*
         * DWARF PASSIVE
         *
         * Every item gives +1 extra ATK.
         */

        if (
            p.race === "Dwarf"
        ) {

            power += 1;

        }


        itemPower += power;

    });


    let total =
        p.lvl +
        p.baseAtk +
        itemPower;


    /*
     * =====================================================
     * ORC — BERSERK
     * =====================================================
     *
     * Double the COMPLETE attack value.
     *
     * Example:
     *
     * Level 1
     * + Base ATK 5
     * + Item 0
     * = 6
     *
     * Berserk:
     *
     * 6 × 2 = 12
     *
     * This is intentionally calculated BEFORE
     * comparing against enemy power.
     */

    if (
        p.race === "Orc" &&
        p.skillActive
    ) {

        total *= 2;

    }


    /*
     * =====================================================
     * DWARF — FORGE FURY
     * =====================================================
     *
     * More items = more bonus power.
     *
     * This makes Dwarf scale better later
     * instead of being overly strong early.
     */

    if (
        p.race === "Dwarf" &&
        p.skillActive
    ) {

        total +=
            p.inv.length * 2;

    }


    /*
     * ELF
     *
     * Elf does NOT receive an attack multiplier.
     *
     * Their strength comes from escape mechanics.
     */


    return Math.floor(total);

}


/* =========================================================
   GET COMBAT PREVIEW
========================================================= */

function getCombatPreview() {

    if (!p.curEn) {

        return {

            playerPower: calculateAtk(),

            enemyPower: 0,

            canWin: false

        };

    }


    const playerPower =
        calculateAtk();

    const enemyPower =
        p.curEn.pwr;


    return {

        playerPower,

        enemyPower,

        canWin:
            playerPower >= enemyPower

    };

}


/* =========================================================
   USE SKILL
========================================================= */

function useSkill() {

    if (
        p.gameOver ||
        p.skillUsed
    ) {

        return;

    }


    /*
     * Need an active encounter
     * before using combat skill.
     */

    if (!p.curEn) {

        log(
            "⚠️ There is no enemy to use your skill against.",
            "var(--red)"
        );

        return;

    }


    p.skillActive = true;
    p.skillUsed = true;


    /* =====================================================
       ORC
    ===================================================== */

    if (
        p.race === "Orc"
    ) {

        log(
            "🔥 BERSERK ACTIVATED!",
            "var(--purple)"
        );

        log(
            "⚔️ Your attack power is DOUBLED for this attack.",
            "var(--purple)"
        );

    }


    /* =====================================================
       ELF
    ===================================================== */

    else if (
        p.race === "Elf"
    ) {

        log(
            "👟 WINDSTEP ACTIVATED!",
            "var(--blue)"
        );

        log(
            "🎲 Your next escape receives an additional +1 bonus.",
            "var(--blue)"
        );

    }


    /* =====================================================
       DWARF
    ===================================================== */

    else if (
        p.race === "Dwarf"
    ) {

        log(
            "🔨 FORGE FURY ACTIVATED!",
            "var(--gold)"
        );

        log(
            `💥 Bonus: +${p.inv.length * 2} ATK from your inventory.`,
            "var(--gold)"
        );

    }


    updateUI();

}


/* =========================================================
   COMBAT BUTTON STATE
========================================================= */

function updateCombatButtons() {

    const attackButton =
        document.querySelector(
            "#group-combat .btn-red"
        );


    const runButton =
        document.querySelector(
            "#group-combat .btn-dark"
        );


    const skillButton =
        document.getElementById(
            "skill-btn"
        );


    if (!p.curEn) {

        if (attackButton) {
            attackButton.disabled = true;
        }

        if (runButton) {
            runButton.disabled = true;
        }

        if (skillButton) {
            skillButton.disabled = true;
        }

        return;

    }


    if (attackButton) {
        attackButton.disabled =
            false;
    }


    if (runButton) {
        runButton.disabled =
            false;
    }


    if (skillButton) {

        skillButton.disabled =
            p.skillUsed;

    }

}


/* =========================================================
   COMBAT DEBUG INFO
========================================================= */

function getCombatStatus() {

    if (!p.curEn) {

        return {
            active: false
        };

    }


    return {

        active: true,

        enemy:
            p.curEn.n,

        enemyPower:
            p.curEn.pwr,

        isBoss:
            p.curEn.boss === true,

        playerPower:
            calculateAtk(),

        skillActive:
            p.skillActive,

        skillUsed:
            p.skillUsed

    };

}
