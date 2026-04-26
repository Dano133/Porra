"use client";

import { WORLD_CUP_GROUPS } from "@/lib/world-cup/groups";
import { GroupKey, GroupStandingsMap } from "@/lib/world-cup/types";

interface Props {
  standings: GroupStandingsMap;
  onChange: (value: GroupStandingsMap) => void;
}

const POSITION_CONFIG = [
  { key: "first", label: "1º" },
  { key: "second", label: "2º" },
  { key: "third", label: "3º" },
  { key: "fourth", label: "4º" },
] as const;

export default function GroupStageForm({ standings, onChange }: Props) {
  const handleSelectChange = (
    group: GroupKey,
    field: "first" | "second" | "third" | "fourth",
    value: string
  ) => {
    onChange({
      ...standings,
      [group]: {
        ...standings[group],
        [field]: value,
      },
    });
  };

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold">Fase de grupos</h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(WORLD_CUP_GROUPS) as GroupKey[]).map((groupKey) => {
          const teams = WORLD_CUP_GROUPS[groupKey];

          return (
            <div key={groupKey} className="rounded-xl border p-4">
              <h3 className="mb-4 text-lg font-semibold">Grupo {groupKey}</h3>

              <div className="space-y-3">
                {POSITION_CONFIG.map((position) => (
                  <div key={position.key}>
                    <label className="mb-1 block text-sm font-medium">{position.label}</label>
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={standings[groupKey][position.key]}
                      onChange={(e) =>
                        handleSelectChange(groupKey, position.key, e.target.value)
                      }
                    >
                      <option value="">Selecciona un equipo</option>
                      {teams.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}