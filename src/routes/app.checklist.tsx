import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Download, ClipboardList } from "lucide-react";
import { DISCLAIMER } from "@/lib/ups";
import { toast } from "sonner";

export const Route = createFileRoute("/app/checklist")({ component: ChecklistPage });

function ChecklistPage() {
  const [form, setForm] = useState({
    project: "",
    load_kw: "",
    redundancy: "N+1",
    autonomy_min: "10",
    battery: "Li-ion",
    voltage: "400V 3-phase",
    monitoring: "SNMP, Modbus, BACnet",
    space: "",
  });
  const [output, setOutput] = useState<string>("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = () => {
    if (!form.load_kw) return toast.error("Project load is required");
    const txt = buildChecklist(form);
    setOutput(txt);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Checklist copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ups-enquiry-${Date.now()}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><ClipboardList className="h-7 w-7 text-accent" /> Vendor Enquiry Checklist</h1>
        <p className="text-muted-foreground mt-1">Generate a structured RFQ checklist from your project parameters.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-display font-semibold">Project parameters</h2>
          <div><Label>Project name</Label><Input value={form.project} onChange={(e) => update("project", e.target.value)} placeholder="e.g. DC-North Tier III" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>IT load (kW)</Label><Input type="number" value={form.load_kw} onChange={(e) => update("load_kw", e.target.value)} placeholder="1200" /></div>
            <div><Label>Redundancy</Label>
              <Select value={form.redundancy} onValueChange={(v) => update("redundancy", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["N", "N+1", "N+2", "2N", "2N+1"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Autonomy (min)</Label><Input type="number" value={form.autonomy_min} onChange={(e) => update("autonomy_min", e.target.value)} /></div>
            <div><Label>Battery preference</Label>
              <Select value={form.battery} onValueChange={(v) => update("battery", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["Li-ion", "VRLA", "Either"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Voltage / phase</Label><Input value={form.voltage} onChange={(e) => update("voltage", e.target.value)} /></div>
          <div><Label>Monitoring protocols required</Label><Input value={form.monitoring} onChange={(e) => update("monitoring", e.target.value)} /></div>
          <div><Label>Space constraint</Label><Textarea rows={3} value={form.space} onChange={(e) => update("space", e.target.value)} placeholder="e.g. UPS room 8 × 4 m, front access only" /></div>
          <Button onClick={generate} className="w-full">Generate checklist</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Generated checklist</h2>
            {output && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>Copy</Button>
                <Button variant="outline" size="sm" onClick={download} className="gap-1"><Download className="h-4 w-4" /> .md</Button>
              </div>
            )}
          </div>
          {output ? (
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-md whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto">{output}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Fill in the project parameters and generate the checklist.</p>
          )}
          <p className="text-[11px] text-muted-foreground border-t border-border pt-3">{DISCLAIMER}</p>
        </Card>
      </div>
    </div>
  );
}

function buildChecklist(f: any) {
  const total = Number(f.load_kw) || 0;
  const mult = f.redundancy === "2N" ? 2 : f.redundancy === "2N+1" ? 2.5 : f.redundancy === "N+2" ? 1.5 : f.redundancy === "N+1" ? 1.25 : 1;
  const installedKw = Math.round(total * mult);
  return `# UPS Vendor Enquiry Checklist
${f.project ? `**Project:** ${f.project}` : ""}
**Generated:** ${new Date().toISOString().slice(0, 10)}

## 1. Load & Topology
- Critical IT load: **${f.load_kw} kW**
- Redundancy configuration: **${f.redundancy}**
- Indicative installed UPS capacity (incl. redundancy): **~${installedKw} kW**
- Topology required: Online double-conversion (VFI-SS-111)
- Modular vs monolithic preference: _state preference / no preference_

## 2. Efficiency
- Minimum double-conversion efficiency at 50% load: **≥ 96%**
- Eco-mode efficiency required: **≥ 99%**
- Provide efficiency curves at 25 / 50 / 75 / 100% load

## 3. Battery
- Preferred chemistry: **${f.battery}**
- Required autonomy at full load: **${f.autonomy_min} minutes**
- Battery cabinet footprint and weight
- Battery monitoring / BMS scope
- End-of-life and replacement strategy
- Thermal runaway mitigation (for Li-ion)

## 4. Electrical Interface
- Input / output voltage and phase: **${f.voltage}**
- Input THDi at full load (target ≤ 3%)
- Input power factor (target ≥ 0.99)
- Output voltage regulation (steady state / transient)
- Short-circuit withstand capability

## 5. Mechanical & Space
- Footprint constraints: ${f.space || "_not specified_"}
- Front / rear / side access requirements
- Cable entry (top / bottom)
- Floor loading limits
- Acoustic limits

## 6. Monitoring & Integration
- Required protocols: **${f.monitoring}**
- BMS / DCIM integration scope
- Cybersecurity certifications (IEC 62443)
- Remote diagnostics & service

## 7. Compliance & Service
- IEC / UL / EN compliance statements
- Local certification / approvals (region-specific)
- Warranty terms & extended service options
- Spare-parts availability & MTTR commitments
- Local service partner contact

## 8. Commercial
- Lead time (factory + on-site)
- Unit pricing & options
- Battery pricing separately
- Installation, commissioning & training scope

---
_Generated by DC UPS Benchmark — vendor-neutral consultant tool._
_${DISCLAIMER}_
`;
}
