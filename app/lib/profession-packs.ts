export const professionIds = [
  "barber", "salon", "braider", "loctician", "wig-stylist",
  "tattoo-artist", "esthetician", "makeup-artist", "nail-technician", "lash-artist",
] as const;

export type ProfessionId = (typeof professionIds)[number];

export type ProfessionPack = {
  id: ProfessionId;
  name: string;
  accent: string;
  reminderLead: "2h" | "1d" | "2d";
  flags: { walkIns: boolean; recurring: boolean; consultations: boolean; intakeRequired: boolean };
  services: Array<{ name: string; category: string; durationMinutes: number; priceCents: number; depositType: "none" | "fixed" | "percent"; depositValue: number; consultationRequired?: boolean }>;
  intakeFields: Array<{ id: string; label: string; required: boolean }>;
};

const service = (name: string, category: string, durationMinutes: number, priceCents: number, depositValue = 25) =>
  ({ name, category, durationMinutes, priceCents, depositType: depositValue ? "percent" as const : "none" as const, depositValue });

export const professionPacks: Record<ProfessionId, ProfessionPack> = {
  barber: { id: "barber", name: "Barber", accent: "#173c2b", reminderLead: "2h", flags: { walkIns: true, recurring: true, consultations: false, intakeRequired: false }, services: [service("Signature Haircut", "Cuts", 45, 4500), service("Cut & Beard", "Cuts", 60, 6500), service("Kids Cut", "Cuts", 30, 3000)], intakeFields: [{ id: "cut", label: "Cut or style notes", required: false }] },
  salon: { id: "salon", name: "Salon", accent: "#703d50", reminderLead: "1d", flags: { walkIns: true, recurring: true, consultations: true, intakeRequired: false }, services: [service("Silk Press", "Styling", 120, 9500), service("Cut & Style", "Styling", 90, 8500), service("Color Consultation", "Color", 30, 3500, 0)], intakeFields: [{ id: "hair_history", label: "Recent color or chemical history", required: false }] },
  braider: { id: "braider", name: "Braider", accent: "#6d39d4", reminderLead: "1d", flags: { walkIns: false, recurring: false, consultations: true, intakeRequired: false }, services: [service("Medium Knotless Braids", "Braids", 300, 22000), service("Feed-in Cornrows", "Braids", 180, 14000), service("Boho Braids", "Braids", 360, 28500)], intakeFields: [{ id: "hair_length", label: "Current hair length", required: true }, { id: "color", label: "Braiding hair color", required: false }] },
  loctician: { id: "loctician", name: "Loctician", accent: "#9a5c24", reminderLead: "1d", flags: { walkIns: false, recurring: true, consultations: true, intakeRequired: false }, services: [service("Retwist", "Maintenance", 120, 9500), service("Retwist & Style", "Maintenance", 165, 13500), { ...service("Starter Loc Consultation", "Consultations", 30, 4000, 0), consultationRequired: false }], intakeFields: [{ id: "loc_stage", label: "Current loc stage", required: true }] },
  "wig-stylist": { id: "wig-stylist", name: "Wig Stylist", accent: "#b33b6b", reminderLead: "1d", flags: { walkIns: false, recurring: false, consultations: true, intakeRequired: false }, services: [service("Wig Install", "Installs", 180, 17500), service("Wig Reinstall", "Installs", 150, 14000), service("Custom Unit Consultation", "Custom Units", 30, 3000, 0)], intakeFields: [{ id: "unit", label: "Unit type and condition", required: true }] },
  "tattoo-artist": { id: "tattoo-artist", name: "Tattoo Artist", accent: "#202020", reminderLead: "2d", flags: { walkIns: true, recurring: false, consultations: true, intakeRequired: true }, services: [{ ...service("Custom Tattoo Consultation", "Consultations", 30, 5000, 0), consultationRequired: false }, { ...service("Tattoo Session", "Sessions", 180, 30000, 30), consultationRequired: true }, service("Flash Tattoo", "Flash", 90, 15000, 30)], intakeFields: [{ id: "age", label: "I confirm I am 18 or older", required: true }, { id: "placement", label: "Placement and approximate size", required: true }] },
  esthetician: { id: "esthetician", name: "Esthetician", accent: "#597b65", reminderLead: "1d", flags: { walkIns: false, recurring: true, consultations: true, intakeRequired: true }, services: [service("Signature Facial", "Facials", 60, 10500), service("Chemical Peel", "Advanced Skincare", 60, 13500), service("Brow Wax", "Waxing", 20, 2800, 0)], intakeFields: [{ id: "skin", label: "Skin concerns and sensitivities", required: true }, { id: "medications", label: "Relevant medications", required: true }] },
  "makeup-artist": { id: "makeup-artist", name: "Makeup Artist", accent: "#a7445c", reminderLead: "2d", flags: { walkIns: false, recurring: false, consultations: true, intakeRequired: false }, services: [service("Soft Glam", "Makeup", 75, 11000), service("Full Glam", "Makeup", 90, 14500), service("Bridal Trial", "Bridal", 120, 17500)], intakeFields: [{ id: "event", label: "Event type and ready-by time", required: true }] },
  "nail-technician": { id: "nail-technician", name: "Nail Technician", accent: "#73509a", reminderLead: "1d", flags: { walkIns: true, recurring: true, consultations: false, intakeRequired: false }, services: [service("Gel Manicure", "Manicures", 60, 5500), service("Acrylic Full Set", "Enhancements", 120, 9500), service("Structured Gel Fill", "Fills", 90, 7500)], intakeFields: [{ id: "removal", label: "Do you need product removal?", required: true }] },
  "lash-artist": { id: "lash-artist", name: "Lash Artist", accent: "#59475f", reminderLead: "1d", flags: { walkIns: false, recurring: true, consultations: false, intakeRequired: true }, services: [service("Classic Full Set", "Full Sets", 120, 13500), service("Hybrid Full Set", "Full Sets", 150, 16500), service("Two Week Fill", "Fills", 75, 8500)], intakeFields: [{ id: "reaction", label: "Prior adhesive reactions or eye conditions", required: true }] },
};

export function getProfessionPack(id: string) {
  return professionPacks[id as ProfessionId] || professionPacks.salon;
}
