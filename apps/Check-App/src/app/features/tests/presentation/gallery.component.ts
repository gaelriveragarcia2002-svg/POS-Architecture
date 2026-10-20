import { NgClass, NgTemplateOutlet } from '@angular/common';
import { afterNextRender, booleanAttribute, Component, computed, contentChild, DestroyRef, ElementRef, inject, input, signal, TemplateRef, viewChild } from '@angular/core';
import { GalleryItemContext, GalleryItemDirective } from './gallery-item.directive';

@Component({
  selector: 'app-gallery',
  standalone: true,
  host: { class: 'block' },
  imports: [NgClass, NgTemplateOutlet],
  styles: `
    /* * Enfoque 1: la pista se desplaza con transform. Al ser la lista duplicada, en -50% (+ medio gap) la 2da copia
         queda donde estaba la 1ra y el bucle no tiene salto. */
    .marquee { animation: marquee 20s linear infinite; }
    .marquee:hover { animation-play-state: paused; }
    @keyframes marquee { to { transform: translateX(calc(-50% - 0.25rem)); } }
    @media (prefers-reduced-motion: reduce) { .marquee { animation: none; } }
  `,
  template: `
  
    <!-- <h3>1. CSS (transform + keyframes)</h3>
    <section class="max-w-[500px] p-2 w-full mx-auto bg-red-300 overflow-hidden">
      <div class="marquee flex gap-2 w-max">
        @for (img of loop; track $index) {
          <img crossorigin="anonymous" class="flex-none w-40 aspect-3/2 object-cover" [src]="img" alt="Imagen de prueba">
        }
      </div>
    </section> -->

    <section 
      class="flex size-full"
      (wheel)="onWheel($event)"
      (pointerenter)="onPointerEnter($event)"
      (pointerleave)="hovering = false"
      [ngClass]="{
        'flex-col': !vertical(),
        'flex-row': vertical()
      }"
    >

      <!-- * Sin scroll nativo: la ventana recorta y la pista interna se mueve con transform. Al lado va una barra propia.
               En vertical necesita un alto fijo para que haya algo que recortar. -->
      <div
          #viewport
          class="flex-1 min-w-0 min-h-0 overflow-hidden cursor-grab active:cursor-grabbing select-none"
          [ngClass]="vertical() ? 'touch-pan-x' : 'touch-pan-y'"
          (pointerdown)="startDrag($event, -1)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp()"
          (pointercancel)="onPointerUp()"
          >
          <!-- * Cada elemento va envuelto en un div flex-none: period() mide estos wrappers, asi funciona con cualquier
                   contenido (aunque el template tenga varios nodos raiz). dragstart se cancela para que imagenes o
                   links del contenido no inicien el arrastre nativo del navegador. -->
          <div #track class="flex will-change-transform" [ngClass]="vertical() ? 'flex-col h-max' : 'w-max'"
               [style.gap.px]="$gap()"
               (dragstart)="$event.preventDefault()">
            @for (item of loop(); track $index) {
              <div class="flex-none" [attr.aria-hidden]="$index >= $items().length || null">
                <ng-container
                  [ngTemplateOutlet]="itemTemplate() ?? defaultTemplate"
                  [ngTemplateOutletContext]="{ $implicit: item, index: $index % $items().length, copy: $index >= $items().length }"
                />
              </div>
            }
          </div>
      </div>
      
      <!-- * Barra propia: la pista es una vuelta completa. El thumb se dibuja dos veces, la 2da una pista a la izquierda:
               lo que sale por la derecha entra por la izquierda (efecto portal), overflow-hidden recorta el resto. -->
      @if ($showBar()) {
        <div 
          class="relative flex-none rounded-full bg-surface-200 dark:bg-surface-700 cursor-pointer touch-none overflow-hidden"
          [ngClass]="vertical() ? 'w-3 ml-2' : 'h-3 mt-2'"
          (pointerdown)="onTrackDown($event)"
          (pointermove)="onPointerMove($event)"
          (pointerup)="onPointerUp()"
          (pointercancel)="onPointerUp()"
        >
            @for (shift of [0, 1]; track shift) {
                @if (vertical()) {
                  <div
                    class="absolute inset-x-0 rounded-full bg-primary pointer-events-none"
                    [style.height.%]="thumb() * 100" [style.top.%]="(progress() - shift) * 100"
                  >
                  </div>
                } @else {
                  <div
                    class="absolute inset-y-0 rounded-full bg-primary pointer-events-none"
                    [style.width.%]="thumb() * 100" [style.left.%]="(progress() - shift) * 100"
                  >
                  </div>
                }
            }
        </div>
      }
    </section>

    <!-- * Template por defecto: si no se pasa un ng-template, cada elemento se trata como url de imagen. -->
    <ng-template #defaultTemplate let-src>
      <img crossorigin="anonymous" draggable="false" class="w-40 aspect-3/2 object-cover" [src]="src" alt="Imagen de prueba">
    </ng-template>
  `,
})
export class GalleryComponent {

