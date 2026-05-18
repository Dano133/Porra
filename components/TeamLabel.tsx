import { countryCodeToFlag, getTeamIdentity, type TeamIdentity } from '@/lib/world-cup/team-identity';

interface TeamLabelProps {
  team?: string | null;
  identity?: TeamIdentity | null;
  fallbackLabel?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

function FlagFallback({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  return <span className="text-[10px] font-bold tracking-wide text-wc-muted">{initials || '—'}</span>;
}

export default function TeamLabel({ team, identity, fallbackLabel, align = 'left', size = 'md' }: TeamLabelProps) {
  const resolved = identity ?? getTeamIdentity(team);
  const teamName = resolved?.name ?? fallbackLabel ?? 'Pendiente de clasificar';
  const flag = countryCodeToFlag(resolved?.countryCode);
  const wrapper = align === 'right' ? 'justify-end text-right' : 'justify-start text-left';
  const textSize = size === 'sm' ? 'text-xs md:text-sm' : 'text-sm md:text-base';

  return (
    <span className={`inline-flex max-w-full items-center gap-2 ${wrapper}`}>
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-wc-border bg-wc-background/95 text-sm">
        {flag ?? <FlagFallback name={teamName} />}
      </span>
      <span className={`truncate ${textSize}`}>{teamName}</span>
    </span>
  );
}
