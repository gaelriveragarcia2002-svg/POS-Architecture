# inspections

Dominio y casos de uso del feature "inspections" (field service / checklist
de inspección), compartibles entre cualquier app del workspace.

Solo contiene `domain/` y `application/`: cero dependencias de tecnología de
persistencia. Cada app aporta su propio adaptador de `infrastructure/` que
implementa el puerto `InspectionsRepository`, y su propia `presentation/`.

El checklist es fijo (`domain/checklist.ts`) — todavía no hay templates
configurables. Ver `domain/checklist-validator.ts` para la regla de negocio
de campos obligatorios.

## Running unit tests

Run `nx test inspections` to execute the unit tests.
