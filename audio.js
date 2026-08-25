/* =========================================================
   MUNCHING 2
   AUDIO.JS
========================================================= */


/* =========================================================
   AUDIO ENGINE
========================================================= */

let audioCtx = null;

let bgmInterval = null;

let bgmStarted = false;


/* =========================================================
   INITIALIZE AUDIO
========================================================= */

function initAudio() {

    if (audioCtx) {
        return;
    }


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        console.warn(
            "Web Audio API is not supported by this browser."
        );

        return;

    }


    audioCtx =
        new AudioContext();

}


/* =========================================================
   RESUME AUDIO
========================================================= */

function resumeAudio() {

    initAudio();


    if (
        audioCtx &&
        audioCtx.state === "suspended"
    ) {

        audioCtx.resume();

    }

}


/* =========================================================
   PLAY NOTE
========================================================= */

function playNote(
    frequency,
    type = "sine",
    duration = 0.2,
    volume = 0.05
) {

    if (!audioCtx) {
        return;
    }


    /*
     * Browser audio may still be suspended
     * before the first user interaction.
     */

    if (
        audioCtx.state === "suspended"
    ) {

        audioCtx.resume();

    }


    const oscillator =
        audioCtx.createOscillator();

    const gain =
        audioCtx.createGain();


    oscillator.type =
        type;


    oscillator.frequency.setValueAtTime(
        frequency,
        audioCtx.currentTime
    );


    gain.gain.setValueAtTime(
        volume,
        audioCtx.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
    );


    oscillator.connect(
        gain
    );

    gain.connect(
        audioCtx.destination
    );


    oscillator.start();


    oscillator.stop(
        audioCtx.currentTime +
        duration
    );

}


/* =========================================================
   SOUND EFFECTS
========================================================= */

const sfx = {


    /* =====================================================
       ATTACK
    ===================================================== */

    attack: function() {

        playNote(
            150,
            "square",
            0.12,
            0.08
        );

        setTimeout(() => {

            playNote(
                90,
                "sawtooth",
                0.18,
                0.07
            );

        }, 50);

    },


    /* =====================================================
       LOOT
    ===================================================== */

    loot: function() {

        playNote(
            660,
            "sine",
            0.1,
            0.08
        );


        setTimeout(() => {

            playNote(
                880,
                "sine",
                0.1,
                0.08
            );

        }, 100);


        setTimeout(() => {

            playNote(
                1320,
                "sine",
                0.18,
                0.08
            );

        }, 200);

    },


    /* =====================================================
       TRAP
    ===================================================== */

    trap: function() {

        playNote(
            180,
            "sawtooth",
            0.25,
            0.08
        );


        setTimeout(() => {

            playNote(
                120,
                "sawtooth",
                0.3,
                0.08
            );

        }, 120);

    },


    /* =====================================================
       RUN / DICE
    ===================================================== */

    run: function() {

        playNote(
            440,
            "triangle",
            0.08,
            0.05
        );

    },


    /* =====================================================
       SKILL
    ===================================================== */

    skill: function() {

        playNote(
            220,
            "triangle",
            0.15,
            0.06
        );


        setTimeout(() => {

            playNote(
                330,
                "triangle",
                0.15,
                0.06
            );

        }, 100);


        setTimeout(() => {

            playNote(
                660,
                "sine",
                0.25,
                0.07
            );

        }, 200);

    },


    /* =====================================================
       BOSS
    ===================================================== */

    boss: function() {

        playNote(
            100,
            "sawtooth",
            0.4,
            0.08
        );


        setTimeout(() => {

            playNote(
                80,
                "sawtooth",
                0.5,
                0.08
            );

        }, 180);

    },


    /* =====================================================
       ESCAPE SUCCESS
    ===================================================== */

    escapeSuccess: function() {

        playNote(
            440,
            "triangle",
            0.1,
            0.05
        );


        setTimeout(() => {

            playNote(
                660,
                "triangle",
                0.15,
                0.05
            );

        }, 100);


        setTimeout(() => {

            playNote(
                880,
                "sine",
                0.2,
                0.05
            );

        }, 200);

    },


    /* =====================================================
       ESCAPE FAILURE
    ===================================================== */

    escapeFail: function() {

        playNote(
            220,
            "sawtooth",
            0.2,
            0.07
        );


        setTimeout(() => {

            playNote(
                140,
                "sawtooth",
                0.35,
                0.07
            );

        }, 120);

    },


    /* =====================================================
       DEATH
    ===================================================== */

    death: function() {

        const notes = [
            300,
            250,
            200,
            150
        ];


        notes.forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playNote(
                        frequency,
                        "sawtooth",
                        0.35,
                        0.08
                    );

                }, index * 150);

            }
        );

    },


    /* =====================================================
       VICTORY
    ===================================================== */

    victory: function() {

        const notes = [
            523.25,
            659.25,
            783.99,
            1046.50
        ];


        notes.forEach(
            (frequency, index) => {

                setTimeout(() => {

                    playNote(
                        frequency,
                        "sine",
                        0.35,
                        0.08
                    );

                }, index * 140);

            }
        );

    },


    /* =====================================================
       BUTTON CLICK
    ===================================================== */

    click: function() {

        playNote(
            500,
            "square",
            0.05,
            0.025
        );

    },


    /* =====================================================
       LEVEL UP
    ===================================================== */

    levelUp: function() {

        playNote(
            523.25,
            "sine",
            0.12,
            0.06
        );


        setTimeout(() => {

            playNote(
                659.25,
                "sine",
                0.12,
                0.06
            );

        }, 100);


        setTimeout(() => {

            playNote(
                783.99,
                "sine",
                0.25,
                0.07
            );

        }, 200);

    }

};


