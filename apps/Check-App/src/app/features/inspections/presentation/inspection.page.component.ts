import { Component, afterNextRender, inject, signal } from '@angular/core';
import {
    ChecklistValidationError,
    INSPECTION_CHECKLIST,
    InspectionAnswerValue,
    InspectionAnswers,
    InspectionsStore,
    ListInspectionsUseCase,
    SaveInspectionUseCase,
} from '@pos-architecture/inspections';

@Component({
    selector: 'app-inspection-page',
    template: `
        <div>
            <p>Estado: {{ $ready() ? 'listo ✅' : 'inicializando…' }}</p>

            @if ($error(); as error) {
                <p style="color: crimson">Error: {{ error }}</p>
            }

            <form (submit)="onSubmit($event)">
                <label>
                    Sitio / equipo inspeccionado
                    <input
                        type="text"
                        [value]="subject()"
                        (input)="subject.set($any($event.target).value)"
                    />
                </label>

                <label>
                    Inspector
                    <input
                        type="text"
                        [value]="inspectorId()"
                        (input)="inspectorId.set($any($event.target).value)"
                    />
                </label>

                @for (field of checklist; track field.id) {
                    <div>
                        <label [attr.for]="field.id">
                            {{ field.label }} @if (field.required) { * }
                        </label>
                        <!-- Los inputs se bindean desde answers() y no solo
                             hacia ella: al limpiar el formulario tras guardar,
                             el DOM tiene que reflejar el reset. -->
                        @switch (field.type) {
                            @case ('boolean') {
                                <input
                                    [id]="field.id"
                                    type="checkbox"
                                    [checked]="answers()[field.id] === true"
                                    (change)="setAnswer(field.id, $any($event.target).checked)"
                                />
                            }
                            @case ('number') {
                                <input
                                    [id]="field.id"
                                    type="number"
                                    [value]="answers()[field.id] ?? ''"
                                    (input)="setAnswer(field.id, $any($event.target).valueAsNumber)"
                                />
                            }
                            @default {
                                <input
                                    [id]="field.id"
                                    type="text"
                                    [value]="answers()[field.id] ?? ''"
                                    (input)="setAnswer(field.id, $any($event.target).value)"
                                />
                            }
                        }
                    </div>
                }

                @if ($formErrors().length > 0) {
                    <ul style="color: crimson">
                        @for (e of $formErrors(); track e.fieldId) {
                            <li>{{ e.message }}</li>
                        }
                    </ul>
                }

                <button type="submit">Guardar inspección</button>
            </form>

            <hr />
            <h2>Historial</h2>
            <ul>
                @for (inspection of $inspections(); track inspection.id) {
                    <li>{{ inspection.subject }} — {{ inspection.completedAt }}</li>
                }
            </ul>
        </div>
    `,
})
export class InspectionPageComponent {

    // * Inyeccion de casos de uso.
    private readonly listInspections = inject(ListInspectionsUseCase);
    private readonly saveInspection = inject(SaveInspectionUseCase);

    // * Estados de lectura (via store de la feature).
    private readonly store = inject(InspectionsStore);
    public $inspections = this.store.inspections;
    public $ready = this.store.ready;
    public $error = this.store.error;

    // * El checklist es fijo: viene del dominio, no de la DB.
    protected readonly checklist = INSPECTION_CHECKLIST;

    // * Estado local del formulario.
    protected subject = signal('');
    protected inspectorId = signal('');
    protected answers = signal<InspectionAnswers>({});
    protected $formErrors = signal<ChecklistValidationError[]>([]);

    // * Constructor del componente.
    public constructor() {
        // El Worker solo existe en el browser: en SSR no hay Worker ni OPFS.
        afterNextRender(() => {
            this.listInspections.execute().subscribe();
        });
    }

    // * Metodos del componente.
    protected setAnswer(fieldId: string, value: InspectionAnswerValue) {
        this.answers.update((current) => ({ ...current, [fieldId]: value }));
    }

    protected onSubmit(event: Event) {
        event.preventDefault();
        this.saveInspection
            .execute({
                subject: this.subject(),
                inspectorId: this.inspectorId(),
                answers: this.answers(),
            })
            .subscribe((result) => {
                if (result.ok) {
                    this.$formErrors.set([]);
                    this.subject.set('');
                    this.inspectorId.set('');
                    this.answers.set({});
                } else {
                    this.$formErrors.set(result.errors);
                }
            });
    }
}
