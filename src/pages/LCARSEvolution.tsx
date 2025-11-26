import { useTheme } from '@/contexts/ThemeContext';
import { LCARS_ERAS, getEraById } from '@/lib/lcars-eras';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, Zap, Shield } from 'lucide-react';
import { EraSelector } from '@/components/ui/era-selector';
import { cn } from '@/lib/utils';

export default function LCARSEvolution() {
  const { era, setEra } = useTheme();
  const currentEra = getEraById(era);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-gradient-to-br from-background via-background to-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <Badge variant="outline" className="mb-3 backdrop-blur-sm bg-primary/10">
                <Sparkles className="h-3 w-3 mr-1" />
                Proto-LCARS Through Full LCARS Evolution
              </Badge>
              <h1 className="text-5xl md:text-6xl font-trek-heading tracking-wider mb-2">
                LCARS EVOLUTION TIMELINE
              </h1>
              <p className="text-muted-foreground text-lg">
                2151 → 2378 • 227 years of Starfleet interface archaeology
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2 max-w-2xl">
                From Enterprise NX-01's gray-blue metallic panels to Voyager's maximum-contrast displays.
                This is the real, unbroken canonical line — not a theme pack.
              </p>
            </div>
            <div className="w-full lg:w-auto">
              <EraSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Current Era Display */}
      <div className="container mx-auto px-4 py-8">
        {/* Active Era Card with Signature Elements */}
        <Card className="mb-8 border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          {/* Add era-specific visual elements */}
          {currentEra?.id === 'tmp-refit-2273' && (
            <div className="absolute top-0 left-0 w-48 h-24 opacity-20">
              {/* TMP Orange Wedge hint */}
              <div className="w-full h-full bg-gradient-to-br from-[#FF4500] to-[#FF8C00] rounded-br-[100px]" />
            </div>
          )}
          {currentEra?.id === 'excelsior-2285' && (
            <>
              {/* Excelsior L-Bar hints */}
              <div className="absolute top-0 left-0 w-3 h-24 bg-[#FF6600] opacity-30" />
              <div className="absolute top-0 left-0 w-24 h-3 bg-[#FF6600] opacity-30" />
              <div className="absolute top-0 right-0 w-3 h-16 bg-[#9933CC] opacity-20" />
            </>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl font-trek-heading tracking-wide">
                    {currentEra?.name}
                  </CardTitle>
                  {currentEra?.id === 'mark-v-wartime' && (
                    <Zap className="h-5 w-5 text-red-500 animate-pulse" />
                  )}
                  {currentEra?.id === 'tmp-refit-2273' && (
                    <Badge variant="destructive" className="animate-pulse">
                      BIRTH OF LCARS
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-lg mt-2 flex items-center gap-3">
                  <span className="font-mono text-2xl text-primary font-bold">
                    {currentEra?.year}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{currentEra?.shipClass}</span>
                </CardDescription>
              </div>
              <Badge variant="default" className="text-base px-6 py-2 animate-pulse">
                ACTIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed">
              {currentEra?.description}
            </p>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Visual Signature
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentEra?.visualSignature.map((signature, i) => (
                  <Badge key={i} variant="outline" className="text-xs backdrop-blur-sm">
                    {signature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Grid with Era Categories */}
        <div className="space-y-8">
          {/* Proto-LCARS Section */}
          <div>
            <div className="mb-4 pb-2 border-b border-primary/20">
              <h2 className="text-2xl font-trek-heading text-primary">
                PROTO-LCARS ERA (2151-2285)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                The evolutionary path from submarine control rooms to the birth of LCARS
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {LCARS_ERAS.filter(e => 
                ['nx-2151', 'constitution-2265', 'tmp-refit-2273', 'excelsior-2285'].includes(e.id)
              ).map((eraItem) => (
                <Card
                  key={eraItem.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg relative overflow-hidden group",
                    era === eraItem.id ? 'border-primary ring-2 ring-primary/30 shadow-xl' : ''
                  )}
                  onClick={() => setEra(eraItem.id)}
                >
                  {/* Era-specific visual accent */}
                  {eraItem.id === 'tmp-refit-2273' && (
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
                      <div className="w-full h-full bg-gradient-to-bl from-[#FF4500] to-transparent rounded-bl-[100px]" />
                    </div>
                  )}
                  {eraItem.id === 'excelsior-2285' && (
                    <div className="absolute top-0 left-0 w-2 h-20 bg-gradient-to-b from-[#FF6600] to-transparent opacity-30" />
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl font-mono font-bold text-primary group-hover:scale-110 transition-transform">
                        {eraItem.year}
                      </span>
                      {eraItem.id === 'tmp-refit-2273' && (
                        <Badge variant="destructive" className="text-[10px] animate-pulse">
                          BIRTH
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {eraItem.shortName}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {eraItem.shipClass}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {eraItem.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {eraItem.visualSignature.slice(0, 4).map((sig, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] px-2">
                          {sig}
                        </Badge>
                      ))}
                    </div>
                    {era === eraItem.id && (
                      <div className="mt-4">
                        <Badge className="w-full justify-center animate-pulse">
                          Currently Active
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Full LCARS Section */}
          <div>
            <div className="mb-4 pb-2 border-b border-primary/20">
              <h2 className="text-2xl font-trek-heading text-primary">
                FULL LCARS ERA (2350-2378)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                The mature LCARS system from TNG through Voyager
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {LCARS_ERAS.filter(e => 
                !['nx-2151', 'constitution-2265', 'tmp-refit-2273', 'excelsior-2285', 'mark-v-wartime'].includes(e.id)
              ).map((eraItem) => (
                <Card
                  key={eraItem.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/40 hover:shadow-lg group",
                    era === eraItem.id ? 'border-primary ring-2 ring-primary/30 shadow-xl' : ''
                  )}
                  onClick={() => setEra(eraItem.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-3xl font-mono font-bold text-primary group-hover:scale-110 transition-transform">
                        {eraItem.year}
                      </span>
                    </div>
                    <CardTitle className="text-base">{eraItem.shortName}</CardTitle>
                    <CardDescription className="text-xs">
                      {eraItem.shipClass}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      {eraItem.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {eraItem.visualSignature.slice(0, 3).map((sig, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px]">
                          {sig}
                        </Badge>
                      ))}
                    </div>
                    {era === eraItem.id && (
                      <div className="mt-3">
                        <Badge className="w-full justify-center text-[10px]">Active</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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

        {/* Footer with Historical Context */}
        <div className="mt-16 text-center space-y-6 pb-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-trek-heading mb-4 text-primary">
              The Archaeological Record
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This timeline represents the real, canonical, unbroken evolution of Starfleet's 
              computer interfaces across 227 years. From the submarine-like control rooms of 
              Enterprise NX-01 to the sleek minimalism of Voyager's astrometrics lab.
            </p>
            <p className="text-sm text-muted-foreground/70 italic">
              The Motion Picture (2273) marks the single biggest visual leap — the moment when 
              Robert Abel's team took those cold gray panels from the 2150s, painted everything 
              pure black, and threw glowing orange-red wedges everywhere. That's the birth moment 
              of what would eventually become LCARS.
            </p>
          </div>
          <div className="pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground/60">
              Every button shape, every color transition, every blur radius — it all has historical precedent.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Steve Jobs and Michael Okuda just high-fived across time. 🖖🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
