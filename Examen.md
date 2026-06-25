## Link de web pública (github pages)

<https://link.com>

### Título del proyecto

El osito bobito te invita en la búsqueda de su miel 

### Referencia de origen / bibliografía

Serie 'Winnie The Pooh', 	
John Lounsbery, 1977.

### Imagen de referencia de proyecto

![portada](IMAGENES/portadaproyecto.png)

### Integrantes

Estudiante A [usuarioGithub](https://github.com/piromantico)

### Enlace de p5.js 

https://editor.p5js.org/luxinocte/sketches

### Relato inicial

Winnie the Pooh se encuentra en el bosque cuando de repente siente hambre, decide tomar acción e irse a buscar miel.

### Storyboard

![storyboard](IMAGENES/storyboard.jpg)

### Estados

Describe acá los estados de tu máquina (mínimo 3 para proyectos individuales, 6 para parejas, 9 para tríos), y la condición de salida. Incluye la sección de código que muestra ese estado

#### Estado 0: INICIO

Se nos presenta la primera instrucción, presionar una tecla para iniciar, al presionar cualquier tecla se pasa al estado 1.

```js
function dibujar_inicio() {
  image(fondo1, 0, 0, width, height);
  image(pooh, width/2 - POOH_W/2, POOH_Y, POOH_W, POOH_H);
  nube_texto('Presiona cualquier tecla para comenzar', width / 2, height / 2);
}

function keyPressed() {
  if (estado === E.INICIO) {
    estado = E.DIALOGO_HAMBRE;
    cancion.play();
    cancion.setVolume(0.9);
    musicaIniciada = true;
    tiempoInicio   = millis();
  }
```


#### Estado 1: TENGO EL MEDIO DIENTE

Pooh tiene hambre y decide ir en búsqueda de miel, se presiona una tecla para empezar la búsqueda 

```js
function dibujar_dialogo_hambre() {
  image(fondo1, 0, 0, width, height);
  image(pooh, width/2 - POOH_W/2, POOH_Y, POOH_W, POOH_H);
  nube_texto('¡Tengo hambre! Voy a buscar miel…', width / 2, 80);
  nube_texto('Presiona una tecla para partir', width / 2, 140, 14);
}

// en keyPressed():
else if (estado === E.DIALOGO_HAMBRE) {
  estado = E.CAMINANDO;
  ultimo_cambio_fondo    = millis();
  tiempo_inicio_caminata = millis();
  pooh_x = -POOH_W;
}
```

### Estado 2: NOS JUIMOS

Pooh camina de izquierda a derecha, el fondo va alternando entre día y noche por 10 segundos, luego se para en miel1. Al presionar una tecla se pasa al estado 3.

```js
function dibujar_caminando() {
  let transcurrido = millis() - tiempo_inicio_caminata;

  if (transcurrido < DURACION_INTERCALADO) {
    if (millis() - ultimo_cambio_fondo > VELOCIDAD_FONDO) {
      es_dia = !es_dia;
      ultimo_cambio_fondo = millis();
    }
    image(es_dia ? fondo1 : fondo2, 0, 0, width, height);
  } else {
    image(img_miel1, 0, 0, width, height);
  }

  pooh_x += VELOCIDAD_POOH;
  if (pooh_x > width) { pooh_x = -POOH_W; }

  let img_actual = (frame_caminata === 0) ? camina1 : camina2;
  image(img_actual, pooh_x, POOH_Y, POOH_W, POOH_H);

  nube_texto('Buscando miel por el bosque…', width / 2, 80);
  nube_texto('Presiona una tecla al llegar', width / 2, 140, 14);
}

// en keyPressed():
else if (estado === E.CAMINANDO) {
  estado = E.LLEGO_MIEL;
}
```

### Estado 3: LLEGO LA MIEL CASERITO

Pooh por fin encuentra su miel, aparece una zona clickeable para agarrar la miel, al clickear la agarra y se pasa al estado 4

```js
function dibujar_llego_miel() {
  image(img_miel1, 0, 0, width, height);
  if (DEBUG_MIEL) {
    noFill(); stroke(255, 0, 0); strokeWeight(2);
    rect(MIEL_X, MIEL_Y, MIEL_W, MIEL_H);
    noStroke();
  }
  nube_texto('¡Haz click en la miel!', width / 2, 80);
}

function mousePressed() {
  if (estado === E.LLEGO_MIEL) {
    if (mouseX > MIEL_X && mouseX < MIEL_X + MIEL_W &&
        mouseY > MIEL_Y && mouseY < MIEL_Y + MIEL_H) {
      estado = E.DECISION;
    }
  }
}
```

### Estado 4: A COMEEER

Dos nubes de texto aparecen, winnnie agarra la miel, se scrollea para que la coma

```js
function dibujar_decision() {
  if (img_miel) {
    image(img_miel, 0, 0, width, height);
  } else {
    image(fondo1, 0, 0, width, height);
  }
  nube_texto('¡Encontré la miel, comeré jeje!', width / 2, 80);
  nube_texto('(scroll down para comer)', width / 2, 165, 14);
}

function mouseWheel(event) {
  if (estado === E.DECISION && event.delta > 0) {  // ← > 0 para scroll hacia abajo
    estado = E.COMIENDO;
  }
  return false;
}
```

### Estado 5: QUEDÉ POCHITO

Pooh por fin come después de estar caminando días, el juego se reinicia al volver al scrollear hacia arriba.
