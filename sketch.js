// ============================================================
// Estados del código
// Cada número representa un momento/interacción distinto
// La variable de estado controla cuál se dibujará
// ============================================================
const E = {
  INICIO: 0, // Pantalla inicial-instrucción
  CON_EL_MEDIO_DIENTE: 1, // Pooh tiene el medio diente
  NOS_JUIMOS: 2, // Pooh camina para buscar miel
  LLEGO_LA_MIEL_CASERITO: 3, // Pooh llega a la miel
  TA_SERVIO: 4, // Pooh agarra la miel (scroll para comer)
  QUEDE_POCHITO: 5, // Pooh come y queda pochito
};

// ============================================================
//  IMÁGENES
//  Se declaran acá y se cargan en el apartado de preload()
// ============================================================
let pooh; // Pooh parado - con hambre
let fondo1; // Fondo de día
let camina1; // Frame 1 caminando
let camina2; // Frame 2 caminando
let fondo2; // Fondo de noche
let img_miel; // Fondo día con la miel
let img_comiendo; // Pooh comiendo
let img_miel1; // Fondo del árbol con miel
let img_mielagarrada; // Fondo cuando Pooh agarra la miel
let img_poohladito; // Pooh de lado mirando a la miel
let img_poohagarro; // Pooh agarrando la miel
let img_poohcomio; // Pooh comiendo la miel - fin

// Fuente pixeleada
let miFuente; // se declara tipografía

// ============================================================
//  CANCIÓN DE FONDO
// ============================================================
let cancion; // se declara el archivo de la canción
let musicaIniciada = false; // la música ya está sonando
let tiempoInicio = 0; // Momento (en milisegundos) en que empieza la música
const DURACION_CANCION = 30000; // la canción durará 30 segundos

// ============================================================
//  CONSTANTES DE CONFIGURACIÓN
//  al poner estos valores acá es fácil ajustarlos sin buscarlos por el código
// ============================================================
const VELOCIDAD_FONDO = 2000; // milisegundos entre cada cambio de fondo (día/noche)
const VELOCIDAD_CAMINATA = 300; // milisegundos entre cada frame de la animación de Pooh
const VELOCIDAD_POOH = 3; // píxeles que avanza Pooh por frame

// Posición y tamaño del área clickeable de la miel
const MIEL_X = 0;
const MIEL_Y = 0;
let MIEL_W; // se asigna en setup() - ocupa todo el ancho del canvas
let MIEL_H; // se asigna en setup() - ocupa todo el alto del canvas
const DEBUG_MIEL = false; // Si es true, dibuja un rectángulo rojo sobre el área clickeable, para facilitar la configuración

// Posición fija de Pooh en las escenas de la miel
const POOH_MIEL_X = 190; 

// Tamaño y posición vertical de Pooh en gran de las escenas
const POOH_W = 200;
const POOH_H = 300;
const POOH_Y = 500; // Posición Y fija

// ============================================================
//  VARIABLES INTERNAS- estas cmbian durante el codigo
// ============================================================
let estado = 0; // Estado actual del juego - Inicio
let es_dia = true; // Alterna entre el fondo de día y noche
let ultimo_cambio_fondo = 0; // Último momento en el que cambió el fondo
let tiempo_inicio_caminata = 0; // Momento en que inicia la caminata
const DURACION_INTERCALADO = 10000; // 10s intercalando fondos - despues aparece el fondo de la miel para clickear

// Animación de caminata - alternando entre camina1 y camina2
let pooh_x; // Posición horizontal de Pooh mientras va caminando
let frame_caminata = 0; // 0 = camina1 y 1 = camina2
let ultimo_frame = 0; // Último momento en que cambió el frame

// ============================================================
//  PRELOAD — se ejecuta antes que todo, carga los archivos antes de que empieze el codigo
// ============================================================
function preload() {
  // Imágenes 
  pooh = loadImage("./winnie1.png");
  fondo1 = loadImage("./fondo1.jpg");
  camina1 = loadImage("./camina1.png");
  camina2 = loadImage("./camina2.png");
  fondo2 = loadImage("./fondo2.png");
  img_miel1 = loadImage("./miel1.jpg");
  img_mielagarrada = loadImage("./mielcita.png");
  img_poohladito = loadImage("./poohladito.png");
  img_poohagarro = loadImage("./poohagarro.png");
  img_poohcomio = loadImage("./poohcomio.png");

  // Fuente
  miFuente = loadFont("./VCR_OSD_MONO_1.001.ttf");

  // Canción
  soundFormats("mp3");
  cancion = loadSound("./poohmusic.mp3");
}

