import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = "md",
  showValue = false,
  count,
  className,
}: StarRatingProps) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span
              key={i}
              className={cn(sizes[size], "relative")}
              style={{ color: filled || partial ? "#f97316" : "#3a3a3a" }}
            >
              {partial ? (
                <span className="relative inline-block">
                  <span style={{ color: "#3a3a3a" }}>★</span>
                  <span
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(rating - Math.floor(rating)) * 100}%` }}
                  >
                    <span style={{ color: "#f97316" }}>★</span>
                  </span>
                </span>
              ) : (
                "★"
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn(sizes[size], "text-muted-foreground")}>
          {rating.toFixed(1)}
          {count !== undefined && (
            <span className="ml-1">({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
