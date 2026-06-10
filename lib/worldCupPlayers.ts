export type WorldCupPlayerCandidate = {
  id: string;
  name: string;
  country: string;
};

export type WorldCupPlayerGroup = {
  country: string;
  players: WorldCupPlayerCandidate[];
};

/**
 * Lista base editable de candidatos al Pichichi del Mundial 2026.
 *
 * Las convocatorias oficiales del Mundial 2026 todavía no están cerradas, así
 * que esta lista es deliberadamente manual y pequeña. Cuando existan listas
 * oficiales, basta con ampliar o sustituir este archivo sin tocar el formulario.
 */
export const WORLD_CUP_2026_PLAYER_GROUPS: WorldCupPlayerGroup[] = [
  {
    country: "Argentina",
    players: [
      { id: "arg-lionel-messi", name: "Lionel Messi", country: "Argentina" },
      {
        id: "arg-julian-alvarez",
        name: "Julián Álvarez",
        country: "Argentina",
      },
      {
        id: "arg-lautaro-martinez",
        name: "Lautaro Martínez",
        country: "Argentina",
      },
    ],
  },
  {
    country: "Brasil",
    players: [
      { id: "bra-vinicius-junior", name: "Vinícius Júnior", country: "Brasil" },
      { id: "bra-rodrygo", name: "Rodrygo", country: "Brasil" },
      { id: "bra-endrick", name: "Endrick", country: "Brasil" },
    ],
  },
  {
    country: "España",
    players: [
      { id: "esp-alvaro-morata", name: "Álvaro Morata", country: "España" },
      { id: "esp-lamine-yamal", name: "Lamine Yamal", country: "España" },
      { id: "esp-nico-williams", name: "Nico Williams", country: "España" },
    ],
  },
  {
    country: "Francia",
    players: [
      { id: "fra-kylian-mbappe", name: "Kylian Mbappé", country: "Francia" },
      {
        id: "fra-antoine-griezmann",
        name: "Antoine Griezmann",
        country: "Francia",
      },
      { id: "fra-marcus-thuram", name: "Marcus Thuram", country: "Francia" },
    ],
  },
  {
    country: "Inglaterra",
    players: [
      { id: "eng-harry-kane", name: "Harry Kane", country: "Inglaterra" },
      {
        id: "eng-jude-bellingham",
        name: "Jude Bellingham",
        country: "Inglaterra",
      },
      { id: "eng-bukayo-saka", name: "Bukayo Saka", country: "Inglaterra" },
    ],
  },
  {
    country: "Portugal",
    players: [
      {
        id: "por-cristiano-ronaldo",
        name: "Cristiano Ronaldo",
        country: "Portugal",
      },
      { id: "por-goncalo-ramos", name: "Gonçalo Ramos", country: "Portugal" },
      { id: "por-rafael-leao", name: "Rafael Leão", country: "Portugal" },
    ],
  },
  {
    country: "Otros candidatos",
    players: [
      { id: "nor-erling-haaland", name: "Erling Haaland", country: "Noruega" },
      { id: "egy-mohamed-salah", name: "Mohamed Salah", country: "Egipto" },
      { id: "uru-darwin-nunez", name: "Darwin Núñez", country: "Uruguay" },
      {
        id: "usa-christian-pulisic",
        name: "Christian Pulisic",
        country: "Estados Unidos",
      },
      {
        id: "mex-santiago-gimenez",
        name: "Santiago Giménez",
        country: "México",
      },
    ],
  },
];

export const WORLD_CUP_2026_PLAYERS = WORLD_CUP_2026_PLAYER_GROUPS.flatMap(
  (group) => group.players,
);
