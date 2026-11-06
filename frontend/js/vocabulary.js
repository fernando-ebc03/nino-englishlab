/* =========================================================
   VOCABULARY — Lógica del quiz (JavaScript nativo)
   Sesión de 10 palabras: pregunta, respuesta, resultado
   y resumen final. Sin dependencias externas.

   Nota de fase: los datos de la sesión (XP, racha) viven
   solo en memoria. Todavía NO se persisten en localStorage.
   ========================================================= */

/* ---------- 1. DATOS DE LA SESIÓN (contenido didáctico) ---------- */

const PREGUNTAS = [
    {
        word: "curious",
        type: "ADJECTIVE",
        definition: "Wanting to know or learn something.",
        example: "I'm <strong>curious</strong> about English.",
        exampleTranslation: "Tengo curiosidad por el inglés.",
        tip: "When you want to know more about something, you're <strong>curious</strong>.",
        options: [
            "Wanting to know something",
            "Being very tired",
            "Working very quickly",
        ],
        correctIndex: 0,
    },
    {
        word: "tired",
        type: "ADJECTIVE",
        definition: "Feeling that you need rest or sleep.",
        example: "She is <strong>tired</strong> after class.",
        exampleTranslation: "Está cansada después de la clase.",
        tip: "<strong>Tired</strong> means you need rest. Sleep is allowed. Once.",
        options: [
            "Needing rest or sleep",
            "Full of energy",
            "Feeling angry",
        ],
        correctIndex: 0,
    },
    {
        word: "borrow",
        type: "VERB",
        definition: "To take something from someone and give it back later.",
        example: "Can I <strong>borrow</strong> your pen?",
        exampleTranslation: "¿Puedo pedirte prestado tu bolígrafo?",
        tip: "You <strong>borrow</strong> something and return it later. You better return it.",
        options: [
            "To take something and give it back later",
            "To buy something new",
            "To give a gift to someone",
        ],
        correctIndex: 0,
    },
    {
        word: "improve",
        type: "VERB",
        definition: "To make something better than it was before.",
        example: "Practice every day to <strong>improve</strong> your English.",
        exampleTranslation: "Practica todos los días para mejorar tu inglés.",
        tip: "<strong>Improve</strong> means to get better. That's the whole point of this page.",
        options: [
            "To become better at something",
            "To start something again",
            "To stop doing something",
        ],
        correctIndex: 0,
    },
    {
        word: "early",
        type: "ADVERB",
        definition: "Before the usual or expected time.",
        example: "I woke up <strong>early</strong> to study.",
        exampleTranslation: "Me desperté temprano para estudiar.",
        tip: "<strong>Early</strong> is before the expected time. Late is not an excuse.",
        options: [
            "Before the usual or expected time",
            "Very late at night",
            "Doing things very quickly",
        ],
        correctIndex: 0,
    },
    {
        word: "answer",
        type: "NOUN",
        definition: "What you say when someone asks you a question.",
        example: "Her <strong>answer</strong> was correct.",
        exampleTranslation: "Su respuesta fue correcta.",
        tip: "An <strong>answer</strong> is a reply to a question. Giving wrong ones builds character.",
        options: [
            "A reply to a question",
            "A kind of exercise",
            "A written letter",
        ],
        correctIndex: 0,
    },
    {
        word: "alone",
        type: "ADJECTIVE",
        definition: "Without other people near you.",
        example: "He likes to study <strong>alone</strong>.",
        exampleTranslation: "Él prefiere estudiar solo.",
        tip: "<strong>Alone</strong> means by yourself. Studying alone still counts as training.",
        options: [
            "By yourself, without other people",
            "Feeling sick",
            "Together with friends",
        ],
        correctIndex: 0,
    },
    {
        word: "remember",
        type: "VERB",
        definition: "To keep something in your mind and not forget it.",
        example: "I <strong>remember</strong> that word now.",
        exampleTranslation: "Ahora recuerdo esa palabra.",
        tip: "<strong>Remember</strong> means keep it in your mind. Five minutes isn't remembering.",
        options: [
            "To keep something in your mind",
            "To forget something on purpose",
            "To say goodbye to someone",
        ],
        correctIndex: 0,
    },
    {
        word: "lazy",
        type: "ADJECTIVE",
        definition: "Not wanting to work or make an effort.",
        example: "Don't be <strong>lazy</strong>. Do the exercise.",
        exampleTranslation: "No seas perezoso. Haz el ejercicio.",
        tip: "<strong>Lazy</strong> means no effort. Nino is watching for this one.",
        options: [
            "Not wanting to make an effort",
            "Working very hard",
            "Feeling excited",
        ],
        correctIndex: 0,
    },
    {
        word: "excuse",
        type: "NOUN",
        definition: "A reason you give to explain why you didn't do something.",
        example: "Stop making <strong>excuses</strong> and practice.",
        exampleTranslation: "Deja de poner excusas y practica.",
        tip: "An <strong>excuse</strong> explains why something wasn't done. This app has none.",
        options: [
            "A reason for not doing something",
            "A kind of prize",
            "A way to say hello",
        ],
        correctIndex: 0,
    },
];

