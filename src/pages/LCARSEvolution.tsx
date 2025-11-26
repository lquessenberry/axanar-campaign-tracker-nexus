import { useTheme } from "@/contexts/ThemeContext";
import { UNIFIED_THEMES, getThemesByCategory } from "@/lib/unified-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LCARSEvolution() {
  const { theme, setTheme } = useTheme();
  
  const currentTheme = UNIFIED_THEMES.find(t => t.id === theme);
  
  const preFederation = getThemesByCategory('pre-federation');
  const fourYearsWar = getThemesByCategory('four-years-war');
  const tos = getThemesByCategory('tos');
  const tmp = getThemesByCategory('tmp');
  const tng = getThemesByCategory('tng-era');

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-trek-heading text-primary">
            DAYSTROM INTERFACE EVOLUTION
          </h1>
          <p className="text-xl text-muted-foreground font-trek-content">
            155 Years of Starfleet UI Design (2151 → 2378)
          </p>
        </div>

        {/* Current Theme Display */}
        {currentTheme && (
          <Card className="border-primary/30 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl font-trek-heading text-primary">
                    {currentTheme.name}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {currentTheme.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {currentTheme.year}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">SHIP CLASS</h3>
                <p className="text-lg font-trek-content">{currentTheme.shipClass}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">VISUAL SIGNATURE</h3>
                <div className="flex flex-wrap gap-2">
                  {currentTheme.visualSignature.map((sig, idx) => (
                    <Badge key={idx} variant="secondary">{sig}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pre-Federation Era */}
        <section>
          <h2 className="text-3xl font-trek-heading text-primary mb-6">PRE-FEDERATION ERA</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {preFederation.map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === t.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => setTheme(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-trek-heading">{t.shortName}</CardTitle>
                    <Badge variant="outline">{t.year}</Badge>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">{t.shipClass}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.visualSignature.map((sig, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Four Years War Era */}
        <section>
          <h2 className="text-3xl font-trek-heading text-primary mb-6">FOUR YEARS WAR</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fourYearsWar.map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === t.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => setTheme(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-trek-heading">{t.shortName}</CardTitle>
                    <Badge variant="outline">{t.year}</Badge>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">{t.shipClass}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.visualSignature.map((sig, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TOS Era */}
        <section>
          <h2 className="text-3xl font-trek-heading text-primary mb-6">TOS ERA</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tos.map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === t.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => setTheme(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-trek-heading">{t.shortName}</CardTitle>
                    <Badge variant="outline">{t.year}</Badge>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">{t.shipClass}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.visualSignature.map((sig, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TMP Era */}
        <section>
          <h2 className="text-3xl font-trek-heading text-primary mb-6">TMP ERA</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tmp.map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === t.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => setTheme(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-trek-heading">{t.shortName}</CardTitle>
                    <Badge variant="outline">{t.year}</Badge>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">{t.shipClass}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.visualSignature.map((sig, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* TNG/DS9/VOY Era */}
        <section>
          <h2 className="text-3xl font-trek-heading text-primary mb-6">TNG/DS9/VOY ERA</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tng.map((t) => (
              <Card 
                key={t.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  theme === t.id ? 'border-primary bg-primary/10' : ''
                }`}
                onClick={() => setTheme(t.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-trek-heading">{t.shortName}</CardTitle>
                    <Badge variant="outline">{t.year}</Badge>
                  </div>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <div className="font-semibold">{t.shipClass}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.visualSignature.map((sig, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">{sig}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <Card className="bg-card/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="font-trek-heading">Archaeological Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This timeline represents the authentic visual evolution of Starfleet computer interfaces 
              from the NX-class era through the Dominion War period, based on canonical screen evidence.
            </p>
            <p>
              Each theme implements historically accurate color palettes, typography, interface elements, 
              and interaction patterns from their respective eras, creating a living museum of 
              155 years of interface design.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}