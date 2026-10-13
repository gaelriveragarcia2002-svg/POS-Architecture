import { Component, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../application/reports.service';
import { ReportFormDefinition } from './report-form-definition';

/**
 * Componente genérico: recibe los reportes que le pasa el feature,
 * muestra el formulario del activo y dispara la generación.
 *
 * El renderizado de campos es genérico (itera las claves del formulario)
 * para que el ejemplo funcione tal cual. En tu app real, cada reporte
 * puede exponer su propio componente de filtros o una descripción
 * declarativa de campos.
 */
@Component({
  selector: 'app-report-runner',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (reports().length > 1) {
      <label>
        Reporte:
        <select (change)="selectedId.set($any($event.target).value)">
          @for (r of reports(); track r.id) {
            <option [value]="r.id" [selected]="r.id === active().id">{{ r.label }}</option>
          }
        </select>
      </label>
    }

    <form [formGroup]="form()" (ngSubmit)="generate()">
      @for (name of fieldNames(); track name) {
        <div>
          <label [for]="name">{{ name }}:</label>
          @if (name === 'format') {
            <select [id]="name" [formControlName]="name">
              <option value="pdf">pdf</option>
              <option value="xlsx">xlsx</option>
            </select>
          } @else if (isBoolean(name)) {
            <input [id]="name" type="checkbox" [formControlName]="name" />
          } @else {
            <input [id]="name" [type]="isDate(name) ? 'date' : 'text'" [formControlName]="name" />
          }
        </div>
      }
      <button type="submit" [disabled]="form().invalid || loading()">Generar</button>
    </form>

    @if (error()) {
      <p>{{ error() }}</p>
    }
  `,
})
export class ReportRunnerComponent {

    // * Inyeccion de dependencias.
    private fb = inject(NonNullableFormBuilder);
    private service = inject(ReportService);

    // * Lista de reportes que se pasan desde el feature. Se inyecta como input para que el componente sea genérico.
    readonly reports = input.required<ReportFormDefinition[]>();

    // * Estado del componente.
    protected selectedId = signal<string | null>(null);
    protected active = computed(() => this.reports().find((r) => r.id === this.selectedId()) ?? this.reports()[0]);
    protected form = computed(() => this.active().buildForm(this.fb));
    protected fieldNames = computed(() => Object.keys(this.form().controls));
    protected loading = signal(false);
    protected error = signal('');

    // * Metodos del componente.
    protected isBoolean(name: string): boolean {
        return typeof this.form().get(name)?.value === 'boolean';
    }

    protected isDate(name: string): boolean {
        return name === 'from' || name === 'to';
    }

    protected generate() {
        const report = this.active();
        const value = this.form().getRawValue();

        this.loading.set(true);
        this.error.set('');

        this.service.run(report, value).subscribe({
            next: (blob) => {
                this.download(blob, `${report.id}.${report.extension ?? value['format'] ?? 'bin'}`);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudo generar el reporte.');
                this.loading.set(false);
            },
        });
    }

    private download(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
