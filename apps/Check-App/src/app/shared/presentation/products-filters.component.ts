import { afterNextRender, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputWrapperComponent } from '@pos-architecture/core';
import { FilterRegistrationId, FILTRABLE_CATALOG_OPTIONS, ProductsFiltersService } from '../application/store/products-filters.service';

@Component({
	selector: 'app-products-filters',
	imports: [FormField, InputNumber, InputText, InputWrapperComponent],
	template: `
        <div class="w-full flex flex-col items-center justify-center">
            @for (key of $activeFields(); track key) {
                <label [for]="key">{{ key }}:</label>
                @switch (key) {
                    @case ('categoria') { 
                        <lib-input-wrapper>
                            <p-inputNumber [inputId]="key" [autofocus]="false" [formField]="$any(_filters.fieldFor('categoria'))" />
                        </lib-input-wrapper>
                    }
                    @case ('taller') { <p-inputNumber [inputId]="key" [autofocus]="false" [formField]="$any(_filters.fieldFor('taller'))" /> }
                    @case ('rating') { <p-inputNumber [inputId]="key" [autofocus]="false" [formField]="$any(_filters.fieldFor('rating'))" /> }
                    @case ('disponibilidad') { <p-inputNumber [inputId]="key" [autofocus]="false" [formField]="$any(_filters.fieldFor('disponibilidad'))" /> }
                    @case ('marca') {
                        <lib-input-wrapper>
                            <input pInputText [id]="key" type="text" [formField]="_filters.fieldFor('marca')" />
                        </lib-input-wrapper>
                    }
                }
            }
        </div>
    `,
})
export class ProductsFiltersComponent {

    // * Inyeccion de dependencias.
    protected readonly _filters = inject(ProductsFiltersService);
    private readonly _destroyRef = inject(DestroyRef);

    // * Binding del componente.
    public $activeFields = input.required<FILTRABLE_CATALOG_OPTIONS[]>({alias: "activeFields"});

    // * Registro actual ante el servicio (null si aun no se registro nada).
    public _registrationId: FilterRegistrationId | null = null;

    // * Deteccion de cambios.
    public activeFieldsChanges = effect(() => {
        const fields = this.$activeFields();
        if (this._registrationId) {
            this._filters.unregisterActiveFields(this._registrationId);
        }
        this._registrationId = this._filters.registerActiveFields(fields);
    });

    // * Next Render SSR safe.
    public nextRender = afterNextRender(() => {
        this._destroyRef.onDestroy(() => {
            if (this._registrationId) {
                this._filters.unregisterActiveFields(this._registrationId);
            }
        });
    });
}
