// ============================================================
// Estados del código
// Cada número representa un momento/interacción distinto
//  La variable de estado controla cuál se dibujará
// ============================================================
const E = {
  INICIO:                  0,   // Pantalla inicial-instrucción
  CON_EL_MEDIO_DIENTE:     1,   // Pooh tiene el medio diente
  NOS_JUIMOS:              2,   // Pooh camina para buscar miel
  LLEGO_LA_MIEL_CASERITO:  3,   // Pooh llega a la miel
  TA_SERVIO:               4,   // Pooh agarra la miel (scroll para comer)
  QUEDE_POCHITO:           5,   // Pooh come feliz la miel
};

// ============================================================
//  IMÁGENES
//  Se declaran acá y se cargan en el apartado de preload()
// ============================================================
let pooh;             // Pooh parado - con hambre
let fondo1;           // Fondo de día
let camina1;          // Frame 1 caminando
let camina2;          // Frame 2 caminando
let fondo2;           // Fondo de noche
let img_miel;         // Fondo día con la miel
let img_comiendo;     // Pooh comiendo
let img_miel1;        // Fondo del árbol con miel
let img_mielagarrada; // Fondo cuando Pooh agarra la miel
let img_poohladito;   // Pooh de lado mirando a la miel
let img_poohagarro;   // Pooh agarrando la miel
let img_poohcomio;    // Pooh comiendo la miel - fin

// Fuente pixeleada
let miFuente; // se declara tipografía personalizada

// ============================================================
//  CANCIÓN DE FONDO
// ============================================================
let cancion;                        // se declara el archivo de la canción
let musicaIniciada = false;         // la música ya está sonando
let tiempoInicio   = 0;             // Momento (en milisegundos) en que empieza la música
const DURACION_CANCION = 30000;     // la canción durará 30 segundos

// ============================================================
//  CONSTANTES DE CONFIGURACIÓN
//  al poner estos valores acá es fácil ajustarlos sin buscarlos por el código
// ============================================================
const VELOCIDAD_FONDO    = 2000; // milisegundos entre cada cambio de fondo (día/noche)
const VELOCIDAD_CAMINATA = 300;  // milisegundos entre cada frame de la animación de Pooh
const VELOCIDAD_POOH     = 3;    // píxeles que avanza Pooh por frame

// Posición y tamaño del área clickeable de la miel
// MIEL_W y MIEL_H se asignan en setup() porque windowWidth/Height
// no están disponibles antes de que p5.js arranque
const MIEL_X = 0;
const MIEL_Y = 0;
let MIEL_W; // se asigna en setup() → ocupa todo el ancho
let MIEL_H; // se asigna en setup() → ocupa todo el alto
const DEBUG_MIEL = true; // Si es true, dibuja un rectángulo rojo sobre el área clickeable

// Posición fija de Pooh en las escenas de la miel
// (antes era MIEL_X - POOH_W - 10, pero con MIEL_X=0 quedaba fuera de pantalla)
const POOH_MIEL_X = 190; // ajustá este valor según tu fondo

// Tamaño y posición vertical de Pooh en la mayoría de las escenas
const POOH_W = 200;
const POOH_H = 300;
const POOH_Y = 500; // Posición Y fija para que siempre esté "parado"

// ============================================================
//  VARIABLES INTERNAS (cambian durante el juego)
// ============================================================
let estado = 0;                      // Estado actual del juego (usa E.XXXX)
let es_dia              = true;      // Alterna entre fondo de día y noche
let ultimo_cambio_fondo = 0;         // Último momento en que cambió el fondo
let tiempo_inicio_caminata = 0;      // Momento en que empezó la caminata
const DURACION_INTERCALADO = 10000;  // 10s intercalando fondos, luego fondo de miel

