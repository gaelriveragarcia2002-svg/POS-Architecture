import { Component, inject } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { ThemeService } from '@pos-architecture/util-theme';

// * Clases escritas completas para que Tailwind las detecte al escanear el código (no se pueden armar con interpolación).
const PRIMARY_SWATCHES = [
    { shade: 50, cls: 'bg-primary-50' },
    { shade: 100, cls: 'bg-primary-100' },
    { shade: 200, cls: 'bg-primary-200' },
    { shade: 300, cls: 'bg-primary-300' },
    { shade: 400, cls: 'bg-primary-400' },
    { shade: 500, cls: 'bg-primary-500' },
    { shade: 600, cls: 'bg-primary-600' },
    { shade: 700, cls: 'bg-primary-700' },
    { shade: 800, cls: 'bg-primary-800' },
    { shade: 900, cls: 'bg-primary-900' },
    { shade: 950, cls: 'bg-primary-950' },
];

const SURFACE_SWATCHES = [
    { shade: 0, cls: 'bg-surface-0' },
    { shade: 50, cls: 'bg-surface-50' },
    { shade: 100, cls: 'bg-surface-100' },
    { shade: 200, cls: 'bg-surface-200' },
    { shade: 300, cls: 'bg-surface-300' },
    { shade: 400, cls: 'bg-surface-400' },
    { shade: 500, cls: 'bg-surface-500' },
    { shade: 600, cls: 'bg-surface-600' },
    { shade: 700, cls: 'bg-surface-700' },
    { shade: 800, cls: 'bg-surface-800' },
    { shade: 900, cls: 'bg-surface-900' },
    { shade: 950, cls: 'bg-surface-950' },
];

/**
 * Demo de util-theme: cambia entre los 2 temas y su modo claro/oscuro (4 combinaciones) y muestra que tanto las
 * clases de Tailwind ligadas al tema (bg-primary-*, bg-surface-*, text-color...) como los componentes de Optimus
 * se actualizan a la vez.
 */
@Component({
    selector: 'app-theme-demo-page',
    imports: [Button, InputText],
    template: `
        <section class="flow rounded-border bg-surface-0 dark:bg-surface-900 text-color p-6">
            <h2>Temas</h2>
            <p class="text-muted-color">Tema: <strong>{{ _theme.theme() }}</strong> · Modo: <strong>{{ _theme.mode() }}</strong></p>

            <div class="flex flex-wrap gap-2">
                @for (name of _theme.themes; track name) {
                    <p-button
                        [label]="name"
                        [outlined]="name !== _theme.theme()"
                        (onClick)="_theme.setTheme(name)"
                    />
                }
                <p-button
                    [label]="_theme.mode() === 'dark' ? 'Modo claro' : 'Modo oscuro'"
                    severity="secondary"
                    (onClick)="_theme.toggleMode()"
                />
            </div>

            <h3>Primary (Tailwind)</h3>
            <div class="grid grid-cols-6 sm:grid-cols-11 gap-2">
                @for (swatch of primarySwatches; track swatch.shade) {
                    <div class="flex flex-col items-center gap-1">
                        <div class="h-12 w-full rounded-border border border-surface-200 dark:border-surface-700" [class]="swatch.cls"></div>
                        <small class="text-muted-color">{{ swatch.shade }}</small>
                    </div>
                }
            </div>

            <h3>Surface (Tailwind)</h3>
            <div class="grid grid-cols-6 sm:grid-cols-12 gap-2">
                @for (swatch of surfaceSwatches; track swatch.shade) {
                    <div class="flex flex-col items-center gap-1">
                        <div class="h-12 w-full rounded-border border border-surface-200 dark:border-surface-700" [class]="swatch.cls"></div>
                        <small class="text-muted-color">{{ swatch.shade }}</small>
                    </div>
                }
            </div>

            <h3>Componentes de Optimus</h3>
            <div class="flex flex-wrap items-center gap-2">
                <p-button label="Primary" />
                <p-button label="Outlined" [outlined]="true" />
                <p-button label="Text" [text]="true" />
                <input pInputText placeholder="Input de Optimus" />
            </div>

            <h3>Utilidades semánticas</h3>
            <div class="flex flex-wrap gap-2">
                <span class="rounded-border bg-primary text-primary-contrast px-3 py-1">bg-primary</span>
                <span class="rounded-border bg-highlight px-3 py-1">bg-highlight</span>
                <span class="rounded-border border border-primary text-primary px-3 py-1">text-primary</span>
            </div>
        </section>
    `,
})
export class ThemeDemoPageComponent {

    // * Inyeccion de dependencias.
    protected readonly _theme = inject(ThemeService);

    // * Datos de la demo.
    protected readonly primarySwatches = PRIMARY_SWATCHES;
    protected readonly surfaceSwatches = SURFACE_SWATCHES;
}
