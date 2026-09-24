import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, effect, inject, model } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { TABLET_QUERY } from './breakpoints';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-items';

// * Lo visual del colapso (etiquetas ocultas, iconos centrados) depende del ancho real del sidebar
// con container queries (@max-[8rem]:...), no de JS: así el HTML prerenderizado ya se ve bien en tablet.
@Component({
	selector: 'app-sidebar',
    imports: [RouterModule],
    styles: [`
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
            container-type: inline-size;
        }
    `],
	template: `
        <div class="w-full flex items-center flex-none justify-end @max-[8rem]:justify-center">
            <button
                type="button"
                class="bg-blue-600 min-w-10 min-h-10 rounded-lg p-2 hover:bg-blue-400 active:bg-blue-500 transition-all duration-200 hover:cursor-pointer"
                aria-controls="desktop-nav"
                [attr.aria-expanded]="!isCollapsed()"
                (click)="toggle()"
            >
                T
            </button>
        </div>
        <div id="content" class="flex-1 flex flex-col justify-between">
            @for (group of navGroups; track $index) {
                <ul class="flex flex-col gap-1">
                    @for (item of group; track item.label) {
                        <li>
                            <a
                                class="group flex items-center gap-3 rounded-lg p-1 hover:bg-white/10 [&.is-active]:bg-white/10 aria-disabled:opacity-50 @max-[8rem]:justify-center"
                                [attr.title]="isCollapsed() ? item.label : null"
                                [routerLink]="item.path ?? null"
                                routerLinkActive="is-active"
                                [routerLinkActiveOptions]="{ exact: true }"
                                ariaCurrentWhenActive="page"
                                [attr.aria-disabled]="item.path ? null : true"
                            >
                                <span class="size-8 flex-none flex items-center justify-center rounded-md bg-white/10 text-xs font-semibold group-[.is-active]:bg-blue-600" aria-hidden="true">
                                    {{ item.short }}
                                </span>
                                <span class="min-w-0 truncate @max-[8rem]:sr-only">
                                    {{ item.label }}
                                </span>
                            </a>
                        </li>
                    }
                </ul>
            }
        </div>
    `,
})
export class SidebarComponent {

    // * Inyeccion de dependencias.
    private bp = inject(BreakpointObserver);

    // * Binding del componente.
    // null = automático: el ancho lo decide la media query de wrapper.css (colapsado en tablet, abierto en desktop).
    public readonly collapsed = model.required<boolean | null>();

    // * Estados del componente.
    // En mobile este componente no se renderiza, así que "small" aquí es el rango de tablet.
    protected readonly isSmallSize = toSignal(
        this.bp.observe(TABLET_QUERY).pipe(map(r => r.matches)),
        { initialValue: this.bp.isMatched(TABLET_QUERY) }
    );
    // Estado real, resolviendo el automático con el breakpoint. Solo alimenta atributos (aria, title), no lo visual.
    protected readonly isCollapsed = computed(() => this.collapsed() ?? this.isSmallSize());

    // * Listeners del componente.
    private isFirstSizeCheck = true;
    public isSmallSizeChange = effect(() => {
        const isSmallSize = this.isSmallSize();
        // La lectura inicial no toca el estado: CSS ya muestra el ancho correcto y así no hay animación al cargar.
        if (this.isFirstSizeCheck) {
            this.isFirstSizeCheck = false;
            return;
        }
        if (isSmallSize) this.collapse();
        else this.expand();
    });

    // * Opciones del sidebar: el primer grupo va arriba y el segundo al fondo.
    protected readonly navGroups = [PRIMARY_NAV, SECONDARY_NAV];

    // * Metodos del componente.
    protected toggle(): void {
        this.collapsed.set(!this.isCollapsed());
    }
    protected collapse(): void {
        this.collapsed.set(true);
    }
    protected expand(): void {
        this.collapsed.set(false);
    }
}
