import { toLabel } from './to-label';

describe('toLabel', () => {
  it.each([
    ['camelCase', 'fechaDeAlta', 'Fecha de alta'],
    ['PascalCase', 'FechaDeAlta', 'Fecha de alta'],
    ['snake_case', 'fecha_de_alta', 'Fecha de alta'],
    ['kebab-case / slug', 'fecha-de-alta', 'Fecha de alta'],
    ['SCREAMING_SNAKE_CASE', 'FECHA_DE_ALTA', 'Fecha de alta'],
    ['dot.case', 'fecha.de.alta', 'Fecha de alta'],
    ['tag con #', '#ofertaVerano', 'Oferta verano'],
    ['una sola palabra', 'categoria', 'Categoria'],
    ['acentos y ñ', 'categoríaPrincipal_año', 'Categoría principal año'],
    ['sigla al inicio', 'HTTPStatus', 'HTTP status'],
    ['sigla en medio', 'userAPIKey', 'User API key'],
    ['numeros', 'version2Beta', 'Version2 beta'],
    [
      'separadores repetidos y espacios',
      '  --fecha__de--alta  ',
      'Fecha de alta',
    ],
    ['texto ya legible', 'Fecha de alta', 'Fecha de alta'],
  ])('%s: %s -> %s', (_caso, input, expected) => {
    expect(toLabel(input)).toBe(expected);
  });

  it('devuelve vacio si no hay letras ni numeros', () => {
    expect(toLabel('')).toBe('');
    expect(toLabel(' -_ ')).toBe('');
  });
});
