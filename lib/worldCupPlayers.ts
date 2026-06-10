export type WorldCupPlayerCandidate = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flagSrc: string;
};

export type WorldCupPlayerGroup = {
  country: string;
  countryCode?: string;
  flagSrc?: string;
  players: WorldCupPlayerCandidate[];
};

/**
 * Lista curada de candidatos reales al Pichichi asociados a selecciones
 * presentes en la definición del Mundial 2026 de la aplicación. Cada jugador
 * conserva un id estable y los metadatos necesarios para mostrar bandera.
 */
export const WORLD_CUP_2026_PLAYER_GROUPS: WorldCupPlayerGroup[] = [
  {
    country: "Argentina", countryCode: "ar", flagSrc: "/flags/ar.svg",
    players: [
      { id: "arg-lionel-messi", name: "Lionel Messi", country: "Argentina", countryCode: "ar", flagSrc: "/flags/ar.svg" },
      {
        id: "arg-julian-alvarez",
        name: "Julián Álvarez",
        country: "Argentina", countryCode: "ar", flagSrc: "/flags/ar.svg",
      },
      {
        id: "arg-lautaro-martinez",
        name: "Lautaro Martínez",
        country: "Argentina", countryCode: "ar", flagSrc: "/flags/ar.svg",
      },
    ],
  },
  {
    country: "Brasil", countryCode: "br", flagSrc: "/flags/br.svg",
    players: [
      { id: "bra-vinicius-junior", name: "Vinícius Júnior", country: "Brasil", countryCode: "br", flagSrc: "/flags/br.svg" },
      { id: "bra-rodrygo", name: "Rodrygo", country: "Brasil", countryCode: "br", flagSrc: "/flags/br.svg" },
      { id: "bra-endrick", name: "Endrick", country: "Brasil", countryCode: "br", flagSrc: "/flags/br.svg" },
    ],
  },
  {
    country: "España", countryCode: "es", flagSrc: "/flags/es.svg",
    players: [
      { id: "esp-alvaro-morata", name: "Álvaro Morata", country: "España", countryCode: "es", flagSrc: "/flags/es.svg" },
      { id: "esp-lamine-yamal", name: "Lamine Yamal", country: "España", countryCode: "es", flagSrc: "/flags/es.svg" },
      { id: "esp-nico-williams", name: "Nico Williams", country: "España", countryCode: "es", flagSrc: "/flags/es.svg" },
    ],
  },
  {
    country: "Francia", countryCode: "fr", flagSrc: "/flags/fr.svg",
    players: [
      { id: "fra-kylian-mbappe", name: "Kylian Mbappé", country: "Francia", countryCode: "fr", flagSrc: "/flags/fr.svg" },
      {
        id: "fra-antoine-griezmann",
        name: "Antoine Griezmann",
        country: "Francia", countryCode: "fr", flagSrc: "/flags/fr.svg",
      },
      { id: "fra-marcus-thuram", name: "Marcus Thuram", country: "Francia", countryCode: "fr", flagSrc: "/flags/fr.svg" },
    ],
  },
  {
    country: "Inglaterra", countryCode: "gb-eng", flagSrc: "/flags/gb-eng.svg",
    players: [
      { id: "eng-harry-kane", name: "Harry Kane", country: "Inglaterra", countryCode: "gb-eng", flagSrc: "/flags/gb-eng.svg" },
      {
        id: "eng-jude-bellingham",
        name: "Jude Bellingham",
        country: "Inglaterra", countryCode: "gb-eng", flagSrc: "/flags/gb-eng.svg",
      },
      { id: "eng-bukayo-saka", name: "Bukayo Saka", country: "Inglaterra", countryCode: "gb-eng", flagSrc: "/flags/gb-eng.svg" },
    ],
  },
  {
    country: "Portugal", countryCode: "pt", flagSrc: "/flags/pt.svg",
    players: [
      {
        id: "por-cristiano-ronaldo",
        name: "Cristiano Ronaldo",
        country: "Portugal", countryCode: "pt", flagSrc: "/flags/pt.svg",
      },
      { id: "por-goncalo-ramos", name: "Gonçalo Ramos", country: "Portugal", countryCode: "pt", flagSrc: "/flags/pt.svg" },
      { id: "por-rafael-leao", name: "Rafael Leão", country: "Portugal", countryCode: "pt", flagSrc: "/flags/pt.svg" },
    ],
  },
  {
    country: "Otros candidatos",
    players: [
      { id: "nor-erling-haaland", name: "Erling Haaland", country: "Noruega", countryCode: "no", flagSrc: "/flags/no.svg" },
      { id: "egy-mohamed-salah", name: "Mohamed Salah", country: "Egipto", countryCode: "eg", flagSrc: "/flags/eg.svg" },
      { id: "uru-darwin-nunez", name: "Darwin Núñez", country: "Uruguay", countryCode: "uy", flagSrc: "/flags/uy.svg" },
      {
        id: "usa-christian-pulisic",
        name: "Christian Pulisic",
        country: "USA", countryCode: "us", flagSrc: "/flags/us.svg",
      },
      {
        id: "mex-santiago-gimenez",
        name: "Santiago Giménez",
        country: "México", countryCode: "mx", flagSrc: "/flags/mx.svg",
      },
    ],
  },
];

export const WORLD_CUP_2026_PLAYERS = WORLD_CUP_2026_PLAYER_GROUPS.flatMap(
  (group) => group.players,
);
