import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';

// * Borde del sidebar: 4 curvas en un viewBox de 40x100 con la línea en x=20.
// `amplitude` desplaza los puntos de control alternando lado, lo que forma la onda.
const edgePath = (amplitude: number): string => {
    const out = 20 + amplitude;
    const back = 20 - amplitude;
    return `M20 0 C${out} 8 ${out} 17 20 25 C${back} 33 ${back} 42 20 50 C${out} 58 ${out} 67 20 75 C${back} 83 ${back} 92 20 100`;
};

// * Cada número es un fotograma de la onda: amplitud en px, alternando signo para que ondule y se amortigüe.
const edgeWave = (amplitudes: number[]) => ({
    values: amplitudes.map(edgePath).join(';'),
    keyTimes: amplitudes.map((_, i) => i / (amplitudes.length - 1)).join(';'),
    keySplines: amplitudes.slice(1).map(() => '0.45 0 0.55 1').join(';'),
});

@Component({
	selector: 'app-wrapper',
	imports: [RouterOutlet, SidebarComponent, FooterComponent],
    styleUrl: `./wrapper.css`,
    host: { '[class.collapsed]': 'collapsed()' },
	template: `
        <nav class="sidebar" id="sidebar" aria-label="Principal">
            <app-sidebar [collapsed]="collapsed()" (collapsedChange)="onCollapsedChange($event)" />
            <svg class="sidebar-edge" viewBox="0 0 40 100" preserveAspectRatio="none" aria-hidden="true">
                <path [attr.d]="straightEdge" vector-effect="non-scaling-stroke">
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
        <main class="content">
            <router-outlet />
        </main>
        <footer class="footer">
            <app-footer />
        </footer>
    `,
})
export class WrapperComponent {

    // * Estados del componente.
    protected readonly collapsed = signal(false);

    // * Formas del borde animado.
    protected readonly straightEdge = edgePath(0);
    protected readonly openEdge = edgeWave([0, 14, -9, 5, -2, 0]);
    protected readonly closeEdge = edgeWave([0, -10, 6, -3, 0]);

    // * Referencias a las animaciones SVG.
    private readonly openWave = viewChild.required<ElementRef<SVGAnimateElement>>('openWave');
    private readonly closeWave = viewChild.required<ElementRef<SVGAnimateElement>>('closeWave');

    // * Metodos del componente.
    protected onCollapsedChange(collapsed: boolean): void {
        this.collapsed.set(collapsed);
        (collapsed ? this.closeWave() : this.openWave()).nativeElement.beginElement();
    }
}
