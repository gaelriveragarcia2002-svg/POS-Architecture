import { afterNextRender, Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './bottom-nav.component';
import { edgeWave, verticalEdge } from './edge-wave';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';

// * Cambio de vista: las dos navegaciones se renderizan siempre y wrapper.css muestra solo una según el ancho.
// Lo decide CSS y no JS para que el HTML prerenderizado ya salga con la vista correcta, sin parpadeo.
@Component({
	selector: 'app-wrapper',
	imports: [RouterOutlet, SidebarComponent, BottomNavComponent, FooterComponent],
    styleUrl: `./wrapper.css`,
    // Sin modificador = automático por breakpoint (wrapper.css); .wrapper--collapsed / .wrapper--expanded = lo que eligió el usuario.
    host: {
        'class': 'wrapper',
        '[class.wrapper--collapsed]': 'collapsed() === true',
        '[class.wrapper--expanded]': 'collapsed() === false',
        '[class.wrapper--ready]': 'ready()',
    },
	template: `
        <!-- * VISTA MOBILE (< 640px): barra inferior con hoja "Más". Oculta por CSS en pantallas mayores. -->
        <app-bottom-nav id="mobile-nav" class="wrapper__bottom-nav" />

        <!-- * VISTA DESKTOP / TABLET (≥ 640px): sidebar (colapsado a 80px por debajo de 1024px) + footer. Ocultos por CSS en mobile. -->
        <nav id="desktop-nav" class="wrapper__sidebar" aria-label="Principal">
            <app-sidebar [collapsed]="collapsed()" (collapsedChange)="onCollapsedChange($event)" />
            <svg class="wrapper__sidebar-edge" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
                <path class="wrapper__sidebar-edge-path" [attr.d]="straightEdge" vector-effect="non-scaling-stroke">
                    <animate
                        #openWave
                        attributeName="d"
                        begin="indefinite"
                        dur="600ms"
                        calcMode="spline"
                        [attr.values]="openEdge.values"
                        [attr.keyTimes]="openEdge.keyTimes"
                        [attr.keySplines]="openEdge.keySplines"
                    />
                    <animate
                        #closeWave
                        attributeName="d"
                        begin="indefinite"
                        dur="600ms"
                        calcMode="spline"
                        [attr.values]="closeEdge.values"
                        [attr.keyTimes]="closeEdge.keyTimes"
                        [attr.keySplines]="closeEdge.keySplines"
                    />
                </path>
            </svg>
        </nav>
        <footer id="desktop-footer" class="wrapper__footer">
            <app-footer />
        </footer>

        <!-- * Contenido: compartido por ambas vistas. -->
        <main class="wrapper__content">
            <router-outlet />
        </main>
    `,
})
export class WrapperComponent {

    // * Estados del componente.
    // null = automático: colapsado en tablet y abierto en desktop, resuelto por CSS sin esperar a JS.
    protected readonly collapsed = signal<boolean | null>(null);
    // Solo true en el navegador tras hidratar: habilita la animación de entrada del sidebar (wrapper.css).
    protected readonly ready = signal(false);

    // * Formas del borde animado.
    protected readonly straightEdge = verticalEdge(0);
    protected readonly openEdge = edgeWave(verticalEdge, [0, 14, -9, 5, -2, 0]);
    protected readonly closeEdge = edgeWave(verticalEdge, [0, -10, 6, -3, 0]);

    // * Referencias a las animaciones SVG.
    private readonly openWave = viewChild.required<ElementRef<SVGAnimateElement>>('openWave');
    private readonly closeWave = viewChild.required<ElementRef<SVGAnimateElement>>('closeWave');

    public constructor() {
        afterNextRender(() => this.ready.set(true));
    }

    // * Metodos del componente.
    protected onCollapsedChange(collapsed: boolean | null): void {
        this.collapsed.set(collapsed);
        if (collapsed === null) return;
        (collapsed ? this.closeWave() : this.openWave()).nativeElement.beginElement();
    }
}
