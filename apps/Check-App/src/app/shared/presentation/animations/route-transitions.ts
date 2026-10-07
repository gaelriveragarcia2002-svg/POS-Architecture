import { inject } from '@angular/core';
import { Router, ViewTransitionInfo } from '@angular/router';

// * Callback de withViewTransitions (app.config): etiqueta cada navegación para que motion.css elija la animación.
// - A -> A/12 (baja un nivel): 'to-child', entra desde la derecha.
// - A/12 -> A (sube un nivel): 'to-parent', entra desde la izquierda.
// - Rutas hermanas (A -> B): sin etiqueta, aplica la animación base.
// Angular lo ejecuta en un contexto de inyección, por eso puede usar inject().
export function onRouteTransitionCreated({ transition }: ViewTransitionInfo): void {
    const navigation = inject(Router).currentNavigation();
    const from = path(navigation?.previousNavigation?.finalUrl);
    const to = path(navigation?.finalUrl);

    // Sin navegación previa (carga inicial) no hay de dónde venir.
    if (!from) return;
    if (to.startsWith(from + '/')) transition.types.add('to-child');
    else if (from.startsWith(to + '/')) transition.types.add('to-parent');
}

// Ruta sin query ni fragmento: /items?x=1#y -> /items.
function path(url?: { toString(): string }): string {
    return url?.toString().split(/[?#]/)[0] ?? '';
}
