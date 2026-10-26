import { assetPath } from "@/lib/asset-path";

type FloralCornersProps = {
  variant: "gate" | "opening" | "story";
  className?: string;
};

const corners = ["top-left", "top-right", "bottom-left", "bottom-right"] as const;

export function FloralCorners({ variant, className = "" }: FloralCornersProps) {
  return (
    <div aria-hidden="true" className={`floral-corners floral-corners--${variant} ${className}`.trim()}>
      {corners.map((corner) => (
        <span
          className={`floral-corners__flower floral-corners__flower--${corner}`}
          key={corner}
          style={{ backgroundImage: `url("${assetPath("/assets/hydrangea-carnation-corner.webp")}")` }}
        />
      ))}
    </div>
  );
}