/* Mensajes estilo Nino para cada resultado. */
const MENSAJES_ACIERTO = [
    "Correct. Fine. Don't get cocky.",
    "Correct. Your memory works after all.",
    "Correct. That's the one.",
];

const MENSAJES_FALLO = [
    "Wrong. But wrong is fixable.",
    "Nope. Read the meaning below.",
    "Incorrect. Again. Slowly.",
];

const MENSAJES_MONITOR_ACIERTO = [
    "Correct. Keep it up.",
    "Good. I'm almost impressed.",
    "Nice. Next one.",
];

const MENSAJES_MONITOR_FALLO = [
    "Wrong. Check the explanation.",
    "Read the definition again.",
    "Careless. Try to focus.",
];

const MENSAJE_MONITOR_INICIAL = "I'm watching. Make your choice.";

const XP_POR_ACIERTO = 10;
const LETRAS = ["A", "B", "C"];

/* ---------- 2. ESTADO DE LA SESIÓN ---------- */

function crearEstadoInicial() {
    return {
        indice: 0,       // pregunta actual (0–9)
        respondida: false, // evita responder dos veces la misma pregunta
        aciertos: 0,     // respuestas correctas
        xp: 0,           // XP de la sesión
        racha: 0,        // aciertos consecutivos actuales
        mejorRacha: 0,   // mejor racha de la sesión
    };
}

let estado = crearEstadoInicial();

/* ---------- 3. REFERENCIAS AL DOM ---------- */

const $ = (selector) => document.querySelector(selector);

const contadorFuerte = $(".word-counter strong");
const contadorTotal = contadorFuerte.querySelector("span");
const barraProgreso = $(".word-progress");
const pasosProgreso = barraProgreso.querySelectorAll(".progress-word");
const palabraActual = $("#current-word");
const palabraTipo = $(".word-type");
const botonEscuchar = $(".word-audio .listen-button");
const definicion = $(".word-definition");
const fraseEjemplo = $("#word-context .context-example p");
const tradEjemplo = $(".example-translation");
const etiquetaEjemplo = $(".example-tag");
const etiquetaContexto = $(".context-label");
const textoTip = $(".context-tip p");
const etiquetaCheck = $(".check-label");
const textoCheckProgreso = $(".check-progress");
const preguntaCheck = $("#check-question");
const contenedorOpciones = $(".check-options");
const mensajeMonitor = $(".monitor-message p");
const rachaFuerte = $(".streak strong");
const rachaSufijo = rachaFuerte.querySelector(".streak-suffix");
const xpSesion = $(".session-xp strong");
const panelResultado = $("#word-result");
const iconoResultado = $(".result-icon");
const etiquetaResultado = $(".result-label");
const mensajeResultado = $(".result-message");
const explicacionResultado = $(".result-explanation");
const xpResultado = $(".result-xp strong");
const botonSiguiente = $(".next-word-button");
const panelSesionCompleta = $("#session-complete");
const statsSesionCompleta = panelSesionCompleta.querySelectorAll(".complete-stat strong");
const botonContinuar = $(".continue-button");
const seccionQuiz = $("#quick-check");
const seccionPalabra = $("#word-section");

