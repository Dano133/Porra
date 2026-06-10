import fs from 'node:fs';

const source = fs.readFileSync('lib/world-cup/source-of-truth.ts', 'utf8');
const playersSource = fs.readFileSync('lib/worldCupPlayers.ts', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function extractBlock(name) {
  const start = source.indexOf(name);
  assert(start >= 0, `No se encontró ${name}`);
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(braceStart, i + 1);
  }
  throw new Error(`No se pudo extraer ${name}`);
}


function extractPropertyArray(name) {
  const start = source.indexOf(`${name}:`);
  assert(start >= 0, `No se encontró ${name}`);
  const bracketStart = source.indexOf('[', start);
  let depth = 0;
  for (let i = bracketStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return source.slice(bracketStart, i + 1);
  }
  throw new Error(`No se pudo extraer ${name}`);
}

function extractArray(name) {
  const start = source.indexOf(name);
  assert(start >= 0, `No se encontró ${name}`);
  const equals = source.indexOf('=', start);
  const bracketStart = source.indexOf('[', equals);
  let depth = 0;
  for (let i = bracketStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') depth += 1;
    if (char === ']') depth -= 1;
    if (depth === 0) return source.slice(bracketStart, i + 1);
  }
  throw new Error(`No se pudo extraer ${name}`);
}

const groupsBlock = extractBlock('WORLD_CUP_GROUPS');
const groups = {};
for (const match of groupsBlock.matchAll(/([A-L]): \[([^\]]+)\]/g)) {
  groups[match[1]] = [...match[2].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

assert(Object.keys(groups).length === 12, 'Deben existir 12 grupos');
for (const [group, teams] of Object.entries(groups)) {
  assert(teams.length === 4, `Grupo ${group} debe tener 4 equipos`);
  assert(new Set(teams).size === teams.length, `Grupo ${group} contiene equipos duplicados`);
}

const pairings = [...extractArray('GROUP_STAGE_ROUND_ROBIN_PAIRINGS').matchAll(/\[(\d),\s*(\d)\]/g)]
  .map((m) => [Number(m[1]), Number(m[2])]);
assert(pairings.length === 6, 'Cada grupo debe generar 6 partidos');
for (const [group, teams] of Object.entries(groups)) {
  const pairs = new Set(pairings.map(([a, b]) => [teams[a], teams[b]].sort().join('::')));
  assert(pairs.size === 6, `Grupo ${group} contiene partidos repetidos`);
}

const slotsBlock = extractPropertyArray('roundOf32Slots');
const slots = [...slotsBlock.matchAll(/\{ id: '([^']+)', home: '([^']+)', away: '([^']+)' \}/g)]
  .map((m) => ({ id: m[1], home: m[2], away: m[3] }));
assert(slots.length === 16, 'R32 debe tener 16 cruces');

const groupLetters = Object.keys(groups);
const standings = Object.fromEntries(groupLetters.map((group) => [group, groups[group]]));
const teamsInR32 = [];
const bestThirds = groupLetters.slice(0, 8).map((group) => ({ group, team: standings[group][2] }));
const usedThirds = new Set();
for (const slot of slots) {
  for (const ref of [slot.home, slot.away]) {
    if (/^[12][A-L]$/.test(ref)) {
      teamsInR32.push(standings[ref[1]][Number(ref[0]) - 1]);
    } else if (/^3[A-L]+$/.test(ref)) {
      const eligible = new Set(ref.slice(1).split(''));
      const candidate = bestThirds.find((third) => eligible.has(third.group) && !usedThirds.has(third.team));
      assert(candidate, `No hay tercero único disponible para ${ref}`);
      usedThirds.add(candidate.team);
      teamsInR32.push(candidate.team);
    } else {
      throw new Error(`Referencia R32 inválida: ${ref}`);
    }
  }
}
assert(teamsInR32.length === 32, `R32 debe tener 32 equipos y tiene ${teamsInR32.length}`);
assert(new Set(teamsInR32).size === 32, 'R32 contiene equipos duplicados');

const thirdRefs = slots.flatMap((slot) => [slot.home, slot.away].filter((ref) => /^3[A-L]+$/.test(ref)));
for (const thirdGroups of combinations(groupLetters, 8)) {
  assert(
    canAssignThirdRefs(thirdGroups, thirdRefs),
    `No se puede asignar R32 sin repetir terceros para la combinación ${thirdGroups.join('')}`,
  );
}


function combinations(values, size, start = 0, prefix = [], out = []) {
  if (prefix.length === size) {
    out.push([...prefix]);
    return out;
  }
  for (let index = start; index <= values.length - (size - prefix.length); index += 1) {
    prefix.push(values[index]);
    combinations(values, size, index + 1, prefix, out);
    prefix.pop();
  }
  return out;
}

function canAssignThirdRefs(thirdGroups, thirdRefs, index = 0, used = new Set()) {
  if (index >= thirdRefs.length) return true;
  const eligible = new Set(thirdRefs[index].slice(1).split(''));
  for (const group of thirdGroups) {
    if (!eligible.has(group) || used.has(group)) continue;
    used.add(group);
    if (canAssignThirdRefs(thirdGroups, thirdRefs, index + 1, used)) return true;
    used.delete(group);
  }
  return false;
}

const validTeams = new Set(Object.values(groups).flat());
const players = [...playersSource.matchAll(/\{ id: "([^"]+)", name: "([^"]+)", country: "([^"]+)", countryCode: "([^"]+)"/g)]
  .map((m) => ({ id: m[1], name: m[2], country: m[3], countryCode: m[4] }));
assert(players.length > 0, 'Debe existir catálogo de Pichichi');
assert(new Set(players.map((p) => p.id)).size === players.length, 'Hay jugadores Pichichi duplicados por id');
assert(new Set(players.map((p) => `${p.name}::${p.country}`)).size === players.length, 'Hay jugadores Pichichi duplicados por nombre/selección');
for (const player of players) {
  assert(validTeams.has(player.country), `Pichichi con selección no válida: ${player.name} (${player.country})`);
  assert(player.countryCode, `Pichichi sin código de país: ${player.name}`);
}

console.log('World Cup data checks passed');
