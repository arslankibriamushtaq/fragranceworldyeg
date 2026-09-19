"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

export default function AdminThemePage() {
  const [theme, setTheme] = useState({
    primaryColor: "#b88c65",
    secondaryColor: "#0d0b0b",
    accentColor: "#a77a54",
    fontHeading: "Playfair Display",
    fontBody: "Inter",
    logo: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/theme").then((r) => r.json()).then(setTheme).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (res.ok) {
        document.documentElement.style.setProperty("--primary", theme.primaryColor);
        document.documentElement.style.setProperty("--secondary", theme.secondaryColor);
        toast.success("Theme saved! Changes will apply immediately.");
      } else {
        toast.error("Failed to save theme");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gold-400 text-white px-4 py-2 text-sm hover:bg-gold-500 transition-colors disabled:opacity-50">
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="font-semibold text-gray-900">Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "primaryColor", label: "Primary Color (Gold)" },
            { key: "secondaryColor", label: "Secondary Color" },
            { key: "accentColor", label: "Accent Color" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(theme as any)[key]}
                  onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                  className="w-12 h-10 border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={(theme as any)[key]}
                  onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                  className="input-luxury flex-1 font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Typography</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Heading Font</label>
            <select value={theme.fontHeading} onChange={(e) => setTheme({ ...theme, fontHeading: e.target.value })} className="input-luxury">
              <option>Playfair Display</option>
              <option>Cormorant Garamond</option>
              <option>EB Garamond</option>
              <option>Cinzel</option>
              <option>Libre Baskerville</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Body Font</label>
            <select value={theme.fontBody} onChange={(e) => setTheme({ ...theme, fontBody: e.target.value })} className="input-luxury">
              <option>Inter</option>
              <option>Lato</option>
              <option>Open Sans</option>
              <option>Raleway</option>
              <option>Montserrat</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo</h2>
        <div>
          <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Logo URL</label>
          <input value={theme.logo} onChange={(e) => setTheme({ ...theme, logo: e.target.value })} className="input-luxury" placeholder="https://res.cloudinary.com/..." />
          {theme.logo && <img src={theme.logo} alt="Logo preview" className="mt-3 h-12 object-contain" />}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Color Preview</h2>
        <div className="flex gap-3">
          <div className="flex-1 h-16 rounded flex items-center justify-center text-white text-sm font-medium" style={{ background: theme.primaryColor }}>Primary</div>
          <div className="flex-1 h-16 rounded flex items-center justify-center text-white text-sm font-medium" style={{ background: theme.secondaryColor }}>Secondary</div>
          <div className="flex-1 h-16 rounded flex items-center justify-center text-white text-sm font-medium" style={{ background: theme.accentColor }}>Accent</div>
        </div>
      </div>
    </div>
  );
}
