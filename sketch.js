// ============================================================
//  ESTADOS DEL JUEGO
//  Cada número representa una pantalla o momento distinto.
//  La variable "estado" controla cuál se dibuja en cada frame.
// ============================================================
const E = {
  INICIO:         0,   // Pantalla de bienvenida
  DIALOGO_HAMBRE: 1,   // Pooh dice que tiene hambre
  CAMINANDO:      2,   // Pooh camina por el bosque buscando miel
  LLEGO_MIEL:     3,   // Pooh llega al árbol con miel (hay que hacer click)
  DECISION:       4,   // Pooh agarra la miel (scroll para comer)
  COMIENDO:       5,   // Pooh come feliz la miel
};

// ============================================================
//  VARIABLES DE IMÁGENES
//  Se declaran acá arriba (vacías) y se cargan en preload().
// ============================================================
let pooh;             // Pooh parado (pantalla de hambre)
let fondo1;           // Fondo de día (bosque)
let camina1;          // Frame 1 de la animación caminando
let camina2;          // Frame 2 de la animación caminando
let fondo2;           // Fondo de noche (bosque oscuro)
let img_miel;         // (reservada, no se usa actualmente)
let img_comiendo;     // (reservada, no se usa actualmente)
let img_miel1;        // Fondo del árbol con miel
let img_mielagarrada; // Fondo cuando Pooh agarra la miel
let img_poohladito;   // Pooh de lado mirando la miel
let img_poohagarro;   // Pooh en el momento de agarrar la miel
let img_poohcomio;    // Pooh comiendo la miel (escena final)

// ── Fuente personalizada ─────────────────────────────────────
let miFuente; // Tipografía pixelada VCR que se usa en los textos

// ============================================================
//  VARIABLES DE MÚSICA
// ============================================================
let cancion;                        // El archivo de audio cargado
let musicaIniciada = false;         // Si la música ya está sonando
let tiempoInicio   = 0;             // Momento (en ms) en que empezó
const DURACION_CANCION = 30000;     // La canción dura 30 segundos;
                                    // al terminar, el juego se reinicia

// ============================================================
//  CONSTANTES DE CONFIGURACIÓN
//  Centralizar estos valores acá hace fácil ajustarlos sin
//  tener que buscarlos por todo el código.
// ============================================================
const VELOCIDAD_FONDO    = 2000; // ms entre cada cambio de fondo (día/noche)
const VELOCIDAD_CAMINATA = 300;  // ms entre cada frame de la animación de Pooh
const VELOCIDAD_POOH     = 3;    // píxeles que avanza Pooh por frame

// Posición y tamaño del área clickeable de la miel
const MIEL_X = 500;
const MIEL_Y = 400;
const MIEL_W = 300;
const MIEL_H = 300;
const DEBUG_MIEL = false; // Si es true, dibuja un rectángulo rojo
                          // sobre el área clickeable (útil para ajustar)

// Tamaño y posición vertical de Pooh en la mayoría de las escenas
const POOH_W = 200;
const POOH_H = 300;
const POOH_Y = 500; // Posición Y fija para que siempre esté "parado"

// ============================================================
//  VARIABLES INTERNAS (cambian durante el juego)
// ============================================================
let estado;                          // Estado actual del juego (usa E.XXXX)
let es_dia              = true;      // Alterna entre fondo de día y noche
let ultimo_cambio_fondo = 0;         // Último momento en que cambió el fondo
let tiempo_inicio_caminata = 0;      // Momento en que empezó la caminata
const DURACION_INTERCALADO = 10000;  // 10s intercalando fondos, luego fondo de miel

// Animación de caminata: alterna entre camina1 y camina2
let pooh_x;            // Posición horizontal de Pooh mientras camina
let frame_caminata = 0; // 0 = camina1, 1 = camina2
let ultimo_frame   = 0; // Último momento en que cambió el frame

// ============================================================
//  PRELOAD — se ejecuta ANTES que todo, carga los archivos
// ============================================================
function preload() {
  // Imágenes (todas en la misma carpeta que el sketch)
  pooh             = loadImage('./winnie1.png');
  fondo1           = loadImage('./fondo1.jpg');
  camina1          = loadImage('./camina1.png');
  camina2          = loadImage('./camina2.png');
  fondo2           = loadImage('./fondo2.png');
  img_miel1        = loadImage('./miel1.jpg');
  img_mielagarrada = loadImage('./mielcita.png');
  img_poohladito   = loadImage('./poohladito.png');
  img_poohagarro   = loadImage('./poohagarro.png');
  img_poohcomio    = loadImage('./poohcomio.png');

  // Fuente
  miFuente = loadFont('./VCR_OSD_MONO_1.001.ttf');

  // Música (p5.sound detecta automáticamente el formato disponible)
  soundFormats('mp3');
  cancion = loadSound('./poohmusic.mp3');
}

