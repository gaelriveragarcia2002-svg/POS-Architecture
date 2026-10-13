import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      Character stats: <span>{{ totalSpentPoints }} de {{ $totalPoints() }}</span> points
      <form [formGroup]="form">
        <div>
          <button (click)="handleRemovePoint('strenght')" >-</button>
          <input type="number" formControlName="strenght" step="1" readonly />
          <button (click)="handleAddPoint('strenght')">+</button>
            Strength
        </div>
        <div>
          <button (click)="handleRemovePoint('speed')">-</button>
          <input type="number" formControlName="speed" step="1" readonly />
          <button (click)="handleAddPoint('speed')">+</button>
            Speed
        </div>
        <div>
          <button (click)="handleRemovePoint('intelligence')">-</button>
          <input type="number" formControlName="intelligence" step="1" readonly />
          <button (click)="handleAddPoint('intelligence')">+</button>
            Intelligence
        </div>
      </form>
    </div>
  `,
    styles: [
        `
            input {
                width: 50px;
                text-align: center;
            }
        `
    ]
})
export class TestPageComponent {

    // * Binding del componente.
   public $totalPoints = input(5, {alias: 'totalPoints'});

    // * Inyeccion de dependencias.
    private readonly _fb = inject(FormBuilder);

    // * Formularios del componente.
    public form = this._fb.group({
        "strenght": this._fb.control<number>(0, [Validators.min(0), Validators.max(this.$totalPoints())]),
        "speed": this._fb.control<number>(0, [Validators.min(0), Validators.max(this.$totalPoints())]),
        "intelligence": this._fb.control<number>(0, [Validators.min(0), Validators.max(this.$totalPoints())])
    });

    // * Metodos del componente.
    public handleAddPoint(controlName: string){
        const control = this.form.get(controlName);
        if (this.remainingPoints && control && control.value < this.$totalPoints()){
            control.setValue(control.getRawValue() + 1);
        }
        else if(!this.remainingPoints && control && control.value !== this.$totalPoints()){
            this.handleFindNextControl(controlName);
        }
    }

    public handleRemovePoint(controlName: string){
        const control = this.form.get(controlName);
        if(control && control.value > 0 && control.value <= this.$totalPoints()){
            control.setValue(control.getRawValue() - 1);
        }
    }

    private handleFindNextControl(controlName: string) {
        // * Si ya no hay puntos restantes y el control actual no tiene todos los puntos asignados:
        // * Se buscara el primer control diferente del actual, se le restara un punto y se le asignara al actual.x
        //  Siguiente indice.
        const next_index = Object.entries(this.form.controls).findIndex(([key]) => key !== controlName && this.form.get(key)?.value > 0);
        // Siguiente control por nombre.
        const next_control_name = Object.keys(this.form.controls)[next_index];
        // Siguiente control por referencia.
        const next_control = this.form.get(next_control_name);
        //  Si el control siguiente tiene puntos, se le resta un punto y se le asigna al control actual.
        if(next_control_name && next_control && next_control.value > 0){
            // * Se le resta un punto al control siguiente y se le asigna al control actual.
            this.handleRemovePoint(next_control_name);
            this.handleAddPoint(controlName);
        }
    }

    // * Getters y Setters del componente.
    public get totalSpentPoints(): number{
        let total = 0;
        for(const controlName in this.form.controls){
            const control = this.form.get(controlName);
            if(control){
                total += control.getRawValue();
            }
        }
        return total;
    }

    public get remainingPoints(): number{
        return this.$totalPoints() - this.totalSpentPoints;
    }
}