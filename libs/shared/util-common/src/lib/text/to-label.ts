// Cualquier caracter que no sea letra o numero (Unicode, para no romper acentos ni ñ).
const SEPARATORS = /[^\p{L}\p{N}]+/u;

// Convierte keys, slugs, tags, camelCase, snake_case, etc. a texto legible:
// 'fechaDeAlta' | 'fecha-de-alta' | 'FECHA_DE_ALTA' -> 'Fecha de alta'.
// Las siglas escritas en mayusculas se conservan ('userAPIKey' -> 'User API key'),
// salvo que todo el texto venga en mayusculas (ahi no se distinguen de palabras).
export function toLabel(value: string): string {
  const allUppercase =
    value === value.toUpperCase() && value !== value.toLowerCase();

  const words = value
    .replace(/(\p{Ll}|\p{N})(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .split(SEPARATORS)
    .filter(Boolean)
    .map((word) =>
      !allUppercase && isAcronym(word) ? word : word.toLowerCase(),
    );

  const label = words.join(' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function isAcronym(word: string): boolean {
  return word.length > 1 && word === word.toUpperCase() && /\p{L}/u.test(word);
}
