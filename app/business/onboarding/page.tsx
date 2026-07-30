"use client";

import { useMemo, useState } from "react";

const businessTypes = ["Barber", "Braider", "Loctician", "Wig & Weave Specialist", "Nail Tech", "Lash Artist", "Makeup Artist", "Salon", "Other"];
const templates = [
  { id: "editorial", name: "Editorial", note: "Bold photos and video-first booking" },
  { id: "minimal", name: "Minimal", note: "Clean, calm and easy to scan" },
  { id: "luxury", name: "Luxury", note: "Premium dark styling for VIP brands" },
];
const featureOptions = [
  ["consultations", "Consultations", "Require a consultation before selected services"],
  ["videoConsultations", "Video consultations", "Offer remote consultations by video"],
  ["approvalWorkflow", "Approval workflow", "Review photos and approve clients before booking"],
  ["vipBookings", "Private / VIP bookings", "Show private services only to approved clients"],
  ["groupAppointments", "Group appointments", "Allow multiple seats in one time slot"],
  ["bookFromMedia", "Book from photos and videos", "Turn gallery posts into booking buttons"],
] as const;

type FeatureKey = (typeof featureOptions)[number][0];

export default function BusinessOnboardingPage() {
  const [step, setStep] = useState(1);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    businessType: "Braider",
    address: "",
    phone: "",
    email: "",
    template: "editorial",
    features: {
      consultations: true,
      videoConsultations: false,
      approvalWorkflow: false,
      vipBookings: false,
      groupAppointments: false,
      bookFromMedia: true,
    } as Record<FeatureKey, boolean>,
  });

  const progress = useMemo(() => `${Math.round((step / 3) * 100)}%`, [step]);
  const canContinue = step !== 1 || (form.businessName.trim() && form.email.trim());

  function toggleFeature(key: FeatureKey) {
    setForm((current) => ({
      ...current,
      features: { ...current.features, [key]: !current.features[key] },
    }));
  }

  function finish() {
    localStorage.setItem("booking-business-onboarding", JSON.stringify(form));
    setSaved(true);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f3ee", color: "#171717", padding: "32px 18px 72px" }}>
      <section style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "end", marginBottom: 18 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>Business setup</p>
            <h1 style={{ margin: "8px 0 4px", fontSize: "clamp(34px, 7vw, 68px)", lineHeight: .95 }}>Create your booking page.</h1>
          </div>
          <strong>Step {step} of 3</strong>
        </div>

        <div style={{ height: 8, background: "#ded8ce", borderRadius: 999, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ width: progress, height: "100%", background: "#171717", transition: "width .25s ease" }} />
        </div>

        <div style={{ background: "white", borderRadius: 28, padding: "clamp(22px, 5vw, 48px)", boxShadow: "0 20px 70px rgba(0,0,0,.08)" }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 30, marginTop: 0 }}>Tell us about the business</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
                <Field label="Business name" value={form.businessName} onChange={(value) => setForm({ ...form, businessName: value })} placeholder="Your business name" />
                <label style={labelStyle}>Business type<select style={inputStyle} value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>{businessTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                <Field label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} placeholder="business@email.com" />
                <Field label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} placeholder="(555) 555-5555" />
                <div style={{ gridColumn: "1 / -1" }}><Field label="Address" value={form.address} onChange={(value) => setForm({ ...form, address: value })} placeholder="Shop address or service area" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 30, marginTop: 0 }}>Choose a starting look</h2>
              <p style={{ color: "#666", marginBottom: 22 }}>The business can change this later.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
                {templates.map((template) => {
                  const active = form.template === template.id;
                  return <button key={template.id} onClick={() => setForm({ ...form, template: template.id })} style={{ textAlign: "left", padding: 22, minHeight: 180, borderRadius: 22, border: active ? "3px solid #171717" : "1px solid #ddd", background: template.id === "luxury" ? "#171717" : template.id === "editorial" ? "#e9ff61" : "#fafafa", color: template.id === "luxury" ? "white" : "#171717", cursor: "pointer" }}><span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Template</span><h3 style={{ fontSize: 26, margin: "38px 0 8px" }}>{template.name}</h3><p style={{ margin: 0, opacity: .75 }}>{template.note}</p></button>;
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 30, marginTop: 0 }}>Turn on only what you need</h2>
              <p style={{ color: "#666", marginBottom: 22 }}>Every feature is optional and can be changed later.</p>
              <div style={{ display: "grid", gap: 12 }}>
                {featureOptions.map(([key, title, note]) => <button key={key} onClick={() => toggleFeature(key)} style={{ border: "1px solid #ddd", background: "#fff", borderRadius: 18, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left", cursor: "pointer" }}><span><strong style={{ display: "block", fontSize: 17 }}>{title}</strong><span style={{ color: "#6b6b6b" }}>{note}</span></span><span style={{ width: 52, height: 30, borderRadius: 999, padding: 3, background: form.features[key] ? "#171717" : "#d8d8d8", display: "flex", justifyContent: form.features[key] ? "flex-end" : "flex-start", flexShrink: 0 }}><span style={{ width: 24, height: 24, borderRadius: "50%", background: "white" }} /></span></button>)}
              </div>
              {saved && <div style={{ marginTop: 20, background: "#e9ff61", borderRadius: 16, padding: 18, fontWeight: 800 }}>Business setup saved. The booking page is ready for services and availability.</div>}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, gap: 12 }}>
            <button disabled={step === 1} onClick={() => setStep((value) => Math.max(1, value - 1))} style={secondaryButton}>Back</button>
            {step < 3 ? <button disabled={!canContinue} onClick={() => setStep((value) => Math.min(3, value + 1))} style={{ ...primaryButton, opacity: canContinue ? 1 : .4 }}>Continue</button> : <button onClick={finish} style={primaryButton}>Finish setup</button>}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label style={labelStyle}>{label}<input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

const labelStyle = { display: "grid", gap: 8, fontWeight: 800 } as const;
const inputStyle = { width: "100%", boxSizing: "border-box", border: "1px solid #d9d4cc", borderRadius: 14, padding: "15px 14px", background: "#fbfaf8", color: "#171717", fontSize: 16 } as const;
const primaryButton = { border: 0, borderRadius: 999, background: "#171717", color: "white", fontWeight: 800, padding: "14px 24px", cursor: "pointer" } as const;
const secondaryButton = { border: "1px solid #ccc", borderRadius: 999, background: "white", color: "#171717", fontWeight: 800, padding: "14px 24px", cursor: "pointer" } as const;
