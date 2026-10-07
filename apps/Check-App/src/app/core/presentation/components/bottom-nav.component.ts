import { afterNextRender, Component, computed, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { GSAPService } from '@pos-architecture/util-animations';
import { filter, map } from 'rxjs';
import { NavItem, PRIMARY_NAV, SECONDARY_NAV } from './nav-items';

@Component({
	selector: 'app-bottom-nav',
    imports: [RouterLink, RouterLinkActive],
    providers: [GSAPService],
    host: { '(document:keydown.escape)': 'closeMore()' },
    styles: [`
        :host {
            display: block;
            position: relative;
            z-index: 1;
            background-color: var(--p-content-background);
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* Línea del borde: centrada sobre el lado superior de la barra, ocupa todo su ancho. */
        .edge {
            position: absolute;
            top: -10px;
            left: 0;
            width: 100%;
            height: 20px;
            overflow: visible;
            pointer-events: none;
        }

        .edge path {
            fill: none;
            stroke: var(--p-content-border-color);
            stroke-width: 2px;
        }

        .backdrop {
            position: fixed;
            inset: 0;
            z-index: 40;
            width: 100%;
            height: 100%;
            padding: 0;
            border: 0;
            cursor: default;
            background: var(--p-mask-background);
        }

        .sheet {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 50;
            background-color: var(--p-content-background);
            border-top: 1px solid var(--p-content-border-color);
            border-radius: 20px 20px 0 0;
            padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .fade-in { animation: fade 200ms ease both; }
        .fade-out { animation: fade 200ms ease reverse both; }
        .sheet-in { animation: slide-up 280ms cubic-bezier(0.2, 0.9, 0.3, 1.05) both; }
        .sheet-out { animation: slide-up 200ms ease-in reverse both; }

        @keyframes fade {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
            .fade-in, .fade-out, .sheet-in, .sheet-out { animation: none; }
        }
    `],
	template: `
        <nav aria-label="Principal">
            <svg class="edge" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                <path #edge [attr.d]="straightEdge" vector-effect="non-scaling-stroke" />
            </svg>

            <ul class="grid grid-cols-5 px-1 pt-2 pb-1">
                @for (item of primary; track item.label) {
                    <li>
                        <a
                            class="group flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-xs opacity-70 [&.is-active]:opacity-100"
                            [routerLink]="item.path ?? null"
                            routerLinkActive="is-active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            ariaCurrentWhenActive="page"
                            (click)="ripple($index)"
                        >
                            <span class="h-7 w-11 flex items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 group-[.is-active]:bg-primary group-[.is-active]:text-primary-contrast" aria-hidden="true">
                                {{ item.short }}
                            </span>
                            <span class="max-w-full truncate">{{ item.label }}</span>
                        </a>
                    </li>
                }
                <li>
                    <button
                        #moreButton
                        type="button"
                        class="group w-full flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-xs opacity-70 hover:cursor-pointer [&.is-active]:opacity-100"
                        [class.is-active]="moreOpen() || secondaryActive()"
                        aria-haspopup="dialog"
                        aria-controls="mobile-nav-more"
                        [attr.aria-expanded]="moreOpen()"
                        (click)="openMore()"
                    >
                        <span class="h-7 w-11 flex items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 group-[.is-active]:bg-primary group-[.is-active]:text-primary-contrast" aria-hidden="true">
                            •••
                        </span>
                        <span>Más</span>
                    </button>
                </li>
            </ul>
        </nav>

        <!-- * Hoja "Más": destinos secundarios. -->
        @if (moreOpen()) {
            <button type="button" class="backdrop" tabindex="-1" aria-label="Cerrar" animate.enter="fade-in" animate.leave="fade-out" (click)="closeMore()"></button>
            <div
                #sheet
                id="mobile-nav-more"
                class="sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-more-title"
                animate.enter="sheet-in"
                animate.leave="sheet-out"
            >
                <div class="mx-auto mt-2 mb-3 h-1 w-10 rounded-full bg-(--p-content-border-color)" aria-hidden="true"></div>
                <h2 id="mobile-nav-more-title" class="px-4 pb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
                    Más opciones
                </h2>
                <ul class="flex flex-col gap-0.5 px-2 pb-4">
                    @for (item of secondary; track item.label) {
                        <li>
                            <a
                                class="flex items-center gap-3 rounded-lg p-2 hover:bg-emphasis [&.is-active]:bg-emphasis aria-disabled:opacity-50"
                                [routerLink]="item.path ?? null"
                                routerLinkActive="is-active"
                                [routerLinkActiveOptions]="{ exact: true }"
                                ariaCurrentWhenActive="page"
                                [attr.aria-disabled]="item.path ? null : true"
                                (click)="onSecondaryClick(item)"
                            >
                                <span class="size-9 flex-none flex items-center justify-center rounded-md bg-highlight text-xs font-semibold" aria-hidden="true">
                                    {{ item.short }}
                                </span>
                                <span>{{ item.label }}</span>
                            </a>
                        </li>
                    }
                </ul>
            </div>
        }
    `,
})
export class BottomNavComponent {

    // * Inyeccion de dependencias.
    private readonly router = inject(Router);
    private readonly injector = inject(Injector);
    private readonly animations = inject(GSAPService);

    // * Opciones de navegación.
    protected readonly primary = PRIMARY_NAV;
    protected readonly secondary = SECONDARY_NAV;

    // * Estados del componente.
    protected readonly moreOpen = signal(false);
    private readonly url = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects),
        ),
        { initialValue: this.router.url },
    );
    // "Más" queda marcado cuando la ruta actual es uno de sus destinos.
    protected readonly secondaryActive = computed(() => this.secondary.some((item) => item.path === this.url()));

    // * Referencias del template.
    private readonly edge = viewChild.required<ElementRef<SVGPathElement>>('edge');
    private readonly moreButton = viewChild.required<ElementRef<HTMLButtonElement>>('moreButton');
    private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');

    // * Borde animado: se abomba hacia arriba sobre la pestaña tocada y vuelve a recto temblando como gelatina.
    protected readonly straightEdge = this.edgePath(50, 10);

    // * Metodos del componente.
    // `tab` es la columna de la barra (la última es "Más").
    protected ripple(tab: number): void {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const edge = this.edge().nativeElement;
        const x = ((tab + 0.5) / (this.primary.length + 1)) * 100;
        // Parte del trazo actual, así un toque a mitad del temblor no salta.
        this.animations.killTweensOf(edge);
        this.animations.timeline()
            .to(edge, { attr: { d: this.edgePath(x, 2) }, duration: 0.15, ease: 'power2.out' })
            .to(edge, { attr: { d: this.straightEdge }, duration: 2, ease: 'elastic.out(1, 0.2)' });
    }

    protected openMore(): void {
        this.moreOpen.set(true);
        // La hoja existe hasta el siguiente render: ahí se mueve el foco a su primera opción.
        afterNextRender(
            () => this.sheet()?.nativeElement.querySelector<HTMLElement>('a[href]')?.focus(),
            { injector: this.injector },
        );
    }

    protected closeMore(restoreFocus = true): void {
        if (!this.moreOpen()) return;
        this.moreOpen.set(false);
        if (restoreFocus) this.moreButton().nativeElement.focus();
    }

    protected onSecondaryClick(item: NavItem): void {
        // Las opciones sin ruta no navegan: la hoja se queda abierta.
        if (!item.path) return;
        this.closeMore(false);
        this.ripple(this.primary.length);
    }

    // Borde en el viewBox 100x20 con la punta en (x, y); con y=10 queda recto. Siempre tiene los mismos números para que GSAP interpole `d`.
    private edgePath(x: number, y: number): string {
        return `M0 10 C${x / 2} 10 ${x / 2} ${y} ${x} ${y} C${(x + 100) / 2} ${y} ${(x + 100) / 2} 10 100 10`;
    }
}
