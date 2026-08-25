/* =========================================================
   MUNCHING 2
   ITEM.JS
========================================================= */


/* =========================================================
   ITEM DATABASE
========================================================= */

const ITEMS_BASE = [

    {
        id: "sword",
        name: "Sword",
        n: "Sword",
        emoji: "⚔️",
        e: "⚔️",
        power: 4,
        p: 4
    },

    {
        id: "shield",
        name: "Shield",
        n: "Shield",
        emoji: "🛡️",
        e: "🛡️",
        power: 3,
        p: 3
    },

    {
        id: "axe",
        name: "Axe",
        n: "Axe",
        emoji: "🪓",
        e: "🪓",
        power: 5,
        p: 5
    },

    {
        id: "wand",
        name: "Wand",
        n: "Wand",
        emoji: "🪄",
        e: "🪄",
        power: 6,
        p: 6
    },

    {
        id: "ring",
        name: "Ring",
        n: "Ring",
        emoji: "💍",
        e: "💍",
        power: 4,
        p: 4
    }

];


/* =========================================================
   INVENTORY SETTINGS
========================================================= */

const MAX_INVENTORY =
    5;


/* =========================================================
   RANDOM ITEM
========================================================= */

function getRandomItemBase() {

    return ITEMS_BASE[
        Math.floor(
            Math.random() *
            ITEMS_BASE.length
        )
    ];

}


/* =========================================================
   CREATE RANDOM LOOT
========================================================= */

function generateLootItem() {

    const base =
        getRandomItemBase();


    /*
     * Random bonus:
     *
     * Base item +1 to +4
     */

    const bonus =
        Math.floor(
            Math.random() * 4
        ) + 1;


    return {

        id:
            base.id,

        name:
            base.name,

        n:
            base.n,

        emoji:
            base.emoji,

        e:
            base.e,

        power:
            base.power + bonus,

        p:
            base.p + bonus

    };

}


/* =========================================================
   GET ITEM POWER
========================================================= */

function getItemPower(item) {

    if (!item) {
        return 0;
    }


    return Number(
        item.power ?? item.p
    ) || 0;

}


/* =========================================================
   GET ITEM NAME
========================================================= */

function getItemName(item) {

    if (!item) {
        return "Unknown Item";
    }


    return (
        item.name ||
        item.n ||
        "Unknown Item"
    );

}


/* =========================================================
   GET ITEM EMOJI
========================================================= */

function getItemEmoji(item) {

    if (!item) {
        return "❓";
    }


    return (
        item.emoji ||
        item.e ||
        "❓"
    );

}


/* =========================================================
   FIND STACKABLE ITEM
========================================================= */

function findStackableItem(
    item
) {

    if (!item) {
        return -1;
    }


    return p.inv.findIndex(
        existingItem =>
            existingItem.id === item.id
    );

}


/* =========================================================
   ADD ITEM TO INVENTORY
========================================================= */

function addItemToInventory(
    item
) {

    if (!item) {
        return {
            success: false,
            reason: "invalid"
        };
    }


    /*
     * =====================================================
     * STACK EXISTING ITEM
     * =====================================================
     */

    const existingIndex =
        findStackableItem(item);


    if (existingIndex !== -1) {

        const existingItem =
            p.inv[existingIndex];


        existingItem.p =
            getItemPower(existingItem) +
            getItemPower(item);


        existingItem.power =
            existingItem.p;


        log(
            `✨ Stacked ${getItemName(item)} +${getItemPower(item)}!`,
            "var(--gold)"
        );


        return {

            success: true,

            stacked: true,

            index:
                existingIndex

        };

    }


    /*
     * =====================================================
     * INVENTORY HAS SPACE
     * =====================================================
     */

    if (
        p.inv.length <
        MAX_INVENTORY
    ) {

        p.inv.push(item);


        log(
            `🎁 Obtained ${getItemName(item)} (+${getItemPower(item)})`,
            "var(--gold)"
        );


        return {

            success: true,

            stacked: false,

            index:
                p.inv.length - 1

        };

    }


    /*
     * =====================================================
     * INVENTORY FULL
     * =====================================================
     */

    return {

        success: false,

        reason: "full",

        item: item

    };

}


/* =========================================================
   LOOT EVENT
========================================================= */

function spawnLoot() {

    if (p.gameOver) {
        return;
    }


    if (
        typeof sfx !== "undefined" &&
        typeof sfx.loot === "function"
    ) {

        sfx.loot();

    }


    const newItem =
        generateLootItem();


    /*
     * Try adding the item.
     */

    const result =
        addItemToInventory(
            newItem
        );


    /*
     * =====================================================
     * STACKED
     * =====================================================
     */

    if (
        result.success &&
        result.stacked
    ) {

        document.getElementById(
            "event-display"
        ).innerHTML = `

            <div class="card loot">

                <span class="m-icon">
                    🔨
                </span>

                <h2>
                    STACKED!
                </h2>

                <p>
                    ${getItemEmoji(newItem)}
                    ${getItemName(newItem)}
                    +${getItemPower(newItem)}
                </p>

            </div>

        `;


        updateUI();


        endTurn();

        return;

    }


    /*
     * =====================================================
     * NEW ITEM
     * =====================================================
     */

    if (
        result.success &&
        !result.stacked
    ) {

        document.getElementById(
            "event-display"
        ).innerHTML = `

            <div class="card loot">

                <span class="m-icon">
                    🎁
                </span>

                <h2>
                    NEW ITEM!
                </h2>

                <p>
                    ${getItemEmoji(newItem)}
                    ${getItemName(newItem)}
                    (+${getItemPower(newItem)})
                </p>

            </div>

        `;


        updateUI();


        endTurn();

        return;

    }


    /*
     * =====================================================
     * INVENTORY FULL
     * =====================================================
     */

    if (
        result.reason === "full"
    ) {

        openItemSwap(
            newItem
        );

        return;

    }

}


