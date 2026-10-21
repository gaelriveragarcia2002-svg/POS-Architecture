import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { ErrorMessages, InputWrapperComponent, SignalValidatorsCustom, ValidatorsCustom } from '@pos-architecture/util-forms';

@Component({
  selector: 'app-test-form',
  imports: [ReactiveFormsModule, JsonPipe, InputWrapperComponent, FormField],
  template: `
    @let c = form.controls;

    <section [formGroup]="form" class="flex flex-col gap-3 mb-10">
        <!-- 1. Mensajes por defecto de Angular (required + maxlength) con [formControl] -->
        <lib-input-wrapper class="p-2 bg-red-200">
            <input type="text" [formControl]="c.prueba" />
        </lib-input-wrapper>

        <!-- 2. Validador personalizado RFC con mensaje por defecto -->
        <lib-input-wrapper class="p-2 bg-red-200" nombre="RFC">
            <input type="text" [formControl]="c.rfc" placeholder="XAXX010101000" />
        </lib-input-wrapper>

    </section>

    <section class="flex flex-col gap-3">
        <!-- 1. Mensajes por defecto de Angular (required + maxlength) con [formControl] -->
        <lib-input-wrapper class="p-2 bg-red-200">
            <input type="text" [formField]="otherForm.prueba"/>
        </lib-input-wrapper>

        <!-- 2. Validador personalizado RFC con mensaje por defecto -->
        <lib-input-wrapper class="p-2 bg-red-200" nombre="RFC">
            <input type="text" [formField]="otherForm.rfc" placeholder="XAXX010101000" />
        </lib-input-wrapper>
    </section>


    <pre class="text-xs">{{ form.value | json }} — {{ form.status }}</pre>
  `,
})
export class TestFormComponent {

    // * Inyeccion de dependencias.
    private readonly _fb = inject(FormBuilder);

    // * Formularios del componente.
    public form = this._fb.group({
        rfc: ["", [Validators.required, ValidatorsCustom.rfc]],
        prueba: ["", [Validators.maxLength(5), Validators.required]],
    });

    // * Signal Forms: los validadores van en el esquema (segundo argumento de form()).
    public otherForm = form(signal({
        rfc: "",
        prueba: "",
    }), (p) => { 
        required(p.prueba);
        maxLength(p.prueba, 5);
        required(p.rfc, { message: "El RFC es obligatorio (mensaje del validador)" });
        SignalValidatorsCustom.rfc(p.rfc);
    });

    // * Sobreescritura de mensajes para una instancia especifica.
    public readonly rfcMensajes: ErrorMessages = {
        rfc: e => `"${e.actual}" no es un RFC válido para proveedores`,
    };
}
