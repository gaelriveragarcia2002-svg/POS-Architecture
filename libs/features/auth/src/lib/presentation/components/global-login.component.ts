import { Component, effect, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { LoginUseCase } from '../../application/use-case/login.use-case';
import { UsernameCredentials } from '../../domain/credentials';

@Component({
  selector: 'app-global-login',
  imports: [FormField],
  template: `
    <div class="login-container">
      <form (submit)="onSubmit($event)" class="flex flex-col gap-2 items-start">
        <label>
            Username:
            <input type="text" [formField]="$form.username" />
        </label>
        <label>
            Password:
            <input type="password" [formField]="$form.password" />
        </label>
        <!-- <p>Hello {{ loginForm.email().value() }}!</p>
        <p>Password length: {{ loginForm.password().value().length }}</p> -->
        <button type="submit">Log In</button>
        </form>
    </div>
  `,
})
export class GlobalLoginComponent {

    // * Inyeccion de casos de uso.
    public LOGIN_USECASE = inject(LoginUseCase);

    // * Atributos del componente.
    public $form = form(signal<UsernameCredentials>({
        username: "emilys",
        password: "emilyspass"
    }));

    // * Efectos del componente.
    public $formChanges = effect(() => {
        console.log('Cambio en el formulario:', this.$form().value());
    });

    // * Metodos del componente.
    public onSubmit(event: Event){
        event.preventDefault();
        this.LOGIN_USECASE.execute(this.$form().value())
        .subscribe(() => {
            console.log("Hola mundo!");
        })
    }
}
