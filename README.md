# ⚔️ MUNCHING 2

### The Return of Lord Munching

A small browser-based dungeon adventure game built with **HTML, CSS, and Vanilla JavaScript**.

Choose your race, fight monsters, collect and stack items, make risky escape decisions, survive traps, defeat bosses, and eventually face **Lord Munching**.

---

## 🎮 About the Game

**MUNCHING 2** is a lightweight dungeon-crawling game focused on simple mechanics, random events, and strategic decision-making.

Every time you open a door, something different may happen:

- 👾 Fight a monster
- 👑 Encounter a boss
- 🪤 Trigger a trap
- 🎁 Find loot
- 👟 Run away from danger

Your goal is to survive long enough to reach the final boss.

> **Reach Level 10 and defeat Lord Munching.**

---

## ✨ Features

- 👹 Three playable races
- ⚔️ Turn-based combat
- 🎲 Dice-based escape system
- 👾 Randomly generated enemies
- 👑 Multiple boss encounters
- 🎒 Inventory management
- 📦 Automatic item stacking
- 🔄 Item replacement system
- 🪤 Random dungeon traps
- 🔥 Race-specific abilities
- 🔊 Sound effects
- 🎵 Background music
- 📜 Adventure log
- 💀 Death screen
- 🏆 Victory screen
- 📱 Responsive interface

---

## 🧙 Playable Races

### 👹 Orc

The combat-focused race.

**Base ATK:** `+5`

**Skill: Berserk**

Doubles the Orc's total ATK for one turn.

```text
6 ATK
↓
Berserk
↓
12 ATK
```

Best for players who prefer fighting rather than running.

---

### 🧝 Elf

The agile escape-focused race.

**Base ATK:** `+2`

**Passive: Swift**

The Elf receives `+1` to escape rolls.

```text
Dice: 4
Elf Bonus: +1

Final Roll: 5
```

The Elf is weaker in direct combat but has a better chance of escaping dangerous encounters.

---

### 🧔 Dwarf

The equipment-focused race.

**Base ATK:** `+2`

**Passive: Master Crafter**

Each item in the inventory provides an additional `+1 ATK`.

The more items you collect, the stronger the Dwarf becomes.

---

## ⚔️ Combat

When encountering an enemy, you can:

- ⚔️ **Attack**
- 👟 **Run**
- 🔥 **Use Skill**

Your total attack power is calculated from:

```text
Level
+ Base ATK
+ Item Power
+ Race Bonuses
```

If your ATK is equal to or higher than the enemy's power:

```text
Victory
```

If your ATK is lower:

```text
Level -2
```

If your level reaches `0`, you die.

---

## 👟 Escape System

Running uses a six-sided dice roll.

### 🎲 Roll 1–2 — Failed Escape

The player suffers:

```text
Level -3
All inventory lost
```

---

### 🎲 Roll 3–4 — Costly Escape

The player successfully escapes, but loses one random item.

Against a normal enemy:

```text
Level -1
+ 1 random item lost
```

Against a boss:

```text
Level -2
+ 1 random item lost
```

If the inventory is empty, no item is lost.

---

### 🎲 Roll 5–6 — Safe Escape

The player escapes without losing an item.

Against a normal enemy:

```text
Level -1
```

Against a boss:

```text
Level -2
```

The inventory remains untouched.

---

## 🧝 Elf Escape Bonus

The Elf receives:

```text
+1 Escape Roll
```

This makes the Elf more reliable when trying to escape dangerous encounters.

---

## 🎒 Inventory

The player can hold up to **5 unique item types**.

Items with the same ID automatically stack.

For example:

```text
Sword +4
```

Finding another Sword:

```text
Sword +3
```

Results in:

```text
Sword +7
```

instead of consuming another inventory slot.

When the inventory is full, the player can choose an existing item to replace or discard the new item.

---

## 🪤 Dungeon Events

Opening a door can produce different events.

### 👾 Monster

Fight a randomly generated enemy.

### 👑 Boss

Special enemies appear on certain levels.

### 🎁 Loot

Find a random item.

### 🪤 Trap

Possible traps include:

- 🏹 Arrow Trap
- 🌀 Void Portal
- 👤 Shadow Thief

---

## 👑 Bosses

Bosses appear at specific levels.

| Level | Boss |
|---|---|
| 3 | 🛡️ Kargath the Gatekeeper |
| 6 | 👑 Xenomorph Queen / 🌌 Void Reaver |
| 10 | 🐲 LORD MUNCHING |

The ultimate goal is to defeat:

> 🐲 **LORD MUNCHING**

---

## 🗂️ Project Structure

```text
MUNCHING-2/
│
├── index.html
├── style.css
│
├── game.js
├── combat.js
├── enemies.js
├── item.js
└── audio.js
```

### `index.html`

Contains the game's UI and HTML structure.

### `style.css`

Contains the visual design, layout, animations, and responsive styling.

### `game.js`

Controls the overall game flow and UI.

### `combat.js`

Handles combat, attack calculations, and race skills.

### `enemies.js`

Contains enemy and boss definitions and generation logic.

### `item.js`

Handles items, loot, stacking, and inventory management.

### `audio.js`

Handles sound effects and background music using the Web Audio API.

---

## 🚀 Running the Game

No installation or dependencies are required.

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/munching-2.git
```

Open the project folder:

```bash
cd munching-2
```

Then open:

```text
index.html
```

in your browser.

That's it.

---

## 🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API

No frameworks or external libraries are currently required.

---

## 🎯 Game Design

Each race is designed around a different playstyle:

| Race | Strength | Playstyle |
|---|---|---|
| 👹 Orc | High ATK | Aggressive |
| 🧝 Elf | Escape Bonus | Agile |
| 🧔 Dwarf | Item Scaling | Equipment-focused |

The goal is to make each race feel different rather than simply giving them different numbers.

---

## 🗺️ Roadmap

- [ ] HP system
- [ ] Defense system
- [ ] Critical hits
- [ ] More enemy types
- [ ] More bosses
- [ ] More races
- [ ] More items
- [ ] Consumable potions
- [ ] Gold system
- [ ] Shop
- [ ] Dungeon map
- [ ] Save/load system
- [ ] Achievements
- [ ] High scores
- [ ] More advanced animations
- [ ] Mobile UI improvements

---

## 🐛 Feedback & Bug Reports

Found a bug or have an idea?

Feel free to open an **Issue** on GitHub.

When reporting a bug, please include:

1. What happened
2. What you expected to happen
3. Which race you were using
4. Your current level
5. Steps to reproduce the issue
6. Screenshot or video if possible

---

## 🤝 Contributing

Contributions, suggestions, and balance ideas are welcome.

If you'd like to contribute:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Test the game
5. Open a Pull Request

Example:

```bash
git checkout -b feature/new-enemy
```

---

## 📜 License

This project is currently a personal/experimental project.

License information will be added in the future.

---

# ⚔️ MUNCHING 2

> Choose your race.  
> Open the door.  
> Survive the dungeon.  
> Defeat Lord Munching.

**Good luck. You're going to need it.** 💀


Play Here: https://mahmudww.github.io/Munching2/
