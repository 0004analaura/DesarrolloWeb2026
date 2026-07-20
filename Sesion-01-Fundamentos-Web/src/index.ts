/**
 * HTTP Inspector CLI
 *
 * Tarea de la Sesión 1: Fundamentos de la Web
 *
 * Esta tarea NO usa la red, ni async/await, ni librerías externas.
 * Solo la biblioteca estándar de Node + tipos básicos de TypeScript.
 *
 * Idea: aplicar lo que aprendiste sobre HTTP (URLs, métodos, códigos
 * de estado y cabeceras) implementando pequeñas funciones puras.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Resultado de analizar una URL. */
export interface UrlParts {
  /** Protocolo tal como lo devuelve la WHATWG URL, p. ej. "https:". */
  protocol: string;
  /** Host (puede incluir puerto), p. ej. "api.ejemplo.com:443". */
  host: string;
  /** Ruta, p. ej. "/users". */
  pathname: string;
  /** Query string con el "?" inicial, p. ej. "?id=1&name=Ana". */
  search: string;
  /** Lista de pares [clave, valor] de los query params. */
  query: Array<[string, string]>;
}

/** Categoría de un código de estado HTTP. */
export type StatusCategory =
  | "1xx Informativo"
  | "2xx Éxito"
  | "3xx Redirección"
  | "4xx Error del cliente"
  | "5xx Error del servidor"
  | "Desconocido";

/** Mapa de cabeceras HTTP. */
export type Headers = Record<string, string>;

// ---------------------------------------------------------------------------
// Funciones a implementar
// ---------------------------------------------------------------------------

/**
 * Analiza una URL y devuelve sus partes principales.
 * @param url - La URL a analizar.
 * @returns Un objeto con protocolo, host, pathname, search y query.
 */
export function parseUrl(url: string): UrlParts {
  const urlAnalizada = new URL(url);

  const protocolo = urlAnalizada.protocol;
  const host = urlAnalizada.host;
  const ruta = urlAnalizada.pathname;
  const consulta = urlAnalizada.search;

  const parametros: Array<[string, string]> = [];
  urlAnalizada.searchParams.forEach((valor, clave) => {
    parametros.push([clave, valor]);
  });

  const resultado: UrlParts = {
    protocol: protocolo,
    host: host,
    pathname: ruta,
    search: consulta,
    query: parametros,
  };

  return resultado;
}

/**
 * Clasifica un código de estado HTTP en su categoría.
 * @param code - El código de estado HTTP a clasificar.
 * @returns La categoría correspondiente al código.
 */
export function classifyStatus(code: number): StatusCategory {
  const codigo = code;
  let categoria: StatusCategory;

  if (codigo >= 100 && codigo <= 199) {
    categoria = "1xx Informativo";
  } else if (codigo >= 200 && codigo <= 299) {
    categoria = "2xx Éxito";
  } else if (codigo >= 300 && codigo <= 399) {
    categoria = "3xx Redirección";
  } else if (codigo >= 400 && codigo <= 499) {
    categoria = "4xx Error del cliente";
  } else if (codigo >= 500 && codigo <= 599) {
    categoria = "5xx Error del servidor";
  } else {
    categoria = "Desconocido";
  }

  return categoria;
}

/**
 * TODO: Parsea un texto con líneas de cabeceras HTTP al formato
 * `Record<string, string>`. El separador entre nombre y valor es ":".
 *
 * Reglas:
 *   - Cada línea no vacía debe tener formato "Nombre: valor".
 *   - Ignora líneas vacías o que no contengan ":".
 *   - No tienes que normalizar mayúsculas/minúsculas del nombre.
 *
 * Ejemplo:
 *   parseHeaders("Content-Type: application/json\nAuthorization: Bearer abc")
 *   → { "Content-Type": "application/json", "Authorization": "Bearer abc" }
 *
 * Pista: `text.split("\n")` te da las líneas; `String.split(":")` te separa
 * nombre y valor. Recuerda `.trim()` para quitar espacios sobrantes.
 */
export function parseHeaders(text: string): Headers {
  // TODO: tu implementación aquí
  throw new Error("Not implemented");
}

/**
 * TODO: Combina las funciones anteriores en un resumen legible.
 *
 * El formato exacto lo decides tú (los tests solo verifican que el string
 * no esté vacío y que contenga la URL y el código). Un ejemplo:
 *
 *   Resumen de la petición
 *   ──────────────────────
 *   URL:     https://api.ejemplo.com/users
 *   Status:  200 (2xx Éxito)
 *   Headers:
 *     • Content-Type: application/json
 *     • Authorization: Bearer abc
 */
export function summarizeRequest(
  url: string,
  status: number,
  headersText: string,
): string {
  // TODO: tu implementación aquí
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// CLI (opcional, pero recomendado para probar manualmente)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const [, , cmd, ...args] = process.argv;
  try {
    if (cmd === "parse-url" && args[0]) {
      const parts = parseUrl(args[0]);
      console.log(JSON.stringify(parts, null, 2));
    } else if (cmd === "status" && args[0]) {
      const cat = classifyStatus(Number(args[0]));
      console.log(cat);
    } else if (cmd === "headers" && args.length > 0) {
      const h = parseHeaders(args.join(" "));
      console.log(JSON.stringify(h, null, 2));
    } else if (cmd === "summary" && args.length >= 2) {
      const [url, status, ...rest] = args;
      console.log(summarizeRequest(url, Number(status), rest.join(" ")));
    } else {
      console.log("Uso:");
      console.log('  npm start parse-url "https://ejemplo.com/path?a=1"');
      console.log("  npm start status 404");
      console.log('  npm start headers "Content-Type: application/json"');
      console.log('  npm start summary "https://x.com" 200 "Content-Type: application/json"');
    }
  } catch (e) {
    console.error("Error:", (e as Error).message);
    process.exit(1);
  }
}
