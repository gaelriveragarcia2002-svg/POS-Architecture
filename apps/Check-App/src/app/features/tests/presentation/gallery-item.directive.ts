import { Directive, input } from '@angular/core';

// * Contexto que recibe el ng-template de cada elemento: let-item (o $implicit), let-i="index", let-copy="copy".
export interface GalleryItemContext<T = unknown> {
  $implicit: T;
  index: number; // indice dentro de $items (la 2da copia repite 0..n-1).
  copy: boolean; // true en la 2da copia: es solo visual, para el bucle.
}

// * Marca el ng-template de cada elemento y tipa su contexto. Uso:
//     <ng-template [appGalleryItem]="products" let-product let-i="index"> ... </ng-template>
//   La lista solo sirve para que el compilador infiera T (ej. Product): no se usa en ejecucion.
@Directive({ selector: 'ng-template[appGalleryItem]', standalone: true })
export class GalleryItemDirective<T> {
  public appGalleryItem = input.required<readonly T[]>();

  // * El compilador de templates lee este guard: dentro del ng-template el contexto es GalleryItemContext<T>.
  //   El return true no importa en ejecucion, solo se usa para los tipos.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- _ctx solo existe para el type predicate.
  static ngTemplateContextGuard<T>(_dir: GalleryItemDirective<T>, _ctx: unknown): _ctx is GalleryItemContext<T> {
    return true;
  }
}