/* =========================================================
   OPEN ITEM SWAP SCREEN
========================================================= */

function openItemSwap(
    newItem
) {

    p.pendingItem =
        newItem;


    const newItemName =
        document.getElementById(
            "new-item-name"
        );


    if (newItemName) {

        newItemName.innerText =
            `${getItemEmoji(newItem)} ${getItemName(newItem)} (+${getItemPower(newItem)})`;

    }


    const list =
        document.getElementById(
            "swap-list"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        p.inv.map(
            (item, index) => `

                <div
                    class="inv-slot selectable"
                    onclick="confirmSwap(${index})"
                >

                    <span>
                        ${getItemEmoji(item)}
                        ${getItemName(item)}
                        (+${getItemPower(item)})
                    </span>

                    <span>
                        🔄
                    </span>

                </div>

            `
        ).join("");


    document.getElementById(
        "swap-screen"
    ).style.display = "flex";

}


/* =========================================================
   CONFIRM ITEM SWAP
========================================================= */

function confirmSwap(
    index
) {

    if (
        p.pendingItem === null ||
        p.pendingItem === undefined
    ) {

        return;

    }


    if (
        index < 0 ||
        index >= p.inv.length
    ) {

        return;

    }


    const oldItem =
        p.inv[index];

    const newItem =
        p.pendingItem;


    /*
     * Replace old item.
     */

    p.inv[index] =
        newItem;


    /*
     * Clear pending item.
     */

    p.pendingItem =
        null;


    /*
     * Close modal.
     */

    closeItemSwap();


    log(
        `🔄 Replaced ${getItemName(oldItem)} with ${getItemName(newItem)}.`,
        "var(--gold)"
    );


    /*
     * Show loot result.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card loot">

            <span class="m-icon">
                🔄
            </span>

            <h2>
                ITEM REPLACED!
            </h2>

            <p>
                ${getItemEmoji(newItem)}
                ${getItemName(newItem)}
                (+${getItemPower(newItem)})
            </p>

        </div>

    `;


    updateUI();


    endTurn();

}


/* =========================================================
   CANCEL ITEM SWAP
========================================================= */

function cancelSwap() {

    if (
        p.pendingItem
    ) {

        log(
            `🗑️ Discarded ${getItemName(p.pendingItem)}.`,
            "#777"
        );

    }


    p.pendingItem =
        null;


    closeItemSwap();


    /*
     * Player still gets to continue.
     */

    document.getElementById(
        "event-display"
    ).innerHTML = `

        <div class="card">

            <span class="m-icon">
                🗑️
            </span>

            <h2>
                ITEM DISCARDED
            </h2>

            <p>
                You left the new item behind.
            </p>

        </div>

    `;


    endTurn();

}


/* =========================================================
   CLOSE SWAP SCREEN
========================================================= */

function closeItemSwap() {

    const screen =
        document.getElementById(
            "swap-screen"
        );


    if (screen) {

        screen.style.display =
            "none";

    }

}


/* =========================================================
   REMOVE RANDOM ITEM
========================================================= */

function removeRandomItem() {

    if (
        p.inv.length === 0
    ) {

        return null;

    }


    const index =
        Math.floor(
            Math.random() *
            p.inv.length
        );


    const removedItem =
        p.inv.splice(
            index,
            1
        )[0];


    return removedItem;

}


/* =========================================================
   REMOVE ALL ITEMS
========================================================= */

function removeAllItems() {

    const lostItems =
        [...p.inv];


    p.inv = [];


    return lostItems;

}


/* =========================================================
   LOSE RANDOM ITEM
========================================================= */

function loseRandomItem() {

    const removed =
        removeRandomItem();


    if (!removed) {

        return null;

    }


    log(
        `💔 Lost ${getItemName(removed)} (+${getItemPower(removed)}).`,
        "var(--red)"
    );


    updateUI();


    return removed;

}


/* =========================================================
   LOSE ALL ITEMS
========================================================= */

function loseAllItems() {

    const lostItems =
        removeAllItems();


    if (
        lostItems.length === 0
    ) {

        log(
            "🎒 Your inventory was already empty.",
            "#777"
        );

        return [];

    }


    log(
        `💥 You lost all ${lostItems.length} items!`,
        "var(--red)"
    );


    updateUI();


    return lostItems;

}


/* =========================================================
   GET TOTAL INVENTORY POWER
========================================================= */

function getInventoryPower() {

    return p.inv.reduce(
        (total, item) => {

            return (
                total +
                getItemPower(item)
            );

        },
        0
    );

}


/* =========================================================
   GET INVENTORY COUNT
========================================================= */

function getInventoryCount() {

    return p.inv.length;

}


/* =========================================================
   CHECK INVENTORY FULL
========================================================= */

function isInventoryFull() {

    return (
        p.inv.length >=
        MAX_INVENTORY
    );

}


/* =========================================================
   CLEAR PENDING ITEM
========================================================= */

function clearPendingItem() {

    p.pendingItem =
        null;


    closeItemSwap();

}


/* =========================================================
   ITEM DEBUG INFO
========================================================= */

function getInventoryStatus() {

    return {

        count:
            p.inv.length,

        max:
            MAX_INVENTORY,

        full:
            isInventoryFull(),

        totalPower:
            getInventoryPower(),

        items:
            p.inv.map(item => ({

                id:
                    item.id,

                name:
                    getItemName(item),

                power:
                    getItemPower(item)

            }))

    };

}
