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
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/app/checklist")({ component: ChecklistPage });

function ChecklistPage() {
  const [form, setForm] = useState({
    project: "",
    load_kw: "",
    ups_type: "Modular",
    redundancy: "N+1",
    autonomy_min: "10",
    battery: "Li-ion",
    battery_strings: "",
    input_voltage: "400V 3-phase",
    output_voltage: "400V 3-phase",

    bypass: "Yes",
    information_required: [],
    remarks: "",
  });
  const [output, setOutput] = useState<string>("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const toggleInformationRequired = (item: string) => {
    setForm((f: any) => {
      const current = f.information_required ?? [];
      const exists = current.includes(item);
  
      return {
        ...f,
        information_required: exists
          ? current.filter((x: string) => x !== item)
          : [...current, item],
      };
    });
  };
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
    <div className="grid lg:grid-cols-2 gap-6">
    <Card className="p-6 space-y-4">
      <h2 className="font-display font-semibold">UPS Enquiry Form</h2>
  
      <div>
  <Label>Project Name</Label>
  <Input
    value={form.project}
    onChange={(e) => update("project", e.target.value)}
    placeholder="e.g. DC North Tier II UPS upgrade"
  />
</div>

<div className="grid grid-cols-2 gap-3">
  <div>
    <Label>Target UPS load (kW)</Label>
    <Input
      type="number"
      value={form.load_kw}
      onChange={(e) => update("load_kw", e.target.value)}
      placeholder="e.g. 1200"
    />
  </div>

  <div>
    <Label>UPS Type</Label>
    <Select value={form.ups_type} onValueChange={(v) => update("ups_type", v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["Modular", "Monolithic", "No preference"].map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>
<div className="grid grid-cols-2 gap-3">
  <div>
    <Label>Redundancy</Label>
    <Select value={form.redundancy} onValueChange={(v) => update("redundancy", v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["N", "N+1", "N+2", "2N", "2N+1"].map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div>
    <Label>Maintenance Bypass Required?</Label>
    <Select value={form.bypass} onValueChange={(v) => update("bypass", v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["Yes", "No"].map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>

<div className="grid grid-cols-2 gap-3">
  <div>
    <Label>Input Voltage</Label>
    <Input
      value={form.input_voltage}
      onChange={(e) => update("input_voltage", e.target.value)}
      placeholder="e.g. 400V 3-phase"
    />
  </div>

  <div>
    <Label>Output Voltage</Label>
    <Input
      value={form.output_voltage}
      onChange={(e) => update("output_voltage", e.target.value)}
      placeholder="e.g. 400V 3-phase"
    />
  </div>
</div>

<div className="grid grid-cols-2 gap-3">
  <div>
    <Label>Required Backup Time (min)</Label>
    <Input
      type="number"
      value={form.autonomy_min}
      onChange={(e) => update("autonomy_min", e.target.value)}
      placeholder="e.g. 10"
    />
  </div>

  <div>
    <Label>Battery Chemistry</Label>
    <Select value={form.battery} onValueChange={(v) => update("battery", v)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {["Li-ion", "VRLA", "No preference"].map((x) => (
          <SelectItem key={x} value={x}>
            {x}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</div>

<div className="grid grid-cols-2 gap-3">
  <div>
    <Label>No. of Battery Strings</Label>
    <Input
      type="number"
      value={form.battery_strings}
      onChange={(e) => update("battery_strings", e.target.value)}
      placeholder="e.g. 3"
    />
  </div>
</div>
  <Label>Information Required</Label>

  <div className="space-y-3 rounded-md border border-border p-4 mt-2">
    <p className="text-xs text-muted-foreground">
      Tick the information you want the vendor to advise or provide.
    </p>

    {[
      "Efficiency Curves At 25%, 50%, 75% and 100% Load",
      "Heat Rejection",
      "Front / Rear / Side Maintenance Access Requirements",
            "Battery Cabinet Footprint And Weight",
            "Equipment Lead Time",
      "UPS Unit Pricing",
      "Battery Unit Pricing",
    ].map((item) => (
      <label key={item} className="flex items-center gap-3 text-sm">
        <Checkbox
          checked={form.information_required.includes(item)}
          onCheckedChange={() => toggleInformationRequired(item)}
        />
        <span>{item}</span>
      </label>
    ))}
  </div>

  
      <div>
        <Label>Remarks</Label>
        <Textarea
          rows={3}
          value={form.remarks}
          onChange={(e) => update("remarks", e.target.value)}
          placeholder="Any project-specific requirement or concern"
        />
      </div>
  
      <Button onClick={generate} className="w-full">Generate Checklist</Button>
    </Card>
         
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Generated Checklist</h2>
            {output && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>Copy</Button>
                <Button variant="outline" size="sm" onClick={download} className="gap-1"><Download className="h-4 w-4" /> .md</Button>
              </div>
            )}
          </div>
          {output ? (
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-md whitespace-pre-wrap leading-relaxed">{output}</pre>
          ) : (
            <p className="text-sm text-muted-foreground">Fill in the project parameters and generate the checklist.</p>
          )}
          <p className="text-[11px] text-muted-foreground border-t border-border pt-3">{DISCLAIMER}</p>
        </Card>
      </div>
      );
}

function buildChecklist(f: any) {
  const total = Number(f.load_kw) || 0;
  const mult =
    f.redundancy === "2N"
      ? 2
      : f.redundancy === "2N+1"
        ? 2.5
        : f.redundancy === "N+2"
          ? 1.5
          : f.redundancy === "N+1"
            ? 1.25
            : 1;

  const installedKw = Math.round(total * mult);
  const informationRequired = f.information_required ?? [];

  return `# UPS Vendor Enquiry Checklist

${f.project ? `Project: ${f.project}` : ""}
Generated: ${new Date().toISOString().slice(0, 10)}

## 1. Load & Configuration
- Critical IT load: ${f.load_kw} kW
- UPS type: ${f.ups_type}
- Redundancy configuration: ${f.redundancy}
- Preliminary UPS capacity allowance: ${installedKw} kW

## 2. Battery
- Required autonomy at full load: ${f.autonomy_min || "_not specified_"} minutes
- Preferred chemistry: ${f.battery}
- No. of battery strings: ${f.battery_strings || "_not specified_"}

## 3. Electrical Interface
- Input voltage and phase: ${f.input_voltage}
- Output voltage and phase: ${f.output_voltage}
- Maintenance bypass required: ${f.bypass}
- Input THDi at full load: target ≤ 3%
- Input power factor: target ≥ 0.99

## 4. Information Required
${informationRequired.length > 0 ? informationRequired.map((item: string) => `- ${item}`).join("\n") : "- No additional vendor information selected"}

${f.remarks ? `## 5. Remarks\n${f.remarks}\n` : ""}

---
Generated by UPS Wonderbook — vendor-neutral consultant tool.
This app is for preliminary product benchmarking and consultant reference only. Final selection shall be verified against certified vendor data, project requirements, local regulations, and professional engineering judgement.
`;
}