/* ---------- 4. HELPERS ---------- */

const dosDigitos = (n) => String(n).padStart(2, "0");

const elegirMensaje = (mensajes) => mensajes[estado.indice % mensajes.length];

function mostrarPanel(panel) {
    panel.removeAttribute("hidden");
}

function ocultarPanel(panel) {
    panel.setAttribute("hidden", "");
}

/* ---------- 5. RENDER DE LA PREGUNTA ---------- */

function renderPregunta() {
    const q = PREGUNTAS[estado.indice];

    /* Panel escáner: palabra + contadores. */
    contadorFuerte.replaceChildren(
        document.createTextNode(`${dosDigitos(estado.indice + 1)} `),
        contadorTotal,
    );
    palabraActual.textContent = q.word.toUpperCase();
    palabraTipo.textContent = q.type;
    botonEscuchar.setAttribute(
        "aria-label",
        `Escuchar la pronunciación de ${q.word}`,
    );

    /* Barra de progreso de 10 pasos. */
    pasosProgreso.forEach((paso, i) => {
        paso.classList.toggle("is-current", i === estado.indice);
        paso.classList.toggle("is-done", i < estado.indice);

        if (i === estado.indice) {
            paso.setAttribute("aria-current", "step");
        } else {
            paso.removeAttribute("aria-current");
        }
    });
    barraProgreso.setAttribute("aria-valuenow", String(estado.indice + 1));
    barraProgreso.setAttribute(
        "aria-valuetext",
        `Pregunta ${estado.indice + 1} de ${PREGUNTAS.length}`,
    );

    /* Contexto y definición. */
    etiquetaContexto.textContent = `${dosDigitos(estado.indice + 1)} / UNDERSTAND`;
    etiquetaEjemplo.textContent = `EXAMPLE ${dosDigitos(estado.indice + 1)}`;
    definicion.textContent = q.definition;
    fraseEjemplo.innerHTML = q.example;
    tradEjemplo.textContent = q.exampleTranslation;
    textoTip.innerHTML = q.tip;

    /* Panel de la pregunta. */
    etiquetaCheck.textContent = `KNOWLEDGE CHECK / ${dosDigitos(estado.indice + 1)}`;
    textoCheckProgreso.textContent = `QUESTION ${dosDigitos(estado.indice + 1)} / ${PREGUNTAS.length}`;
    preguntaCheck.replaceChildren(
        document.createTextNode("What does "),
        document.createElement("strong"),
    );
    preguntaCheck.lastChild.textContent = `“${q.word}”`;
    preguntaCheck.append(document.createTextNode(" mean?"));

    /* Opciones (se recrean en cada pregunta, habilitadas de nuevo). */
    contenedorOpciones.replaceChildren();
    q.options.forEach((texto, i) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "check-option";

        const numero = document.createElement("span");
        numero.className = "option-number";
        numero.textContent = LETRAS[i];

        const contenido = document.createElement("span");
        contenido.className = "option-text";
        contenido.textContent = texto;

        const flecha = document.createElement("span");
        flecha.className = "option-arrow";
        flecha.setAttribute("aria-hidden", "true");
        flecha.textContent = "↗";

        boton.append(numero, contenido, flecha);
        boton.addEventListener("click", () => responder(i));
        contenedorOpciones.append(boton);
    });

    /* Restablecer mensajes de apoyo. */
    mensajeMonitor.textContent = MENSAJE_MONITOR_INICIAL;
    estado.respondida = false;
}

/* ---------- 6. RESPUESTA Y RESULTADO ---------- */

function responder(indiceElegido) {
    if (estado.respondida) {
        return; // una sola respuesta por pregunta
    }
    estado.respondida = true;

    const q = PREGUNTAS[estado.indice];
    const esCorrecta = indiceElegido === q.correctIndex;

    if (esCorrecta) {
        estado.aciertos += 1;
        estado.xp += XP_POR_ACIERTO;
        estado.racha += 1;
        estado.mejorRacha = Math.max(estado.mejorRacha, estado.racha);
    } else {
        estado.racha = 0;
    }

    /* Revelar la correcta y marcar la elegida (si fue incorrecta). */
    contenedorOpciones.querySelectorAll(".check-option").forEach((boton, i) => {
        boton.disabled = true;
        if (i === q.correctIndex) {
            boton.classList.add("is-correct");
        } else if (i === indiceElegido) {
            boton.classList.add("is-wrong");
        }
    });

    mostrarResultado(q, esCorrecta);
    actualizarRecompensas();
}

