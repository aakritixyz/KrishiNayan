"use client";

export type FarmMapPlot = {
  id: number;
  name: string;
  crop_label: string;
  health_score?: number | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  plots: FarmMapPlot[];
  selectedId?: number | null;
};

function healthColor(score?: number | null) {
  if (score === null || score === undefined) return "#66756d";
  if (score >= 75) return "#6f9c13";
  if (score >= 45) return "#f5a800";
  return "#d83a32";
}

function scale(value: number, min: number, max: number) {
  if (max === min) return 50;
  return 12 + ((value - min) / (max - min)) * 76;
}

export default function FarmPlotMap({ plots, selectedId }: Props) {
  const mappedPlots = plots.filter(
    (plot) => plot.latitude !== null && plot.longitude !== null
  );
  const latitudes = mappedPlots.map((plot) => plot.latitude as number);
  const longitudes = mappedPlots.map((plot) => plot.longitude as number);
  const minLat = Math.min(...latitudes, 20.5937);
  const maxLat = Math.max(...latitudes, 20.5937);
  const minLon = Math.min(...longitudes, 78.9629);
  const maxLon = Math.max(...longitudes, 78.9629);

  return (
    <div className="relative h-[280px] overflow-hidden rounded-[22px] border border-forest/10 bg-[linear-gradient(135deg,#e8f0d9_0%,#f7f6ef_45%,#dfe9ce_100%)]">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(6,59,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(6,59,42,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />
      <div className="absolute inset-x-5 top-5 flex items-center justify-between rounded-full bg-white/85 px-4 py-2 text-xs font-bold text-forest shadow-sm">
        <span>Private field map</span>
        <span>{mappedPlots.length} GPS plots</span>
      </div>

      {mappedPlots.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm font-semibold text-muted">
          Save latitude and longitude for a plot to place it on this private map.
        </div>
      ) : (
        mappedPlots.map((plot) => {
          const x = scale(plot.longitude as number, minLon, maxLon);
          const y = 100 - scale(plot.latitude as number, minLat, maxLat);
          const selected = plot.id === selectedId;
          const color = healthColor(plot.health_score);

          return (
            <div
              key={plot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`rounded-full border-[3px] border-white shadow-lg ${selected ? "h-7 w-7" : "h-5 w-5"}`}
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 0 ${selected ? 8 : 5}px ${color}33`,
                }}
                title={`${plot.name} - ${plot.crop_label}`}
              />
              <div className="mt-2 max-w-28 rounded-xl bg-white/90 px-2 py-1 text-center text-[11px] font-bold leading-tight text-forest shadow-sm">
                {plot.name}
              </div>
            </div>
          );
        })
      )}

      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between rounded-2xl bg-forest/90 px-4 py-3 text-xs font-semibold text-white">
        <span>Green healthy</span>
        <span>Yellow watch</span>
        <span>Red urgent</span>
      </div>
    </div>
  );
}
