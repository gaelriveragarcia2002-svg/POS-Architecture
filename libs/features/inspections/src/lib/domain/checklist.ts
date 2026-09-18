export type ChecklistFieldType = 'boolean' | 'number' | 'text';

export interface ChecklistField {
  /** Id estable: nunca se referencia por posicion/indice del array. Aunque
   * hoy el checklist es fijo, este id es lo que hace trivial migrar a un
   * esquema de respuestas normalizado (o a templates configurables) despues
   * sin romper datos ya guardados. */
  id: string;
  label: string;
  type: ChecklistFieldType;
  required: boolean;
}

/**
 * Checklist fijo v1: vive en código porque todavía no hay templates
 * configurables (ver README del lib). El día que un admin necesite editar
 * las preguntas, esto se reemplaza por datos que vengan de un
 * InspectionTemplate — el resto del dominio (Inspection, validación,
 * persistencia por fieldId) no cambia.
 */
export const INSPECTION_CHECKLIST: ChecklistField[] = [
  {
    id: 'structure-ok',
    label: 'La estructura está en buen estado',
    type: 'boolean',
    required: true,
  },
  {
    id: 'pressure-reading',
    label: 'Lectura de presión (psi)',
    type: 'number',
    required: true,
  },
  {
    id: 'notes',
    label: 'Observaciones',
    type: 'text',
    required: false,
  },
];