/* =========================================================
   BACKGROUND MUSIC
========================================================= */

function startBGM() {

    /*
     * Don't create multiple BGM loops.
     */

    if (bgmStarted) {
        return;
    }


    resumeAudio();


    if (!audioCtx) {
        return;
    }


    bgmStarted =
        true;


    const notes = [

        261.63,
        329.63,
        392.00,
        329.63

    ];


    let index = 0;


    bgmInterval =
        setInterval(() => {

            if (!audioCtx) {
                return;
            }


            /*
             * Keep BGM very quiet so
             * SFX remain dominant.
             */

            playNote(
                notes[
                    index %
                    notes.length
                ] / 2,
                "triangle",
                0.45,
                0.018
            );


            index++;

        }, 600);

}


/* =========================================================
   STOP BGM
========================================================= */

function stopBGM() {

    if (
        bgmInterval !== null
    ) {

        clearInterval(
            bgmInterval
        );

        bgmInterval =
            null;

    }


    bgmStarted =
        false;

}


/* =========================================================
   PAUSE AUDIO
========================================================= */

function pauseAudio() {

    if (
        audioCtx &&
        audioCtx.state === "running"
    ) {

        audioCtx.suspend();

    }

}


/* =========================================================
   RESUME AUDIO
========================================================= */

function resumeGameAudio() {

    resumeAudio();

}


/* =========================================================
   MASTER AUDIO HELPERS
========================================================= */

function playAttackSound() {

    sfx.attack();

}


function playLootSound() {

    sfx.loot();

}


function playTrapSound() {

    sfx.trap();

}


function playRunSound() {

    sfx.run();

}


function playSkillSound() {

    sfx.skill();

}


function playBossSound() {

    sfx.boss();

}


function playDeathSound() {

    sfx.death();

}


function playVictorySound() {

    sfx.victory();

}


/* =========================================================
   AUTO INITIALIZE AFTER USER INTERACTION
========================================================= */

document.addEventListener(
    "click",
    function() {

        resumeAudio();

    },
    {
        once: true
    }
);
