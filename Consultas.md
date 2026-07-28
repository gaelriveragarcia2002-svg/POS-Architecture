# Registro de plugins nx: https://nx.dev/docs/plugin-registry
# Tecnología Angular nx: https://nx.dev/docs/technologies/angular

Se debe instalar el plugin de angular para poder realizar los comandos de angular y ejecutar sus comandos.

# Comando ejecutado para crear este workspace: npx create-nx-workspace@latest POS-Architecture --preset=angular-monorepo
# Lista de presets disponibles: https://nx.dev/docs/reference/create-nx-workspace o utilizando npx create-nx-workspace@latest --help al crear la app

# Comandos básicos para el uso del cli de nx para una aplicación angular:

-- npx nx serve pos-architecture
-- npx nx build pos-architecture
-- npx nx test pos-architecture

# Comando crear una nueva app angular.

Como instalamos con el preset de angular ya tenemos el plugin @nx/angular pero si quisiéramos crear una app react por ejemplo primero
necesitaríamos el plugin.

para una nueva app angular utilizamos:
# npx nx g @nx/angular:app apps/otra-app-angular