# items

Dominio y casos de uso del feature "items", compartibles entre cualquier app
del workspace (web, y a futuro mobile con Capacitor).

Solo contiene `domain/` y `application/`: cero dependencias de tecnologia de
persistencia (sin drizzle, sin sqlite-wasm, sin plugins de Capacitor). Cada
app aporta su propio adaptador de `infrastructure/` que implementa el puerto
`ItemsRepository` con la tecnologia que le corresponda, y su propia
`presentation/`.

## Running unit tests

Run `nx test items` to execute the unit tests.
