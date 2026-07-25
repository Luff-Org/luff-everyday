import { Skeleton, SkeletonScreen } from "@/shared/ui/Skeleton";
import { APP_FONTS, THEMES } from "@/shared/lib/constants";

/** Mirrors the real settings page: same wrapper widths, same section spacing,
 *  and one chip per actual font/theme so the grid doesn't reflow on swap-in. */
export default function SettingsLoading() {
  return (
    <SkeletonScreen
      label="Loading settings"
      className="w-full flex flex-col items-center"
    >
      <div className="w-full pb-10">
        <div className="mt-8 mb-8 w-full">
          <Skeleton className="h-5 w-16 rounded" />
        </div>

        <div className="mt-8 w-full">
          <div className="flex flex-col mb-4 w-full items-start gap-1">
            <Skeleton className="h-7 w-44 rounded-lg" accent />
            <Skeleton className="h-10 w-full max-w-2xl rounded" delay={80} />
          </div>

          <div className="bg-foreground/[0.01] p-6 rounded-xl mb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
              {APP_FONTS.map((font, i) => (
                <Skeleton
                  key={font.id}
                  className="h-[52px] rounded-lg"
                  delay={i * 35}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col mb-4 w-full items-start gap-1">
            <Skeleton className="h-7 w-32 rounded-lg" accent />
            <Skeleton className="h-10 w-full max-w-2xl rounded" delay={80} />
          </div>

          <div className="bg-foreground/[0.01] p-6 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
              {THEMES.map((theme, i) => (
                <Skeleton
                  key={theme.id}
                  className="h-[46px] rounded-lg"
                  delay={i * 30}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
