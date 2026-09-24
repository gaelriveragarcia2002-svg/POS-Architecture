import { Component, model } from '@angular/core';
import { RouterModule } from '@angular/router';

interface SidebarItem {
    label: string;
    short: string;
}

@Component({
	selector: 'app-sidebar',
    imports: [RouterModule],
    styles: [`
        :host {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    `],
	template: `
        <div
            class="w-full flex items-center flex-none"
            [class.justify-end]="!collapsed()"
            [class.justify-center]="collapsed()"
        >
            <button
                type="button"
                class="bg-blue-600 min-w-10 min-h-10 rounded-lg p-2 hover:bg-blue-400 active:bg-blue-500 transition-all duration-200 hover:cursor-pointer"
                aria-controls="sidebar"
                [attr.aria-expanded]="!collapsed()"
                (click)="toggle()"
            >
                T
            </button>
        </div>
        <div id="content" class="flex-1 flex flex-col justify-between">
            @for (group of navGroups; track $index) {
                <ul class="flex flex-col gap-1">
                    @for (item of group; track item.label) {
                        <li
                            class="flex items-center gap-3 rounded-lg p-1 hover:bg-white/10"
                            [class.justify-center]="collapsed()"
                            [attr.title]="collapsed() ? item.label : null"
                        >
                            <span class="size-8 flex-none flex items-center justify-center rounded-md bg-white/10 text-xs font-semibold" aria-hidden="true">
                                {{ item.short }}
                            </span>
                            <span class="whitespace-nowrap" [class.sr-only]="collapsed()">
                                {{ item.label }}
                            </span>
                        </li>
                    }
                </ul>
            }
        </div>
    `,
})
export class SidebarComponent {

    // * Binding del componente.
    readonly collapsed = model.required<boolean>();

    // * Opciones del sidebar: el primer grupo va arriba y el segundo al fondo.
    protected readonly navGroups: SidebarItem[][] = [
        [
            { label: 'Inspecciones', short: 'IN' },
            { label: 'Items', short: 'IT' },
            { label: 'Ejemplo 1', short: 'E1' },
            { label: 'Ejemplo 2', short: 'E2' },
        ],
        [
            { label: 'Consola DB', short: 'DB' },
            { label: 'Configuración', short: 'CF' },
            { label: 'Cerrar sesión', short: 'CS' },
        ],
    ];

    // * Metodos del componente.
    protected toggle(): void {
        this.collapsed.update((value) => !value);
    }
}