function mostrarResultado(q, esCorrecta) {
    const xpGanado = esCorrecta ? XP_POR_ACIERTO : 0;

    panelResultado.classList.toggle("is-wrong", !esCorrecta);
    iconoResultado.textContent = esCorrecta ? "✓" : "✕";
    etiquetaResultado.textContent = esCorrecta ? "CORRECT" : "INCORRECT";
    mensajeResultado.textContent = esCorrecta
        ? elegirMensaje(MENSAJES_ACIERTO)
        : elegirMensaje(MENSAJES_FALLO);
    explicacionResultado.innerHTML = esCorrecta ? q.tip : q.definition;
    xpResultado.textContent = `+${xpGanado} XP`;
    mensajeMonitor.textContent = esCorrecta
        ? elegirMensaje(MENSAJES_MONITOR_ACIERTO)
        : elegirMensaje(MENSAJES_MONITOR_FALLO);

    /* En la última pregunta el botón cambia de propósito. */
    const esUltima = estado.indice === PREGUNTAS.length - 1;
    botonSiguiente.replaceChildren(
        document.createTextNode(esUltima ? "SEE RESULTS " : "NEXT WORD "),
        document.createElement("span"),
    );
    botonSiguiente.lastChild.setAttribute("aria-hidden", "true");
    botonSiguiente.lastChild.textContent = "→";

    mostrarPanel(panelResultado);
    panelResultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
    botonSiguiente.focus({ preventScroll: true });
}

function actualizarRecompensas() {
    rachaFuerte.replaceChildren(
        document.createTextNode(String(estado.racha)),
        rachaSufijo,
    );
    xpSesion.textContent = `+${estado.xp} XP`;
}

/* ---------- 7. AVANCE Y FINALIZACIÓN ---------- */

function avanzar() {
    if (estado.indice === PREGUNTAS.length - 1) {
        finalizar();
        return;
    }

    estado.indice += 1;
    ocultarPanel(panelResultado);
    renderPregunta();

    seccionPalabra.scrollIntoView({ behavior: "smooth", block: "start" });
    const primeraOpcion = contenedorOpciones.querySelector(".check-option");
    if (primeraOpcion) {
        primeraOpcion.focus({ preventScroll: true });
    }
}

function finalizar() {
    ocultarPanel(panelResultado);
    ocultarPanel(seccionQuiz);

    const [statAciertos, statXp, statRacha] = statsSesionCompleta;
    statAciertos.textContent = `${estado.aciertos} / ${PREGUNTAS.length}`;
    statXp.textContent = `+${estado.xp} XP`;
    statRacha.textContent = `${estado.mejorRacha}×`;

    mostrarPanel(panelSesionCompleta);
    panelSesionCompleta.scrollIntoView({ behavior: "smooth", block: "start" });
    botonContinuar.focus({ preventScroll: true });
}

/* ---------- 8. REINICIO Y ARRANQUE ---------- */

function reiniciar() {
    estado = crearEstadoInicial();

    actualizarRecompensas();
    ocultarPanel(panelSesionCompleta);
    mostrarPanel(seccionQuiz);
    botonSiguiente.replaceChildren(
        document.createTextNode("NEXT WORD "),
        document.createElement("span"),
    );
    botonSiguiente.lastChild.setAttribute("aria-hidden", "true");
    botonSiguiente.lastChild.textContent = "→";

    renderPregunta();
    seccionPalabra.scrollIntoView({ behavior: "smooth", block: "start" });
    const primeraOpcion = contenedorOpciones.querySelector(".check-option");
    if (primeraOpcion) {
        primeraOpcion.focus({ preventScroll: true });
    }
}

botonSiguiente.addEventListener("click", avanzar);
botonContinuar.addEventListener("click", reiniciar);

renderPregunta(); // el script se carga con defer: el DOM ya existe