  // * Inyeccion de dependencias.
  public destroyRef = inject(DestroyRef);
  // * Binding del componente.
  public $position = input<"vertical" | "horizontal">("horizontal", {alias: "position"});
  // * Elementos a pintar: cualquier dato (urls, productos, iconos...). Por defecto, imagenes aleatorias de prueba.
  public $items = input<unknown[]>([], {alias: "items"});
  // * px por segundo del movimiento automatico. 0 lo apaga; negativo invierte la direccion (scrollTo normaliza).
  public $speed = input(80, {alias: "speed"});
  // * Separacion en px entre elementos. period() mide el DOM, asi que el periodo se ajusta solo.
  public $gap = input(8, {alias: "gap"});
  // * ms que espera el automatico tras una interaccion manual (rueda, arrastre, barra).
  public $resumeDelay = input(1000, {alias: "resumeDelay"});
  // * Detiene el automatico mientras el mouse esta encima, para poder leer o hacer clic.
  public $pauseOnHover = input(true, {alias: "pauseOnHover", transform: booleanAttribute});
  // * Muestra la barra propia.
  public $showBar = input(true, {alias: "showBar", transform: booleanAttribute});

  // * Eje del carrusel: decide si se mide y mueve en X (ancho, izquierda) o en Y (alto, arriba).
  public vertical = computed(() => this.$position() === 'vertical');

  // * Template personalizado: el ng-template marcado con [appGalleryItem] que se pase como contenido del componente.
  public itemTemplate = contentChild(GalleryItemDirective, { read: TemplateRef<GalleryItemContext> });

  // * Atributos del componente.
  // * Lista duplicada: necesaria en ambos enfoques para que el bucle sea continuo.
  public loop = computed(() => [...this.$items(), ...this.$items()]);

  private viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private track = viewChild.required<ElementRef<HTMLElement>>('track');

  private position = 0;
  private userUntil = 0; // el automatico espera hasta este instante tras una interaccion manual.
  // * factor: px de scroll por px de puntero. -1 al arrastrar el contenido (va al reves), periodo/pista en la barra.
  private drag: { x: number; position: number; factor: number } | null = null;
  public hovering = false; // mouse encima de la galeria (solo cuenta con pauseOnHover).
  // * Si el usuario pide menos movimiento en su sistema, el automatico no avanza (arrastre y rueda siguen).
  private reducedMotion: MediaQueryList | null = null;
  private last = 0; // timestamp del frame anterior.
  private id_frame = 0; // id del requestAnimationFrame pendiente.

  public progress = signal(0); // posicion dentro de la vuelta, de 0 a 1.
  public thumb = signal(0); // tamano del thumb: fraccion visible de una vuelta.

