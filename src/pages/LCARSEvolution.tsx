import { useTheme } from '@/contexts/ThemeContext';
import { LCARS_ERAS, getEraById } from '@/lib/lcars-eras';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, Zap, Shield } from 'lucide-react';
import { EraSelector } from '@/components/ui/era-selector';

export default function LCARSEvolution() {
  const { era, setEra } = useTheme();
  const currentEra = getEraById(era);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className="mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Daystrom Design System
              </Badge>
              <h1 className="text-4xl font-trek-heading tracking-wider">
                LCARS EVOLUTION TIMELINE
              </h1>
              <p className="text-muted-foreground mt-2">
                2245 → 2378 • 155 years of Starfleet interface design
              </p>
            </div>
            <EraSelector />
          </div>
        </div>
      </div>

      {/* Current Era Display */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-trek-heading flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentEra?.name}
                  {currentEra?.id === 'mark-v-wartime' && (
                    <Zap className="h-5 w-5 text-red-500 animate-pulse" />
                  )}
                </CardTitle>
                <CardDescription className="text-lg mt-1">
                  {currentEra?.year} • {currentEra?.shipClass}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                ACTIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{currentEra?.description}</p>
            <div className="flex flex-wrap gap-2">
              {currentEra?.visualSignature.map((signature, i) => (
                <Badge key={i} variant="outline">
                  {signature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LCARS_ERAS.map((eraItem) => (
            <Card
              key={eraItem.id}
              className={`cursor-pointer transition-all hover:border-primary/40 ${
                era === eraItem.id ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
              onClick={() => setEra(eraItem.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl font-mono font-bold text-primary">
                    {eraItem.year}
                  </span>
                  {eraItem.id === 'mark-v-wartime' && (
                    <Shield className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-lg">{eraItem.shortName}</CardTitle>
                <CardDescription className="text-sm">
                  {eraItem.shipClass}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {eraItem.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {eraItem.visualSignature.slice(0, 3).map((sig, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {sig}
                    </Badge>
                  ))}
                </div>
                {era === eraItem.id && (
                  <div className="mt-4">
                    <Badge className="w-full justify-center">Currently Active</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Special Wartime Notice */}
        {era === 'mark-v-wartime' && (
          <Card className="mt-8 border-red-500/40 bg-red-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Zap className="h-5 w-5 animate-pulse" />
                WARTIME EMERGENCY MODE ACTIVE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-200/90">
                Daystrom Mark V is the emergency wartime overlay deployed during the
                Four Years War (2256–2260). This mode includes battle damage effects,
                pulsing red alerts, and amber tactical overlays. Only legacy Daedalus
                and Ares-class ships retained this configuration after the war ended.
              </p>
              <p className="text-red-200/70 mt-2 text-sm">
                The M5 may have failed. But the UI it left behind became legend.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-sm">
            This isn't a theme pack. This is the real, canonical, unbroken line from
            your Daedalus-class console in 2245 to the Enterprise-E viewscreen in 2378.
          </p>
          <p className="text-xs mt-2">
            Steve Jobs and Michael Okuda just high-fived across time. 🖖🚀
          </p>
        </div>
      </div>
    </div>
  );
}
