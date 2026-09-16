import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/photos";
import { cn } from "@/lib/utils";

export function Photo({
  path,
  alt,
  className,
  eager,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    resolvePhotoUrl(path).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [path]);

  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-500",
            loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm",
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-surface-strong">
          <UserRound className="h-1/4 w-1/4 text-muted-foreground/50" />
        </div>
      )}
    </div>
  );
}
