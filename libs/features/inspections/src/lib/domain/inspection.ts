export type InspectionAnswerValue = boolean | number | string;

/** fieldId (de INSPECTION_CHECKLIST) -> valor respondido. */
export type InspectionAnswers = Record<string, InspectionAnswerValue>;

export interface Inspection {
  id: string;
  subject: string;
  status: 'draft' | 'completed';
  inspectorId: string;
  answers: InspectionAnswers;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Datos necesarios para registrar una inspección. v1 no tiene flujo de
 * borrador/resumen: se llena todo el formulario y se guarda ya completa.
 */
export interface NewInspection {
  subject: string;
  inspectorId: string;
  answers: InspectionAnswers;
}
