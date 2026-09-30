import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// * Demo de ruta hija (/items/detalle): sirve para comparar la transición A -> A/12 con la de rutas hermanas (motion.css).
@Component({
	selector: 'app-item-detail-page',
	imports: [RouterLink],
	template: `
        <div>
            <h2>Detalle de items</h2>
            <p>Ruta hija de /items: al entrar aquí el contenido llega desde la derecha y al volver regresa por la izquierda.</p>
            <a routerLink="/items">← Volver a Items</a>
        </div>
    `,
})
export class ItemDetailPageComponent {}
