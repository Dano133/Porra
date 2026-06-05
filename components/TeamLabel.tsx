import {
  countryCodeToFlag,
  getTeamIdentity,
  type TeamIdentity,
} from "@/lib/world-cup/team-identity";

type TeamLabelProps = {
  team?: string | null;
  name?: string;
  countryCode?: string;
  identity?: TeamIdentity | null;
  fallbackLabel?: string;
  className?: string;
  align?: "left" | "right";
  size?: "sm" | "md" | "lg";
  showFallback?: boolean;
};

function FlagFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="text-[10px] font-bold tracking-wide text-wc-muted">
      {initials || "—"}
    </span>
  );
}

export default function TeamLabel({
  team,
  name,
  countryCode,
  identity,
  fallbackLabel,
  className = "",
  align = "left",
  size = "md",
  showFallback = true,
}: TeamLabelProps) {
  const resolved = identity ?? getTeamIdentity(team ?? name);
  const teamName =
    name ?? resolved?.name ?? fallbackLabel ?? "Pendiente de clasificar";
  const flag = countryCodeToFlag(countryCode ?? resolved?.countryCode);
  const wrapper =
    align === "right" ? "justify-end text-right" : "justify-start text-left";
  const textSize =
    size === "sm"
      ? "text-xs md:text-sm"
      : size === "lg"
        ? "text-base md:text-lg"
        : "text-sm md:text-base";
  const badgeSize =
    size === "sm"
      ? "h-5 w-5 text-xs"
      : size === "lg"
        ? "h-8 w-8 text-base"
        : "h-6 w-6 text-sm";

  return (
    <span
      className={`inline-flex min-w-0 max-w-full items-center gap-2 ${wrapper} ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full border border-wc-border bg-wc-background/95 ${badgeSize}`}
      >
        {flag ?? (showFallback ? <FlagFallback name={teamName} /> : null)}
      </span>
      <span className={`min-w-0 truncate ${textSize}`}>{teamName}</span>
    </span>
  );
}