// Animación de caminata: alterna entre camina1 y camina2
let pooh_x;             // Posición horizontal de Pooh mientras camina
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
  // Ahora sí windowWidth/Height están disponibles, se asignan acá
  MIEL_W = windowWidth;
  MIEL_H = windowHeight;
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
    case E.INICIO:                dibujar_inicio();         break;
    case E.CON_EL_MEDIO_DIENTE:  dibujar_dialogo_hambre(); break;
    case E.NOS_JUIMOS:           dibujar_caminando();      break;
    case E.LLEGO_LA_MIEL_CASERITO: dibujar_llego_miel();   break;
    case E.TA_SERVIO:            dibujar_decision();       break;
    case E.QUEDE_POCHITO:        dibujar_comiendo();       break;
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
//  ESTADO 1 · CON EL MEDIO DIENTE
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
//  ESTADO 2 · NOS JUIMOS
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
//  ESTADO 3 · LLEGÓ LA MIEL CASERITO
//  Pooh está parado mirando la miel. El usuario debe hacer click
//  dentro del área de la miel para avanzar.
// ============================================================
function dibujar_llego_miel() {
  image(img_miel1, 0, 0, width, height);
  // Pooh en posición fija a la izquierda
  image(img_poohladito, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);

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
//  ESTADO 4 · TA SERVIO'
//  Pooh ya tiene la miel. Hay que hacer scroll hacia arriba para comer.
// ============================================================
function dibujar_decision() {
  image(img_mielagarrada, 0, 0, width, height); // Fondo con miel agarrada
  image(img_poohagarro, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);
  nube_texto('¡Encontré la miel, comeré jeje!', width / 2, 80);
  nube_texto('(scroll up para comer)', width / 2, 165, 14);
}

// ============================================================
//  ESTADO 5 · QUEDÉ POCHITO
//  Pooh come la miel feliz. Scroll hacia abajo reinicia el juego.
// ============================================================
function dibujar_comiendo() {
  // Fondo: usa img_miel si existe, sino cae al fondo de día
  if (img_miel) {
    image(img_miel, 0, 0, width, height);
  } else {
    image(fondo1, 0, 0, width, height);
  }

  // Pooh comiendo en posición fija
  image(img_poohcomio, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);

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
    estado = E.CON_EL_MEDIO_DIENTE;
    cancion.play();          // Inicia la música al comenzar
    cancion.setVolume(0.9);
    musicaIniciada = true;
    tiempoInicio   = millis();
  }
  else if (estado === E.CON_EL_MEDIO_DIENTE) {
    estado = E.NOS_JUIMOS;
    ultimo_cambio_fondo    = millis(); // Reinicia el temporizador del fondo
    tiempo_inicio_caminata = millis(); // Marca cuándo empezó la caminata
    pooh_x = -POOH_W;                 // Pooh parte desde fuera de pantalla
  }
  else if (estado === E.NOS_JUIMOS) {
    estado = E.LLEGO_LA_MIEL_CASERITO; // El usuario decide que ya "llegó"
  }
}

// ============================================================
//  EVENTO DE CLICK
//  Solo activo en el estado LLEGO_LA_MIEL_CASERITO.
//  Verifica si el click cayó dentro del área de la miel (toda la pantalla).
// ============================================================
function mousePressed() {
  if (estado === E.LLEGO_LA_MIEL_CASERITO) {
    if (
      mouseX > MIEL_X && mouseX < MIEL_X + MIEL_W &&
      mouseY > MIEL_Y && mouseY < MIEL_Y + MIEL_H
    ) {
      estado = E.TA_SERVIO; // ¡Le dio a la miel!
    }
  }
}

// ============================================================
//  EVENTO DE SCROLL
//  Scroll arriba (delta > 0) en TA_SERVIO    → pasa a QUEDE_POCHITO.
//  Scroll abajo (delta < 0) en QUEDE_POCHITO → reinicia el juego.
//  return false evita que la página haga scroll normal.
// ============================================================
function mouseWheel(event) {
  if (estado === E.TA_SERVIO && event.delta > 0) {
    estado = E.QUEDE_POCHITO;
  }
  if (estado === E.QUEDE_POCHITO && event.delta < 0) {
    reiniciar();
  }
  return false;
}