// ============================================================
//  SETUP — se ejecuta una sola vez al iniciar
// ============================================================
function setup() {
  createCanvas(windowWidth, windowHeight); // canvas del tamaño de la ventana 
  MIEL_W = windowWidth;
  MIEL_H = windowHeight;
  textFont(miFuente);
  textAlign(CENTER, CENTER); // todos los textos centrados
  print("El osito bobito te invita en la búsqueda de su miel");
  print("Para este codigo reciclé codigos anteriores y utilicé asistencia de inteligencia artificial para estructurarlo")
  reiniciar(); //reinica el codigo
}

// ============================================================
//  REINICIAR — resetea todas las variables al estado inicial, se llama al iniciar y cuando termina la música.
// ============================================================
function reiniciar() {
  estado = E.INICIO;
  es_dia = true;
  ultimo_cambio_fondo = millis();
  pooh_x = -POOH_W; // Pooh inicia fuera de pantalla - lado izquierdo
  frame_caminata = 0;
  ultimo_frame = millis();
  tiempo_inicio_caminata = 0;

  // si la música estaba sonando, la para
  if (cancion && cancion.isPlaying()) {
    cancion.stop();
  }
  musicaIniciada = false;
  tiempoInicio = 0;
}

// ============================================================
//  DRAW 
// ============================================================
function draw() {
  background(0); // prepara la pantalla 'limpiandola' con negro antes de cada frame

  // cuando la canción termine (30s), reinicia el codigo
  if (musicaIniciada && millis() - tiempoInicio > DURACION_CANCION) {
    cancion.stop();
    musicaIniciada = false;
    reiniciar();
  }

 //dependiendo en que parte del codigo estes, dibuja la pantalla que corresponde
//para enterlo mejor: es como un semáforo -si el estado es INICIO muestra la pantalla de inicio, si es NOS_JUIMOS entonces muestra a Pooh caminando, despues lo mismo con todos los estados, el `switch` revisa en que estado este el juego/codigo y llama a la función que  dibujará esa pantalla
  
  switch (estado) {
    case E.INICIO:
      dibujar_inicio();
      break;
    case E.CON_EL_MEDIO_DIENTE:
      dibujar_dialogo_hambre();
      break;
    case E.NOS_JUIMOS:
      dibujar_caminando();
      break;
    case E.LLEGO_LA_MIEL_CASERITO:
      dibujar_llego_miel();
      break;
    case E.TA_SERVIO:
      dibujar_decision();
      break;
    case E.QUEDE_POCHITO:
      dibujar_comiendo();
      break;
  }
}

// ============================================================
//  ESTADO 0 · INICIO
//  Pantalla inicial - instrucción
// ============================================================
function dibujar_inicio() {
  image(fondo1, 0, 0, width, height); // Fondo de día 
  nube_texto(
    "¡El osito bobito te invita en la búsqueda de su miel!",
    width / 2,
    height / 2
  );
  nube_texto("Presiona cualquier tecla para comenzar", width / 2, 470, 14);
}

// ============================================================
//  ESTADO 1 · CON EL MEDIO DIENTE
//  Pooh aparece con hambre
// ============================================================
function dibujar_dialogo_hambre() {
  image(fondo1, 0, 0, width, height);
  // Pooh centrado horizontalmente en el canvas
  image(pooh, width / 2 - POOH_W / 2, POOH_Y, POOH_W, POOH_H);
  nube_texto("¡Tengo hambre! Voy a buscar miel…", width / 2, 80);
  nube_texto("Presiona una tecla para partir", width / 2, 140, 14);
}

// ============================================================
//  ESTADO 2 · NOS JUIMOS
//  Pooh atraviesa la pantalla caminando, el fondo alterna día/noche
//  por 10 segundos y cambia al fondo con la miel
// ============================================================
function dibujar_caminando() {
  let transcurrido = millis() - tiempo_inicio_caminata;

  if (transcurrido < DURACION_INTERCALADO) {
    // drante los primeros 10s alterna fondo día/noche cada 2s
    if (millis() - ultimo_cambio_fondo > VELOCIDAD_FONDO) {
      es_dia = !es_dia;
      ultimo_cambio_fondo = millis();
    }
    image(es_dia ? fondo1 : fondo2, 0, 0, width, height);
  } else {
    // después de 10s muestra el fondo con la miel
    image(img_miel1, 0, 0, width, height);
  }

  // mueve a Pooh de izquierda a derecha cuando sale reaparece por la izquierda
  pooh_x += VELOCIDAD_POOH;
  if (pooh_x > width) {
    pooh_x = -POOH_W;
  }

  // cambio de frame de la caminata
  if (millis() - ultimo_frame > VELOCIDAD_CAMINATA) {
    frame_caminata = (frame_caminata + 1) % 2; // alterna entre 0 y 1
    ultimo_frame = millis();
  }

  // elige el frame correspondiente osea, camina1 o camina2
  let img_actual = frame_caminata === 0 ? camina1 : camina2;
  image(img_actual || pooh, pooh_x, POOH_Y, POOH_W, POOH_H);

  nube_texto("Buscando miel por el bosque…", width / 2, 80);
  nube_texto("Presiona una tecla al llegar", width / 2, 140, 14);
}

