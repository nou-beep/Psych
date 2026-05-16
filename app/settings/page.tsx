"use client";
// Settings page — theme, print settings, report preferences, and user info.

import Link from "next/link";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { ThemeSelector } from "@/components/shared/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CheckCircle, Download, Smartphone } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import type { AccessibilitySettings } from "@/lib/accessibility";
import { CLIENT_TERMS, TERM_LABELS, type ClientTerm } from "@/lib/terminology";

const SETTINGS_KEY = "psych-settings";

interface AppSettings {
  studentName: string;
  institution: string;
  internshipPlace: string;
  supervisorName: string;
  reportLanguage: "en" | "fr" | "ar";
  reportStyle: "academic" | "clinical" | "minimal" | "soft";
  printMargins: "normal" | "narrow" | "wide";
}

const defaultSettings: AppSettings = {
  studentName: "",
  institution: "",
  internshipPlace: "",
  supervisorName: "",
  reportLanguage: "en",
  reportStyle: "academic",
  printMargins: "normal",
};

const A11Y_LABELS: Array<{ key: keyof AccessibilitySettings; label: string; help?: string }> = [
  { key: "reducedMotion", label: "Reduced motion", help: "Disable most animations and transitions." },
  { key: "mutedColors", label: "Muted colors", help: "Lower the overall color saturation." },
  { key: "largerText", label: "Larger text" },
  { key: "highContrast", label: "High contrast" },
  { key: "softerContrast", label: "Softer contrast" },
  { key: "lowStimulation", label: "Low stimulation", help: "Hide decorative orbs and sparkles." },
  { key: "disableSparkles", label: "Disable sparkles" },
  { key: "simplifiedLayout", label: "Simplified layout", help: "Hide the sidebar margin for a flatter view." },
  { key: "focusOutlines", label: "Visible focus outlines", help: "Help with keyboard navigation." },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const {
    accessibility,
    updateAccessibility,
    toggleSensorySafe,
    resetAccessibility,
    clientTerm,
    setClientTerm,
  } = useSettings();

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try { setSettings(JSON.parse(stored)); } catch {}
    }
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Customize your Psych workspace"
      />

      <div className="space-y-6">

        {/* Appearance — theme + density */}
        <SectionCard
          title="Appearance"
          description="Workspace theme and visual density. Moved here from the top navigation."
        >
          <div className="space-y-3">
            <div>
              <Label className="block mb-2">Theme</Label>
              <ThemeSelector />
              <p className="text-xs mt-2" style={{ color: "var(--psych-muted)" }}>
                Your theme choice is saved automatically. Print pages always
                use clean black/white styling regardless of theme.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Terminology */}
        <SectionCard
          title="Client terminology"
          description="How Psych refers to the people you work with"
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="term-select" className="text-sm">
              Default term
            </Label>
            <Select
              id="term-select"
              value={clientTerm}
              onChange={(e) => setClientTerm(e.target.value as ClientTerm)}
              className="w-48"
            >
              {(CLIENT_TERMS as ClientTerm[]).map((t) => (
                <option key={t} value={t}>
                  {TERM_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--psych-muted)" }}>
            Applies across the UI where the platform refers to the people in
            your care.
          </p>
        </SectionCard>

        {/* User info */}
        <SectionCard title="Your Information" description="Used as defaults in report headers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Student / Clinician Name</Label>
              <Input
                value={settings.studentName}
                onChange={(e) => update("studentName", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label>Institution</Label>
              <Input
                value={settings.institution}
                onChange={(e) => update("institution", e.target.value)}
                placeholder="University or institution name"
              />
            </div>
            <div>
              <Label>Internship / Practicum Place</Label>
              <Input
                value={settings.internshipPlace}
                onChange={(e) => update("internshipPlace", e.target.value)}
                placeholder="Clinic, school, hospital…"
              />
            </div>
            <div>
              <Label>Supervisor Name</Label>
              <Input
                value={settings.supervisorName}
                onChange={(e) => update("supervisorName", e.target.value)}
                placeholder="Supervisor's full name"
              />
            </div>
          </div>
        </SectionCard>

        {/* Report settings */}
        <SectionCard title="Report Settings" description="Language and style for generated reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Report Language</Label>
              <Select
                value={settings.reportLanguage}
                onChange={(e) => update("reportLanguage", e.target.value as AppSettings["reportLanguage"])}
              >
                <option value="en">English</option>
                <option value="fr">French (Français)</option>
                <option value="ar">Arabic (العربية)</option>
              </Select>
              <p className="text-[10px] mt-1" style={{ color: "var(--psych-muted)" }}>
                Multi-language report generation coming in a future update.
              </p>
            </div>
            <div>
              <Label>Report Style</Label>
              <Select
                value={settings.reportStyle}
                onChange={(e) => update("reportStyle", e.target.value as AppSettings["reportStyle"])}
              >
                <option value="academic">Academic — formal, structured</option>
                <option value="clinical">Clinical — practical, focused</option>
                <option value="minimal">Minimal — clean, brief</option>
                <option value="soft">Soft — warm, accessible</option>
              </Select>
            </div>
          </div>
        </SectionCard>

        {/* Print settings */}
        <SectionCard title="Print Settings" description="Page formatting for printed reports and grids">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Page Margins</Label>
              <Select
                value={settings.printMargins}
                onChange={(e) => update("printMargins", e.target.value as AppSettings["printMargins"])}
              >
                <option value="normal">Normal (2cm)</option>
                <option value="narrow">Narrow (1.5cm)</option>
                <option value="wide">Wide (2.5cm)</option>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <div
                className="px-3 py-2 rounded-lg text-xs"
                style={{ backgroundColor: "var(--psych-primary-light)", color: "var(--psych-accent)" }}
              >
                ✦ All reports and grids print on A4 paper with clean academic styling
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Accessibility */}
        <SectionCard
          title="Accessibility & Sensory Safe Mode"
          description="Make the workspace gentler on your senses and easier to navigate"
        >
          <div className="space-y-4">
            <label
              className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer"
              style={{
                borderColor: accessibility.sensorySafeMode
                  ? "var(--psych-primary)"
                  : "var(--psych-border)",
                backgroundColor: accessibility.sensorySafeMode
                  ? "var(--psych-primary-light)"
                  : "var(--psych-bg)",
              }}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={accessibility.sensorySafeMode}
                onChange={(e) => toggleSensorySafe(e.target.checked)}
              />
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--psych-text)" }}>
                  Sensory Safe Mode ✦
                </p>
                <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                  Reduces animations, softens contrast, mutes colors, hides
                  sparkles. Individual toggles below remain available.
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {A11Y_LABELS.map(({ key, label, help }) => (
                <label
                  key={key}
                  className="flex items-start gap-2 p-2 rounded-lg cursor-pointer"
                  style={{ color: "var(--psych-text)" }}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={accessibility[key]}
                    onChange={(e) =>
                      updateAccessibility({ [key]: e.target.checked })
                    }
                  />
                  <div className="text-sm">
                    <div>{label}</div>
                    {help && (
                      <div className="text-xs" style={{ color: "var(--psych-muted)" }}>
                        {help}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={resetAccessibility}>
                Reset accessibility
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Install PWA */}
        <SectionCard
          title="Install Psych"
          description="Use Psych as an app on your iPad, phone, or desktop"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--psych-primary-light)" }}
            >
              <Smartphone size={18} style={{ color: "var(--psych-primary)" }} />
            </div>
            <div className="space-y-2 text-sm">
              <p style={{ color: "var(--psych-text)" }}>
                Psych can be installed as a standalone app. Use your browser&rsquo;s
                <strong> Install </strong>(or <strong>Add to Home Screen</strong>) option from the
                share menu.
              </p>
              <p className="text-xs" style={{ color: "var(--psych-muted)" }}>
                Your data is stored locally on the device. Use Backup &amp;
                Export to move it between devices.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Backup link */}
        <SectionCard
          title="Backup & Export"
          description="Export, import, or reset your local Psych data"
        >
          <Link href="/backup">
            <Button variant="secondary" size="md">
              <Download size={14} /> Open Backup &amp; Export
            </Button>
          </Link>
        </SectionCard>

        {/* Data note */}
        <SectionCard title="Data & Privacy" description="Understanding mock mode">
          <div className="space-y-2 text-sm" style={{ color: "var(--psych-muted)" }}>
            <p>Psych is currently running with <strong style={{ color: "var(--psych-text)" }}>demo / mock data</strong>. No real patient data is stored.</p>
            <p>When Supabase is connected, your data will be securely stored in your own database instance.</p>
            <p>All case codes in the current version are fictional and anonymized.</p>
          </div>
        </SectionCard>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <Button onClick={saveSettings} size="md">
            Save Settings
          </Button>
          {saved && (
            <div className="flex items-center gap-2 text-sm animate-fade-in" style={{ color: "#15803D" }}>
              <CheckCircle size={14} />
              Saved!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
