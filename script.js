/* =====================================================
   ELEMENTOS
===================================================== */

const intro = document.getElementById("intro");
const universe = document.getElementById("universe");
const sunflowerButton = document.getElementById("sunflowerButton");

const particlesContainer = document.getElementById("particles");
const starsContainer = document.getElementById("stars");

const flowers = document.querySelectorAll(".flower");

const message = document.getElementById("message");
const messageText = document.getElementById("messageText");
const closeMessage = document.getElementById("closeMessage");


/* =====================================================
   ESTADO
===================================================== */

let hasStarted = false;


/* =====================================================
   TOCAR EL GIRASOL
===================================================== */

sunflowerButton.addEventListener("click", startExperience);

sunflowerButton.addEventListener("touchstart", (event) => {
    event.preventDefault();
}, {
    passive: false
});


function startExperience() {

    if (hasStarted) return;

    hasStarted = true;


    /* ---------------------------------------------
       1. Preparar explosión
    --------------------------------------------- */

    createGoldenExplosion();

    createExplosionRing();


    /* ---------------------------------------------
       2. El girasol aumenta y desaparece
    --------------------------------------------- */

    intro.classList.add("revealing");


    /* ---------------------------------------------
       3. Revelar universo
    --------------------------------------------- */

    setTimeout(() => {

        universe.classList.add("active");

    }, 400);


    /* ---------------------------------------------
       4. Quitar pantalla inicial
    --------------------------------------------- */

    setTimeout(() => {

        intro.style.opacity = "0";

    }, 900);


    setTimeout(() => {

        intro.style.visibility = "hidden";
        intro.style.pointerEvents = "none";

    }, 1800);


    /* ---------------------------------------------
       5. Partículas adicionales
    --------------------------------------------- */

    setTimeout(() => {

        createAmbientParticles(30);

    }, 1700);
}


/* =====================================================
   EXPLOSIÓN DORADA
===================================================== */

function createGoldenExplosion() {

    const amount = window.innerWidth < 500 ? 95 : 130;

    for (let i = 0; i < amount; i++) {

        const particle = document.createElement("span");

        particle.classList.add("particle");


        /* Ángulo aleatorio */

        const angle = Math.random() * Math.PI * 2;


        /* Distancia */

        const distance =
            100 +
            Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.55;


        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;


        particle.style.setProperty(
            "--x",
            `${x}px`
        );

        particle.style.setProperty(
            "--y",
            `${y}px`
        );


        /* Tamaños diferentes */

        const size =
            Math.random() < 0.8
                ? Math.random() * 3 + 2
                : Math.random() * 6 + 3;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;


        /* Retraso muy pequeño */

        particle.style.animationDelay =
            `${Math.random() * 0.25}s`;


        particlesContainer.appendChild(particle);


        /* Limpiar */

        setTimeout(() => {

            particle.remove();

        }, 2000);
    }
}


/* =====================================================
   ANILLO DE ENERGÍA
===================================================== */

function createExplosionRing() {

    const ring = document.createElement("div");

    ring.classList.add("burst-ring");

    document.body.appendChild(ring);


    setTimeout(() => {

        ring.remove();

    }, 1500);
}


/* =====================================================
   PARTÍCULAS AMBIENTALES
===================================================== */

function createAmbientParticles(amount) {

    for (let i = 0; i < amount; i++) {

        const particle = document.createElement("span");

        particle.classList.add("ambient-particle");


        particle.style.position = "absolute";

        particle.style.width =
            `${Math.random() * 3 + 1}px`;

        particle.style.height =
            particle.style.width;

        particle.style.borderRadius = "50%";

        particle.style.background =
            Math.random() > .5
                ? "#ffe477"
                : "#ffffff";


        particle.style.boxShadow =
            "0 0 8px rgba(255,220,80,.8)";


        particle.style.left =
            `${Math.random() * 100}%`;

        particle.style.top =
            `${Math.random() * 100}%`;


        particle.style.opacity =
            `${Math.random() * .7 + .2}`;


        particle.style.pointerEvents = "none";


        particle.style.animation =
            `ambientTwinkle ${Math.random() * 3 + 2}s ease-in-out infinite`;


        starsContainer.appendChild(particle);
    }
}


/* =====================================================
   ESTRELLAS DINÁMICAS
===================================================== */

const ambientStyle = document.createElement("style");

ambientStyle.innerHTML = `

@keyframes ambientTwinkle {

    0%,
    100% {
        opacity: .15;
        transform: scale(.6);
    }

    50% {
        opacity: 1;
        transform: scale(1.5);
    }
}

`;

document.head.appendChild(ambientStyle);


/* =====================================================
   TOCAR FLORES
===================================================== */

flowers.forEach((flower) => {

    flower.addEventListener("click", () => {

        const text =
            flower.getAttribute("data-message");


        showMessage(text);


        /* Pequeña explosión alrededor de la flor */

        createFlowerParticles(flower);

    });

});


/* =====================================================
   MOSTRAR MENSAJE
===================================================== */

function showMessage(text) {

    messageText.textContent = text;

    message.classList.add("show");

}


/* =====================================================
   CERRAR MENSAJE
===================================================== */

closeMessage.addEventListener("click", (event) => {

    event.stopPropagation();

    message.classList.remove("show");

});


/* =====================================================
   PARTÍCULAS DE UNA FLOR
===================================================== */

function createFlowerParticles(flower) {

    const rect =
        flower.getBoundingClientRect();


    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;


    for (let i = 0; i < 18; i++) {

        const particle =
            document.createElement("span");


        particle.style.position = "fixed";

        particle.style.left =
            `${centerX}px`;

        particle.style.top =
            `${centerY}px`;


        particle.style.width = "4px";

        particle.style.height = "4px";

        particle.style.borderRadius = "50%";

        particle.style.background = "#ffe45c";

        particle.style.boxShadow =
            "0 0 10px #ffd83d";


        particle.style.pointerEvents = "none";

        particle.style.zIndex = "100";


        const angle =
            Math.random() * Math.PI * 2;

        const distance =
            30 + Math.random() * 80;


        particle.animate(

            [
                {
                    transform: "translate(-50%, -50%) scale(.3)",
                    opacity: 1
                },

                {
                    transform:
                        `translate(
                            calc(-50% + ${Math.cos(angle) * distance}px),
                            calc(-50% + ${Math.sin(angle) * distance}px)
                        )
                        scale(1)`,

                    opacity: 0
                }
            ],

            {
                duration:
                    600 + Math.random() * 500,

                easing:
                    "cubic-bezier(.2,.8,.3,1)"
            }

        );


        document.body.appendChild(particle);


        setTimeout(() => {

            particle.remove();

        }, 1200);
    }
}


/* =====================================================
   TOCAR FUERA DEL MENSAJE
===================================================== */

document.addEventListener("click", (event) => {

    if (
        message.classList.contains("show") &&
        !message.contains(event.target) &&
        !event.target.classList.contains("flower")
    ) {

        message.classList.remove("show");

    }

});