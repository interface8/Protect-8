import Image from "next/image";

export function getAvailability(status?: string) {
  switch (status) {
    case "AVAILABLE":
      return {
        label: "Available now",
        dot: "bg-[#2f9e6a]",
        pill: "border-[#2f9e6a]/30 bg-[#2f9e6a]/10 text-[#2f9e6a]",
      };
    case "BUSY":
      return {
        label: "Busy",
        dot: "bg-amber-500",
        pill: "border-amber-500/30 bg-amber-500/10 text-amber-500",
      };
    default:
      return {
        label: "Offline",
        dot: "bg-gray-400",
        pill: "border-white/15 bg-white/5 text-white/50",
      };
  }
}

const SIZES = {
  md: { box: "h-12 w-12", dot: "h-3 w-3", initial: "text-base", px: 48 },
  lg: { box: "h-16 w-16", dot: "h-3.5 w-3.5", initial: "text-2xl", px: 64 },
} as const;

interface LawyerAvatarProps {
  name: string;
  src?: string | null;
  status?: string;
  size?: keyof typeof SIZES;
  /** Border color of the status dot, match the background behind the avatar */
  dotBorderClass?: string;
}

export default function LawyerAvatar({
  name,
  src,
  status,
  size = "md",
  dotBorderClass = "border-white",
}: LawyerAvatarProps) {
  const s = SIZES[size];

  return (
    <div className={`relative shrink-0 ${s.box}`}>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-[#c4922a]/20">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes={`${s.px}px`}
            unoptimized={!src.startsWith("/")}
            className="object-cover"
          />
        ) : (
          <span className={`${s.initial} font-semibold text-[#c4922a]`}>
            {name.charAt(0)}
          </span>
        )}
      </div>
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 ${s.dot} ${dotBorderClass} ${getAvailability(status).dot}`}
        />
      )}
    </div>
  );
}