  // * Inicializacion luego del primer render.
  public afterNextRender = afterNextRender(() => {

    // * Inicializa el ultimo valor.
    // Valores ejemplo: 721.9349999986589
    this.last = performance.now();
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 
    // * Se inicia el ciclo de ticks.
    this.id_frame = requestAnimationFrame(this.tick);

    // * Subcripcion a la destruccion del componente con un callback para cancelar la animacion.
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.id_frame));
  });
  
  // * Callbacks del componente.
  private tick = (now: number) => {
    // Valores ejemplo: (0 + (80 * (730.12349999986589 - 721.9349999986589) / 1000))
    const paused = now < this.userUntil || this.reducedMotion?.matches || (this.hovering && this.$pauseOnHover());
    if (!paused) this.scrollTo(this.position + (this.$speed() * (now - this.last) / 1000));
    this.last = now;
    this.id_frame = requestAnimationFrame(this.tick);
  };

  // * Metodos del componente.
  // * Distancia de una copia completa de la lista (incluye los gaps).
  private period() {
    const items = this.track().nativeElement.children;
    const first = items[0] as HTMLElement;
    const copy = items[this.$items().length] as HTMLElement;
    if (!copy) return 0; // sin elementos (ej. aun cargando de una API).
    return this.vertical() ? copy.offsetTop - first.offsetTop : copy.offsetLeft - first.offsetLeft;
  }

  // * Coordenada del puntero en el eje del carrusel.
  private pointer(event: PointerEvent) {
    return this.vertical() ? event.clientY : event.clientX;
  }

  // * Todo movimiento pasa por aqui. Se mantiene la posicion en [0, periodo): al ser las copias identicas el salto no
  //   se nota. Se escribe el transform directo en el DOM para no pasar por change detection en cada frame.
  private scrollTo(position: number) {
    const period = this.period();
    if (!period) return;
    // * El thumb se recalcula aqui y no solo al inicio: el contenido puede cambiar de tamano (elementos que llegan
    //   despues, imagenes que cargan, cambio de orientacion). Si el valor no cambia el signal no notifica.
    // Valores ejemplo: 481 / 1226
    const viewport = this.viewport().nativeElement;
    this.thumb.set((this.vertical() ? viewport.clientHeight : viewport.clientWidth) / period);
    this.position = ((position % period) + period) % period;
    this.track().nativeElement.style.transform = `${this.vertical() ? 'translateY' : 'translateX'}(${-this.position}px)`;
    this.progress.set(this.position / period);
  }

  private pauseAuto() {
    this.userUntil = performance.now() + this.$resumeDelay();
  }

  // * Solo el mouse cuenta como hover: en tactil pointerenter llega con cada toque y pausaria sin querer.
  public onPointerEnter(event: PointerEvent) {
    this.hovering = event.pointerType === 'mouse';
  }

  // * Con el puntero sobre la galeria (carrusel o barra) la rueda mueve el carrusel en cualquier eje: se toma el delta
  //   dominante, asi la rueda vertical del mouse y el gesto horizontal del trackpad funcionan igual. Mientras el puntero
  //   este encima la pagina no hace scroll; fuera de la galeria si.
  public onWheel(event: WheelEvent) {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    // * deltaMode 1 = lineas (Firefox con rueda de mouse): se pasa a px.
    this.scrollTo(this.position + delta * (event.deltaMode === 1 ? 16 : 1));
    this.pauseAuto();
  }

  public startDrag(event: PointerEvent, factor: number) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { x: this.pointer(event), position: this.position, factor };
    this.userUntil = Infinity;
  }

  // * Clic en la pista: centra el thumb ahi y sigue como arrastre del thumb.
  public onTrackDown(event: PointerEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const size = this.vertical() ? rect.height : rect.width;
    const x = (this.pointer(event) - (this.vertical() ? rect.top : rect.left)) / size; // 0..1 dentro de la pista.
    // * Distancia del clic al inicio del thumb, dando la vuelta: cubre tambien el pedazo que asoma por la izquierda.
    const intoThumb = (((x - this.progress()) % 1) + 1) % 1;
    if (intoThumb > this.thumb()) this.scrollTo((x - this.thumb() / 2) * this.period());
    this.startDrag(event, this.period() / size);
  }

  public onPointerMove(event: PointerEvent) {
    if (this.drag) this.scrollTo(this.drag.position + (this.pointer(event) - this.drag.x) * this.drag.factor);
  }

  public onPointerUp() {
    this.drag = null;
    this.pauseAuto();
  }
}
