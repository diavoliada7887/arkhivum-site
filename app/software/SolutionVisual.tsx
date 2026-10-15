import Image from "next/image";
import { sitePath } from "../site-path";
import { solutionVisuals, type VisualKey } from "./visuals";

export function SolutionVisual({
  kind,
  compact = false,
  priority = false,
}: {
  kind: VisualKey;
  compact?: boolean;
  priority?: boolean;
}) {
  const asset = solutionVisuals[kind];
  return (
    <figure
      className={`solution-visual${compact ? " solution-visual-compact" : ""}`}
      data-visual={kind}
      data-visual-kind={asset.kind}
    >
      <picture>
        {!compact && asset.mobileSrc && (
          <source
            media="(max-width: 640px)"
            srcSet={sitePath(asset.mobileSrc)}
            width={360}
            height={520}
          />
        )}
        <Image
          src={sitePath(asset.src)}
          alt={asset.alt}
          width={720}
          height={420}
          loading={priority ? "eager" : "lazy"}
          unoptimized
        />
      </picture>
      <figcaption>{asset.caption}</figcaption>
    </figure>
  );
}
