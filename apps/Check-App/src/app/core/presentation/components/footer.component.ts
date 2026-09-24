import { Component } from '@angular/core';

@Component({
	selector: 'app-footer',
	template: `
        <div class="flex items-center justify-between gap-4 text-sm">
            <span class="whitespace-nowrap">Check-App · v0.1.0</span>
            <span class="whitespace-nowrap">Modo offline · Sincronizado hace 2 min</span>
        </div>
    `,
})
export class FooterComponent {}
