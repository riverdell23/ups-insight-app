import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, GitCompare, Library, ClipboardList, ShieldCheck, ArrowRight, Search } from "lucide-react";
import { DISCLAIMER } from "@/lib/ups";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DC UPS Benchmark — Vendor-Neutral UPS Comparison" },
      { name: "description", content: "Compare data centre UPS products from leading vendors before contacting sales." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold text-base">DC UPS Benchmark</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Consultant Intelligence</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#disclaimer" className="hover:text-foreground">Disclaimer</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/login"><Button size="sm">Get access</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--accent)/10%,_transparent_60%)]" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" /> Vendor-neutral • Consultant-grade
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Benchmark every data centre UPS <span className="text-accent">before</span> you call a vendor.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              A specification intelligence platform for electrical consultants. Compare topology, efficiency, modular architecture, footprint and verification status across the major UPS manufacturers — in one place, with sources.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login"><Button size="lg" className="gap-2">Open the platform <ArrowRight className="h-4 w-4" /></Button></Link>
              <a href="#features"><Button size="lg" variant="outline">See what's inside</Button></a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div>8+ vendors tracked</div>
              <div>Verified spec sources</div>
              <div>Side-by-side comparison (up to 4)</div>
              <div>Auto-generated enquiry checklist</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold">Built for the way consultants actually shortlist UPS</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Library, title: "UPS Library", desc: "Filterable catalogue of UPS series with capacity, efficiency, battery type and topology." },
              { icon: GitCompare, title: "Side-by-side compare", desc: "Pin 2–4 products and inspect deltas across every spec that matters." },
              { icon: ClipboardList, title: "Enquiry Checklist", desc: "Generate a vendor RFQ checklist from project load, redundancy and autonomy inputs." },
              { icon: ShieldCheck, title: "Verification Status", desc: "Every spec carries a status — Verified, Pending, Vendor Submitted, Outdated Risk." },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="h-6 w-6 text-accent" />
                <div className="mt-4 font-display font-semibold">{f.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold">From blank spec sheet to vendor RFQ — in minutes.</h2>
            <ol className="mt-8 space-y-5">
              {[
                ["Search & filter the library", "Narrow by vendor, capacity band, efficiency, battery chemistry and modular vs monolithic."],
                ["Compare shortlisted products", "Side-by-side spec deltas with source links and last-verified dates."],
                ["Generate the enquiry checklist", "Project load, N+1 redundancy, autonomy, voltage and monitoring — auto-formatted for RFQ."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-semibold">{i + 1}</div>
                  <div>
                    <div className="font-semibold">{t}</div>
                    <div className="text-sm text-muted-foreground mt-1">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <Card className="p-6 bg-primary text-primary-foreground border-primary">
            <div className="text-xs uppercase tracking-widest text-primary-foreground/70">Sample query</div>
            <div className="mt-4 flex items-center gap-2 rounded-md bg-primary-foreground/10 px-3 py-2 text-sm font-mono">
              <Search className="h-4 w-4" /> capacity ≥ 800 kW · modular · Li-ion
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span>Vertiv Trinergy Cube</span><span className="font-mono">97.0%</span></div>
              <div className="flex justify-between"><span>ABB DPA 250 S4</span><span className="font-mono">96.4%</span></div>
              <div className="flex justify-between"><span>Huawei UPS5000-H</span><span className="font-mono">97.0%</span></div>
            </div>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section id="disclaimer" className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-warning/20 text-warning-foreground">!</div>
          <h3 className="mt-4 font-display text-xl font-semibold">Engineering disclaimer</h3>
          <p className="mt-3 text-sm text-muted-foreground">{DISCLAIMER}</p>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} DC UPS Benchmark</div>
          <div>Vendor-neutral product intelligence</div>
        </div>
      </footer>
    </div>
  );
}
