"use client";
// Settings page — theme, print settings, report preferences, and user info.

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { ThemeSelector } from "@/components/shared/ThemeSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

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

        {/* Theme */}
        <SectionCard title="Theme" description="Choose the color theme for your workspace">
          <div className="py-2">
            <ThemeSelector />
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--psych-muted)" }}>
            Your theme choice is saved automatically to your browser.
            Print pages always use clean black/white styling regardless of theme.
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