// ============================================================
//  SETUP — se ejecuta UNA sola vez al iniciar
// ============================================================
function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas del tamaño de la ventana
  textFont(miFuente);
  textAlign(CENTER, CENTER); // Todos los textos centrados por defecto
  print('El osito bobito te invita en la búsqueda de su miel');
  reiniciar(); // Pone todo en el estado inicial
}

// ============================================================
//  REINICIAR — resetea todas las variables al estado inicial.
//  Se llama al arrancar y también cuando termina la música.
// ============================================================
function reiniciar() {
  estado              = E.INICIO;
  es_dia              = true;
  ultimo_cambio_fondo = millis();
  pooh_x              = -POOH_W;   // Pooh empieza fuera de pantalla (izquierda)
  frame_caminata      = 0;
  ultimo_frame        = millis();
  tiempo_inicio_caminata = 0;

  // Si la música estaba sonando, la detiene
  if (cancion && cancion.isPlaying()) {
    cancion.stop();
  }
  musicaIniciada = false;
  tiempoInicio   = 0;
}

// ============================================================
//  DRAW — se ejecuta ~60 veces por segundo (el "loop" principal)
// ============================================================
function draw() {
  background(0); // Limpia la pantalla con negro antes de cada frame

  // Si la canción terminó (pasaron 30s), reinicia el juego
  if (musicaIniciada && millis() - tiempoInicio > DURACION_CANCION) {
    cancion.stop();
    musicaIniciada = false;
    reiniciar();
  }

  // Delega el dibujo al estado actual
  switch (estado) {
    case E.INICIO:         dibujar_inicio();         break;
    case E.DIALOGO_HAMBRE: dibujar_dialogo_hambre(); break;
    case E.CAMINANDO:      dibujar_caminando();      break;
    case E.LLEGO_MIEL:     dibujar_llego_miel();     break;
    case E.DECISION:       dibujar_decision();        break;
    case E.COMIENDO:       dibujar_comiendo();        break;
  }
}

// ============================================================
//  ESTADO 0 · INICIO
//  Pantalla de bienvenida. Espera que el usuario presione una tecla.
// ============================================================
function dibujar_inicio() {
  image(fondo1, 0, 0, width, height); // Fondo de día a pantalla completa
  nube_texto('¡El osito bobito te invita en la búsqueda de su miel!', width / 2, height / 2);
  nube_texto('Presiona cualquier tecla para comenzar', width / 2, 470, 14);
}

// ============================================================
//  ESTADO 1 · DIÁLOGO DE HAMBRE
//  Pooh aparece parado y avisa que tiene hambre.
// ============================================================
function dibujar_dialogo_hambre() {
  image(fondo1, 0, 0, width, height);
  // Pooh centrado horizontalmente, a la altura POOH_Y
  image(pooh, width/2 - POOH_W/2, POOH_Y, POOH_W, POOH_H);
  nube_texto('¡Tengo hambre! Voy a buscar miel…', width / 2, 80);
  nube_texto('Presiona una tecla para partir', width / 2, 140, 14);
}

// ============================================================
//  ESTADO 2 · CAMINANDO
//  Pooh atraviesa la pantalla animado. El fondo alterna día/noche
//  durante 10 segundos y luego cambia al fondo del árbol de miel.
// ============================================================
function dibujar_caminando() {
  let transcurrido = millis() - tiempo_inicio_caminata;

  if (transcurrido < DURACION_INTERCALADO) {
    // Durante los primeros 10s: alterna fondo día/noche cada 2s
    if (millis() - ultimo_cambio_fondo > VELOCIDAD_FONDO) {
      es_dia = !es_dia;
      ultimo_cambio_fondo = millis();
    }
    image(es_dia ? fondo1 : fondo2, 0, 0, width, height);
  } else {
    // Después de 10s: muestra el fondo del árbol de miel
    image(img_miel1, 0, 0, width, height);
  }

  // Mueve a Pooh de izquierda a derecha; al salir, reaparece por la izquierda
  pooh_x += VELOCIDAD_POOH;
  if (pooh_x > width) { pooh_x = -POOH_W; }

  // Cambia de frame de caminata cada VELOCIDAD_CAMINATA ms (animación flip-book)
  if (millis() - ultimo_frame > VELOCIDAD_CAMINATA) {
    frame_caminata = (frame_caminata + 1) % 2; // alterna entre 0 y 1
    ultimo_frame = millis();
  }

  // Elige el frame correspondiente (camina1 o camina2)
  let img_actual = (frame_caminata === 0) ? camina1 : camina2;
  image(img_actual || pooh, pooh_x, POOH_Y, POOH_W, POOH_H);

  nube_texto('Buscando miel por el bosque…', width / 2, 80);
  nube_texto('Presiona una tecla al llegar', width / 2, 140, 14);
}