// ============================================================
//  ESTADO 3 · LLEGÓ LA MIEL CASERITO
//  Pooh está parado mirando la miel, ahora se debe clickear
// ============================================================
function dibujar_llego_miel() {
  image(img_miel1, 0, 0, width, height);
  // Pooh quieto a la izquierda
  image(img_poohladito, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);

  // modo debug dibuja el rectángulo clickeable, puede ser visible o no
  if (DEBUG_MIEL) {
    noFill();
    stroke(255, 0, 0);
    strokeWeight(2);
    rect(MIEL_X, MIEL_Y, MIEL_W, MIEL_H);
    noStroke();
  }

  nube_texto("¡Haz click en la miel!", width / 2, 80);
}

// ============================================================
//  ESTADO 4 · TA SERVIO'
//  Pooh ya tiene la miel, hay que scrollear para que la coma
// ============================================================
function dibujar_decision() {
  image(img_mielagarrada, 0, 0, width, height); // Fondo con pooh agarrando la miel
  image(img_poohagarro, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);
  nube_texto("¡Encontré la miel, comeré jeje!", width / 2, 80);
  nube_texto("(scroll up para comer)", width / 2, 165, 14);
}

// ============================================================
//  ESTADO 5 · QUEDÉ POCHITO
//  Pooh come la miel feliz, se scrollea hacia abajo para reiniciar el codigo
// ============================================================
function dibujar_comiendo() {
  // el fondp usa img_miel si existe, sino se va al fondo de día
  if (img_miel) {
    image(img_miel, 0, 0, width, height);
  } else {
    image(fondo1, 0, 0, width, height);
  }

  // Pooh comiendo quieto
  image(img_poohcomio, POOH_MIEL_X, POOH_Y, POOH_W, POOH_H);

  nube_texto("¡Qué rica miel! jeje", width / 2, 80);
  nube_texto("(scroll down para volver a empezar)", width / 2, 120, 14);
}

// ============================================================
//  NUBE DE TEXTO
//  Dibuja las instrucciones y dialogos del codigo
//  msg  - texto que se muestra
//  x, y - centro del recuadro
//  tam  - tamaño de fuente
// ============================================================
function nube_texto(msg, x, y, tam = 20) {
  textSize(tam);
  let tw = textWidth(msg) + 36; // ancho de la nube = ancho del texto 
  let th = tam * 2.2; // alto proporcional al tamaño de la fuente/texto

  // recuadro conmlas esquinas redondeadas
  fill(255, 252, 220); // amarillo claro
  stroke(80, 60, 20); // borde café
  strokeWeight(2);
  rect(x - tw / 2, y - th / 2, tw, th, 15); // radio en las esquinas

  // Texto encima, sin borde 
  fill(50, 30, 10); // café oscuro
  noStroke();
  text(msg, x, y);
}

// ============================================================
//  EVENTOS DEL TECLADO
//  se va avanzando entre estados al presionar cualquier tecla
// ============================================================
function keyPressed() {
  if (estado === E.INICIO) {
    estado = E.CON_EL_MEDIO_DIENTE;
    cancion.play(); // empieza la música al iniciar con la tecla
    cancion.setVolume(0.9);
    musicaIniciada = true;
    tiempoInicio = millis();
  } else if (estado === E.CON_EL_MEDIO_DIENTE) {
    estado = E.NOS_JUIMOS;
    ultimo_cambio_fondo = millis(); // reinicia el temporizador del fondo
    tiempo_inicio_caminata = millis(); // marca cuándo empezó la caminata de pooh
    pooh_x = -POOH_W; // Pooh parte fuera de pantalla
  } else if (estado === E.NOS_JUIMOS) {
    estado = E.LLEGO_LA_MIEL_CASERITO; // al aparecer la miel el usuario tiene que parar con la tecla
  }
}

// ============================================================
//  EVENTO DE CLICK
//  Solo está en el estado LLEGO_LA_MIEL_CASERITO
//  Acá se chequea si el click fue dentro del area de la miel (en este caso toda la pantalla)
// ============================================================
function mousePressed() {
  if (estado === E.LLEGO_LA_MIEL_CASERITO) {
    if (
      mouseX > MIEL_X &&
      mouseX < MIEL_X + MIEL_W &&
      mouseY > MIEL_Y &&
      mouseY < MIEL_Y + MIEL_H
    ) {
      estado = E.TA_SERVIO; // pasa despúes de tocar la 'miel' - la pantalla en cualquier lugar
    }
  }
}

// ============================================================
//  EVENTO DE SCROLL
//  Scroll arriba (delta > 0) en TA_SERVIO  - se pasa a QUEDE_POCHITO.
//  Scroll abajo (delta < 0) en QUEDE_POCHITO - se reinicia el juego.
//  return false hace que la pagina no haga scroll normal
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
