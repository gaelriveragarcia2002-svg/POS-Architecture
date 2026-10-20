import { CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { GalleryItemDirective } from './gallery-item.directive';
import { GalleryComponent } from './gallery.component';

interface Photo {
  src: string;
  title: string;
}

interface Product {
  name: string;
  category: string;
  price: number;
  stock: number;
}

// * Pagina de pruebas: la misma galeria con tres tipos de contenido, cada uno con su ng-template tipado.
@Component({
  selector: 'app-gallery-demo-page',
  standalone: true,
  imports: [GalleryComponent, GalleryItemDirective, CurrencyPipe],
  template: `
    <div class="flex flex-col gap-8 p-4">

      <!-- * Imagenes: let-photo es Photo. -->
      <section class="flex flex-col gap-2">
        <h2 class="text-center font-semibold">Imagenes</h2>
        <app-gallery class="w-full max-w-xl mx-auto" [items]="photos">
          <ng-template [appGalleryItem]="photos" let-photo>
            <figure class="w-48">
              <img crossorigin="anonymous" draggable="false" class="w-full aspect-3/2 object-cover rounded-md"
                   [src]="photo.src" [alt]="photo.title">
              <figcaption class="mt-1 text-xs text-center">{{ photo.title }}</figcaption>
            </figure>
          </ng-template>
        </app-gallery>
      </section>

      <!-- * Cards: let-product es Product, let-i el indice real dentro de products. -->
      <section class="flex flex-col gap-2">
        <h2 class="text-center font-semibold">Cards</h2>
        <app-gallery class="w-full max-w-xl mx-auto" [items]="products" [gap]="16">
          <ng-template [appGalleryItem]="products" let-product let-i="index">
            <article class="w-52 h-full p-3 flex flex-col gap-1 rounded-lg bg-white text-gray-800 shadow">
              <span class="text-xs text-gray-500">#{{ i + 1 }} · {{ product.category }}</span>
              <h3 class="font-semibold">{{ product.name }}</h3>
              <span class="text-lg">{{ product.price | currency }}</span>
              <span class="text-xs" [class.text-red-600]="product.stock < 5">Stock: {{ product.stock }}</span>
            </article>
          </ng-template>
        </app-gallery>
      </section>

      <!-- * Textos: let-text es string. Cada elemento tiene un ancho distinto: period() mide los wrappers reales. -->
      <section class="flex flex-col gap-2">
        <h2 class="text-center font-semibold">Textos</h2>
        <app-gallery class="w-full max-w-xl mx-auto" [items]="texts" [speed]="-40" [showBar]="false">
          <ng-template [appGalleryItem]="texts" let-text>
            <span class="block px-4 py-2 rounded-full bg-white text-gray-800 whitespace-nowrap">{{ text }}</span>
          </ng-template>
        </app-gallery>
      </section>

      <!-- * Vertical: mismas cards en el otro eje. -->
      <section class="flex flex-col gap-2">
        <h2 class="text-center font-semibold">Cards (vertical)</h2>
        <app-gallery class="w-fit h-96 mx-auto" [items]="products" position="vertical">
          <ng-template [appGalleryItem]="products" let-product>
            <article class="w-52 p-3 rounded-lg bg-white text-gray-800 shadow">
              <h3 class="font-semibold">{{ product.name }}</h3>
              <span>{{ product.price | currency }}</span>
            </article>
          </ng-template>
        </app-gallery>
      </section>
    </div>
  `,
})
export class GalleryDemoPageComponent {

  public photos: Photo[] = ['Montana', 'Playa', 'Ciudad', 'Bosque', 'Desierto', 'Lago'].map((title, n) => ({
    title,
    src: `https://picsum.photos/seed/gallery-${n}/480/320`,
  }));

  public products: Product[] = [
    { name: 'Cafe americano', category: 'Bebidas', price: 35, stock: 40 },
    { name: 'Croissant', category: 'Panaderia', price: 28, stock: 3 },
    { name: 'Sandwich club', category: 'Comida', price: 89, stock: 12 },
    { name: 'Te chai', category: 'Bebidas', price: 42, stock: 18 },
    { name: 'Galleta avena', category: 'Panaderia', price: 18, stock: 2 },
    { name: 'Ensalada cesar', category: 'Comida', price: 95, stock: 7 },
  ];

  public texts: string[] = [
    'Envio gratis en compras mayores a $500',
    '2x1 en bebidas',
    'Nuevo menu de temporada',
    'Paga con tarjeta y acumula puntos',
    'Abierto 24/7',
    'Pregunta por nuestras promociones del dia',
  ];
}
