import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

type LetterCount = { letter: string; donor_count: number };
type DonorRow = {
  display_name: string;
  username: string | null;
  has_account: boolean;
  sort_key: string;
};

const useLetterCounts = () =>
  useQuery({
    queryKey: ["public-donor-letter-counts"],
    queryFn: async (): Promise<LetterCount[]> => {
      const { data, error } = await supabase.rpc("get_public_donor_letter_counts");
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        letter: r.letter,
        donor_count: Number(r.donor_count),
      }));
    },
    staleTime: 10 * 60 * 1000,
  });

const useDonorsByLetter = (letter: string | null) =>
  useQuery({
    queryKey: ["public-donors-by-letter", letter],
    enabled: !!letter,
    queryFn: async (): Promise<DonorRow[]> => {
      const { data, error } = await supabase.rpc("get_public_donors_by_letter", {
        p_letter: letter,
      });
      if (error) throw error;
      return (data ?? []) as DonorRow[];
    },
    staleTime: 10 * 60 * 1000,
  });

const Donors = () => {
  const { data: counts, isLoading: countsLoading } = useLetterCounts();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { data: donors, isLoading: donorsLoading } = useDonorsByLetter(activeLetter);

  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    (counts ?? []).forEach((c) => m.set(c.letter, c.donor_count));
    return m;
  }, [counts]);

  const totalDonors = useMemo(
    () => (counts ?? []).reduce((sum, c) => sum + c.donor_count, 0),
    [counts]
  );

  // Auto-select first letter that has donors when counts load
  useEffect(() => {
    if (!activeLetter && counts && counts.length > 0) {
      const firstWithData = ALPHABET.find((l) => (countMap.get(l) ?? 0) > 0) ?? counts[0].letter;
      setActiveLetter(firstWithData);
    }
  }, [counts, countMap, activeLetter]);

  const filteredDonors = useMemo(() => {
    if (!donors) return [];
    if (!search.trim()) return donors;
    const q = search.toLowerCase();
    return donors.filter((d) => d.display_name.toLowerCase().includes(q));
  }, [donors, search]);

  // SEO
  useEffect(() => {
    document.title = "Donors — Axanar Supporters Roll Call";
    const desc = "Browse the alphabetical list of Axanar donors who have supported the project.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/donors`);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Axanar Donors</CardTitle>
            <CardDescription>
              {countsLoading ? (
                <Skeleton className="h-4 w-64 mt-2" />
              ) : (
                <>
                  An alphabetical roll call of <strong>{totalDonors.toLocaleString()}</strong>{" "}
                  supporters who have backed the Axanar project. Grouped by surname.
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* A–Z navigator */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {ALPHABET.map((letter) => {
                const count = countMap.get(letter) ?? 0;
                const disabled = count === 0;
                const isActive = activeLetter === letter;
                return (
                  <Button
                    key={letter}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => setActiveLetter(letter)}
                    className="min-w-10 h-10 font-mono font-bold"
                    title={disabled ? "No donors" : `${count.toLocaleString()} donors`}
                  >
                    {letter}
                  </Button>
                );
              })}
              {(countMap.get("#") ?? 0) > 0 && (
                <Button
                  variant={activeLetter === "#" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveLetter("#")}
                  className="min-w-10 h-10 font-mono font-bold"
                  title={`${countMap.get("#")} donors`}
                >
                  #
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Letter section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-mono">
                {activeLetter ?? "—"}
              </CardTitle>
              <CardDescription>
                {donorsLoading ? (
                  "Loading…"
                ) : (
                  <>
                    {filteredDonors.length.toLocaleString()} donor
                    {filteredDonors.length === 1 ? "" : "s"}
                    {search && donors && filteredDonors.length !== donors.length && (
                      <> (filtered from {donors.length.toLocaleString()})</>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Filter within ${activeLetter ?? ""}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {donorsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : filteredDonors.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No donors match your filter.
              </p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                {filteredDonors.map((d, i) => (
                  <li
                    key={`${d.sort_key}-${i}`}
                    className="text-sm py-1 border-b border-border/40 truncate"
                  >
                    {d.has_account && d.username ? (
                      <Link
                        to={`/u/${d.username}`}
                        className="text-foreground hover:text-primary hover:underline transition-colors"
                      >
                        {d.display_name}
                      </Link>
                    ) : (
                      <span className="text-foreground">{d.display_name}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Donors;
