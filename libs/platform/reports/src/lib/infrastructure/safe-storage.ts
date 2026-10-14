/** `localStorage` o null (SSR, modo privado o acceso bloqueado). */
export const safeLocalStorage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};