// ============================================================
//  ESTADO 3 · LLEGÓ LA MIEL
//  Pooh está parado mirando la miel. El usuario debe hacer click
//  dentro del área de la miel para avanzar.
// ============================================================
function dibujar_llego_miel() {
  image(img_miel1, 0, 0, width, height);
  // Pooh a la izquierda de la miel (MIEL_X - ancho - margen)
  image(img_poohladito, MIEL_X - POOH_W - 10, MIEL_Y, POOH_W, POOH_H);

  // Modo debug: dibuja el rectángulo clickeable en rojo
  if (DEBUG_MIEL) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(MIEL_X, MIEL_Y, MIEL_W, MIEL_H);
    noStroke();
  }

  nube_texto('¡Haz click en la miel!', width / 2, 80);
}

// ============================================================
//  ESTADO 4 · DECISIÓN (agarró la miel)
//  Pooh ya tiene la miel. Hay que hacer scroll hacia arriba para comer.
// ============================================================
function dibujar_decision() {
  image(img_mielagarrada, 0, 0, width, height); // Fondo con miel agarrada
  image(img_poohagarro, MIEL_X - POOH_W - 10, MIEL_Y, POOH_W, POOH_H);
  nube_texto('¡Encontré la miel, comeré jeje!', width / 2, 80);
  nube_texto('(scroll up para comer)', width / 2, 165, 14);
}

// ============================================================
//  ESTADO 5 · COMIENDO
//  Pooh come la miel feliz. Scroll hacia abajo reinicia el juego.
// ============================================================
function dibujar_comiendo() {
  // Fondo: usa img_miel si existe, sino cae al fondo de día
  if (img_miel) {
    image(img_miel, 0, 0, width, height);
  } else {
    image(fondo1, 0, 0, width, height);
  }

  // Pooh comiendo, en la misma posición que en los estados anteriores
  image(img_poohcomio, MIEL_X - POOH_W - 10, MIEL_Y, POOH_W, POOH_H);

  nube_texto('¡Qué rica miel! jeje', width / 2, 80);
  nube_texto('(scroll down para volver a empezar)', width / 2, 120, 14);
}

// ============================================================
//  NUBE DE TEXTO
//  Dibuja un rectángulo amarillento con borde marrón y texto adentro.
//  msg  → texto a mostrar
//  x, y → centro del recuadro
//  tam  → tamaño de fuente (default 20)
// ============================================================
function nube_texto(msg, x, y, tam = 20) {
  textSize(tam);
  let tw = textWidth(msg) + 36; // Ancho del recuadro = ancho del texto + padding
  let th = tam * 2.2;           // Alto proporcional al tamaño de fuente

  // Recuadro con esquinas redondeadas
  fill(255, 252, 220);   // Amarillo claro
  stroke(80, 60, 20);    // Borde marrón
  strokeWeight(2);
  rect(x - tw / 2, y - th / 2, tw, th, 12); // Radio 12 en esquinas

  // Texto encima, sin borde propio
  fill(50, 30, 10); // Marrón oscuro
  noStroke();
  text(msg, x, y);
}

// ============================================================
//  EVENTOS DE TECLADO
//  Avanza entre estados al presionar cualquier tecla.
// ============================================================
function keyPressed() {
  if (estado === E.INICIO) {
    estado = E.DIALOGO_HAMBRE;
    cancion.play();          // Inicia la música al comenzar
    cancion.setVolume(0.9);
    musicaIniciada = true;
    tiempoInicio   = millis();
  }
  else if (estado === E.DIALOGO_HAMBRE) {
    estado = E.CAMINANDO;
    ultimo_cambio_fondo    = millis(); // Reinicia el temporizador del fondo
    tiempo_inicio_caminata = millis(); // Marca cuándo empezó la caminata
    pooh_x = -POOH_W;                 // Pooh parte desde fuera de pantalla
  }
  else if (estado === E.CAMINANDO) {
    estado = E.LLEGO_MIEL; // El usuario decide que ya "llegó"
  }
}

// ============================================================
//  EVENTO DE CLICK
//  Solo activo en el estado LLEGO_MIEL.
//  Verifica si el click cayó dentro del área de la miel.
// ============================================================
function mousePressed() {
  if (estado === E.LLEGO_MIEL) {
    if (
      mouseX > MIEL_X && mouseX < MIEL_X + MIEL_W &&
      mouseY > MIEL_Y && mouseY < MIEL_Y + MIEL_H
    ) {
      estado = E.DECISION; // ¡Le dio a la miel!
    }
  }
}

// ============================================================
//  EVENTO DE SCROLL
//  Scroll arriba (delta > 0) en DECISION → pasa a COMIENDO.
//  Scroll abajo (delta < 0) en COMIENDO  → reinicia el juego.
//  return false evita que la página haga scroll normal.
// ============================================================
function mouseWheel(event) {
  if (estado === E.DECISION && event.delta > 0) {
    estado = E.COMIENDO;
  }
  if (estado === E.COMIENDO && event.delta < 0) {
    reiniciar();
  }
  return false;
}