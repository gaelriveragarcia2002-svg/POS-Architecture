import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GSAPService } from '@pos-architecture/util-animations';
import { BottomNavComponent } from './bottom-nav.component';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';

// * Cambio de vista: las dos navegaciones se renderizan siempre y wrapper.css muestra solo una según el ancho.
// Lo decide CSS y no JS para que el HTML prerenderizado ya salga con la vista correcta, sin parpadeo.
@Component({
	selector: 'app-wrapper',
	imports: [RouterOutlet, SidebarComponent, BottomNavComponent, FooterComponent],
    providers: [GSAPService],
    styleUrl: `./wrapper.css`,
    // Sin modificador = automático por breakpoint (wrapper.css); .wrapper--collapsed / .wrapper--expanded = lo que eligió el usuario.
    host: {
        'class': 'wrapper',
        '[class.wrapper--collapsed]': 'collapsed()',
        '[class.wrapper--expanded]': '!collapsed()',
        '[class.wrapper--ready]': 'ready()',
    },
	template: `
        <!-- * VISTA MOBILE (< 640px): barra inferior con hoja "Más". Oculta por CSS en pantallas mayores. -->
        <app-bottom-nav id="mobile-nav" class="wrapper__bottom-nav" />

        <!-- * VISTA DESKTOP / TABLET (≥ 640px): sidebar (colapsado a 80px por debajo de 1024px) + footer. Ocultos por CSS en mobile. -->
        <nav id="desktop-nav" class="wrapper__sidebar" aria-label="Principal">
            <app-sidebar [collapsed]="collapsed()" (collapsedChange)="onCollapsedChange($event)" />
            <svg class="wrapper__sidebar-edge" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
                <path #edge class="wrapper__sidebar-edge-path" [attr.d]="straightEdge" vector-effect="non-scaling-stroke" />
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

    // * Inyeccion de dependencias.
    private readonly _gsap = inject(GSAPService);

    // * Estados del componente.
    // null = automático: colapsado en tablet y abierto en desktop, resuelto por CSS sin esperar a JS.
    protected readonly collapsed = signal<boolean | null>(null);
    // Solo true en el navegador tras hidratar: habilita la animación de entrada del sidebar (wrapper.css).
    protected readonly ready = signal(false);

    // * Referencias del template.
    private readonly edge = viewChild.required<ElementRef<SVGPathElement>>('edge');

    // * Borde animado: se abomba hacia fuera al abrir (hacia dentro al cerrar) y vuelve a recto temblando como gelatina.
    // Trazos en el viewBox 40x100 (línea en x=20). Tienen los mismos números para que GSAP interpole el atributo `d`.
    protected readonly straightEdge = 'M20 0 C20 25 20 25 20 50 C20 75 20 75 20 100';
    private readonly openBump = 'M20 0 C20 25 34 25 34 50 C34 75 20 75 20 100';
    private readonly closeBump = 'M20 0 C20 25 6 25 6 50 C6 75 20 75 20 100';

    public constructor() {
        afterNextRender(() => this.ready.set(true));
    }

    // * Metodos del componente.
    protected onCollapsedChange(collapsed: boolean | null): void {
        this.collapsed.set(collapsed);
        if (collapsed === null || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const edge = this.edge().nativeElement;
        // Parte del trazo actual, así un clic a mitad del temblor no salta.
        this._gsap.killTweensOf(edge);
        this._gsap.timeline()
            .to(edge, { attr: { d: collapsed ? this.closeBump : this.openBump }, duration: 0.15, ease: 'power2.out' })
            .to(edge, { attr: { d: this.straightEdge }, duration: 2, ease: 'elastic.out(1, 0.2)' });
    }
}
