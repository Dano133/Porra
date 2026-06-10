export interface TeamIdentity {
  name: string;
  slug: string;
  countryCode?: string;
}

const TEAM_CODE_BY_SLUG: Record<string, string> = {
  mexico: "mx",
  sudafrica: "za",
  corea_republic: "kr",
  chequia: "cz",
  canada: "ca",
  bosnia_y_herzegovina: "ba",
  qatar: "qa",
  suiza: "ch",
  brasil: "br",
  marruecos: "ma",
  haiti: "ht",
  escocia: "gb-sct",
  usa: "us",
  paraguay: "py",
  australia: "au",
  turquia: "tr",
  alemania: "de",
  curazao: "cw",
  costa_de_marfil: "ci",
  ecuador: "ec",
  paises_bajos: "nl",
  japon: "jp",
  suecia: "se",
  tunez: "tn",
  belgica: "be",
  egipto: "eg",
  iran: "ir",
  nueva_zelanda: "nz",
  espana: "es",
  cabo_verde: "cv",
  arabia_saudi: "sa",
  uruguay: "uy",
  francia: "fr",
  senegal: "sn",
  irak: "iq",
  noruega: "no",
  argentina: "ar",
  argelia: "dz",
  austria: "at",
  jordania: "jo",
  portugal: "pt",
  congo_dr: "cd",
  uzbekistan: "uz",
  colombia: "co",
  inglaterra: "gb-eng",
  croacia: "hr",
  ghana: "gh",
  panama: "pa",
};

export function normalizeTeamSlug(name?: string | null) {
  if (!name) return "";
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getTeamIdentity(name?: string | null): TeamIdentity | null {
  if (!name) return null;
  const slug = normalizeTeamSlug(name);
  return { name, slug, countryCode: TEAM_CODE_BY_SLUG[slug] };
}

export function formatTeamWithFlag(
  name?: string | null,
  fallback = "Pendiente",
) {
  const identity = getTeamIdentity(name);
  return identity?.name ?? name ?? fallback;
}

export function getTeamsWithoutCountryCode(
  names: Array<string | null | undefined>,
) {
  return names
    .filter((n): n is string => Boolean(n))
    .filter((n) => !getTeamIdentity(n)?.countryCode);
}
