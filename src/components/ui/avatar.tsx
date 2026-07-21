import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground",
        className
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-semibold" style={{ fontSize: Math.max(11, size / 2.8) }}>
          {getInitials(name)}
        </span>
      )}
    </span>
  );
}
