"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "./lib/supabase-browser";

type Service = {
  name: string;
  description: string;
  duration: string;
  deposit: string;
  image: string;
  consultation?: boolean;
  category?: string;
  price?: number;
};

type CatalogService = {
  category: "Braiders" | "Weave/Wigs" | "Barbers" | "Locticians" | "Add-On / Universal";
  name: string;
  minHours: number;
  maxHours: number;
  minPrice: number;
  maxPrice: number;
  hair: string;
  multiSession: boolean;
  deposit: number;
  note?: string;
};

const catalogRows: Array<[CatalogService["category"], string, number, number, number, number, string, boolean, number, string?]> = [
  ["Braiders","Consultation",.25,.5,0,0,"N/A",false,0,"Free or credited to install"],
  ["Braiders","Cornrows – 2 braids",.75,1,50,70,"Optional",false,0],
  ["Braiders","Cornrows – 4 braids",1,1.5,60,85,"Optional",false,0],
  ["Braiders","Cornrows – 6+ / design",1.5,2.5,90,140,"Optional",false,0],
  ["Braiders","Feed-in braids / ponytail",1.5,2,75,120,"Included",false,0],
  ["Braiders","Stitch braids",2,3,110,160,"Included",false,30],
  ["Braiders","Knotless braids – small",5,8,200,280,"Included",true,50,"Long appointment"],
  ["Braiders","Knotless braids – medium",4,6,180,220,"Included",false,50],
  ["Braiders","Knotless braids – large/jumbo",3,4,150,190,"Included",false,50],
  ["Braiders","Box braids – small",6,8,200,280,"Included",true,50],
  ["Braiders","Box braids – medium",4,6,150,200,"Included",false,50],
  ["Braiders","Box braids – large",3,4,130,170,"Included",false,50],
  ["Braiders","Senegalese twists",4,6,150,220,"Included",false,50],
  ["Braiders","Passion twists",4,6,160,220,"Included",false,50],
  ["Braiders","Marley / Havana twists",4,6,150,210,"Included",false,50],
  ["Braiders","Faux locs – short",5,7,200,280,"Included",true,50],
  ["Braiders","Faux locs – long",6,9,250,350,"Included",true,50,"Longest service; firm deposit"],
  ["Braiders","Goddess / boho braids",5,7,220,300,"Included",true,50],
  ["Braiders","Tribal braids",3,5,160,240,"Included",false,50],
  ["Braiders","Micro braids",6,10,250,400,"Included",true,50],
  ["Braiders","Tree braids",3,5,150,250,"Included",false,50],
  ["Braiders","Lemonade / side braids",3,5,140,220,"Included",false,30],
  ["Braiders","Kids braids",1.5,2.5,75,120,"Optional",false,0],
  ["Braiders","Loc retwist / maintenance",1.5,2.5,75,125,"N/A",false,0],
  ["Braiders","Braid repair / edge redo",.5,1.5,30,75,"Optional",false,0,"Refresh front only"],
  ["Braiders","Takedown / removal",1,2.5,40,90,"N/A",false,0],
  ["Braiders","Wash & braid prep",.5,.75,25,40,"N/A",false,0,"Also available as an add-on"],
  ["Weave/Wigs","Consultation",.25,.5,0,0,"N/A",false,0],
  ["Weave/Wigs","Sew-in – partial / leave-out",2,3,120,180,"Not included",false,40,"Client brings bundles"],
  ["Weave/Wigs","Sew-in – full head",3,4,150,250,"Not included",false,40],
  ["Weave/Wigs","Sew-in – with closure",3,4.5,180,275,"Not included",false,50],
  ["Weave/Wigs","Sew-in – with frontal",3.5,5,200,300,"Not included",true,50],
  ["Weave/Wigs","Versatile / vixen sew-in",4,5,220,320,"Not included",true,50],
  ["Weave/Wigs","Quick weave",2,3,100,180,"Not included",false,40],
  ["Weave/Wigs","Crochet braids",2,3,100,150,"Not included",false,30,"Bring 5-pack"],
  ["Weave/Wigs","Wig install – basic",1,1.5,80,130,"Not included",false,30],
  ["Weave/Wigs","Wig install – with customization",2,3,130,220,"Not included",false,40],
  ["Weave/Wigs","Frontal/closure customization only",1.5,2.5,80,150,"Not included",false,30],
  ["Weave/Wigs","Wig construction (from bundles)",2.5,4,150,275,"Not included",false,50],
  ["Weave/Wigs","Wig revamp / restyle",1.5,2.5,75,150,"Not included",false,30],
  ["Weave/Wigs","Ponytail install (drawstring/sleek)",1,2,60,150,"Not included",false,30],
  ["Weave/Wigs","Clip-in application",.75,1.5,50,100,"Not included",false,0],
  ["Weave/Wigs","Tape-in extensions",1.5,3,150,300,"Not included",false,50],
  ["Weave/Wigs","I-tip / K-tip extensions",2,4,200,400,"Not included",true,50],
  ["Weave/Wigs","Micro-link / bead extensions",2,4,180,350,"Not included",false,50],
  ["Weave/Wigs","Wash & style (existing install)",1,1.5,45,75,"N/A",false,0],
  ["Weave/Wigs","Bundle coloring",1.5,3,80,180,"Not included",false,30],
  ["Weave/Wigs","Glue/bond removal treatment",.5,1,30,60,"N/A",false,0],
  ["Weave/Wigs","Take-down / removal",.75,1.5,40,75,"N/A",false,0],
  ["Barbers","Haircut / fade",.5,.75,25,40,"N/A",false,0],
  ["Barbers","Haircut + beard",.75,1,40,55,"N/A",false,0],
  ["Barbers","Skin / bald fade",.75,.75,30,45,"N/A",false,0],
  ["Barbers","Buzz cut",.25,.5,15,25,"N/A",false,0],
  ["Barbers","Head shave (bald)",.5,.5,25,40,"N/A",false,0],
  ["Barbers","Beard trim / sculpt",.25,.5,20,35,"N/A",false,0],
  ["Barbers","Line-up / edge-up",.25,.25,15,20,"N/A",false,0],
  ["Barbers","Hot towel straight-razor shave",.5,.75,30,45,"N/A",false,0],
  ["Barbers","Cut + shampoo + shave (package)",.75,1,40,55,"N/A",false,0],
  ["Barbers","Kids cut",.5,.5,20,30,"N/A",false,0],
  ["Barbers","Senior cut",.5,.5,20,30,"N/A",false,0],
  ["Barbers","Grey blending / color",.33,.67,25,50,"N/A",false,0],
  ["Barbers","Design / hair art",.25,.5,10,30,"N/A",false,0,"Also an add-on"],
  ["Barbers","Braids / twists for men",1,2.5,60,150,"Optional",false,30],
  ["Barbers","Cornrows for men",1,2,50,120,"Optional",false,0],
  ["Barbers","Eyebrow / brow line",.15,.25,10,20,"N/A",false,0],
  ["Barbers","Ear/nose wax",.15,.25,10,20,"N/A",false,0],
  ["Barbers","Facial / black mask",.33,.5,15,35,"N/A",false,0],
  ["Barbers","Scalp treatment",.33,.5,15,35,"N/A",false,0],
  ["Barbers","Hair fibers / enhancement",.25,.5,15,40,"N/A",false,0],
  ["Locticians","Consultation",.25,.5,0,30,"N/A",false,0,"May be credited to install"],
  ["Locticians","Loc retwist / maintenance",1.5,2.5,75,125,"N/A",false,0],
  ["Locticians","Retwist + style",2,3,95,160,"N/A",false,0],
  ["Locticians","Retwist + wash",2,3,90,150,"N/A",false,0],
  ["Locticians","Starter locs – coils/comb coils",2,4,100,180,"N/A",false,30],
  ["Locticians","Starter locs – two-strand twist",2.5,4,120,200,"N/A",false,30],
  ["Locticians","Instant / crochet locs",5,8,250,450,"N/A",false,50],
  ["Locticians","Loc extensions install",6,10,400,800,"Not included",true,100,"Hair added; long or multi-session"],
  ["Locticians","Interlocking / root maintenance",2,4,100,180,"N/A",false,0],
  ["Locticians","Microlocs – install",8,14,500,1000,"N/A",true,100,"Usually split across sessions"],
  ["Locticians","Microlocs – maintenance",3,5,150,275,"N/A",false,0],
  ["Locticians","Sisterlocks – install",10,20,600,1200,"N/A",true,150,"Multi-session"],
  ["Locticians","Sisterlocks – retightening",3,5,150,300,"N/A",false,0],
  ["Locticians","Wick locs – install",6,10,300,600,"N/A",true,75],
  ["Locticians","Loc repair",.5,3,75,100,"N/A",false,0,"Hourly or per loc"],
  ["Locticians","Loc combining / merging",1,3,75,200,"N/A",false,0],
  ["Locticians","Barrel roll / pipe cleaner styling",1,2,60,120,"N/A",false,0],
  ["Locticians","Loc coloring",2,4,100,250,"N/A",false,30],
  ["Locticians","Deep cleanse / detox treatment",1,2,60,120,"N/A",false,0],
  ["Locticians","Loc takedown",2,8,75,100,"N/A",false,50,"Hourly; can be very long"],
  ["Add-On / Universal","Silk press / press & curl",1.5,2.5,65,120,"N/A",false,0],
  ["Add-On / Universal","Deep conditioning treatment",.5,.75,25,50,"N/A",false,0],
  ["Add-On / Universal","Trim / dusting",.33,.5,20,40,"N/A",false,0],
  ["Add-On / Universal","Detangle / blow-out prep on arrival",.5,1,25,60,"N/A",false,0,"Surcharge if hair is not prepared"],
  ["Add-On / Universal","Extra length surcharge",0,.5,15,50,"N/A",false,0,"Adds time and price"],
  ["Add-On / Universal","Extra thickness / density surcharge",0,.5,15,50,"N/A",false,0],
  ["Add-On / Universal","Color / dye",1.5,3,80,200,"N/A",false,30],
  ["Add-On / Universal","Bridal / event styling",2,4,150,400,"N/A",false,75,"Books ahead"],
  ["Add-On / Universal","Hair design / pattern add-on",.25,.5,10,30,"N/A",false,0],
  ["Add-On / Universal","Custom / other (stylist confirms)",0,0,0,0,"N/A",false,0,"Stylist confirms price and time"],
];

const serviceCatalog: CatalogService[] = catalogRows.map(([category,name,minHours,maxHours,minPrice,maxPrice,hair,multiSession,deposit,note]) => ({
  category,name,minHours,maxHours,minPrice,maxPrice,hair,multiSession,deposit,note,
}));

const formatHours = (hours: number) => {
  const minutes = Math.round(hours * 60);
  const wholeHours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!wholeHours) return `${remainder} min`;
  return remainder ? `${wholeHours} hr ${remainder} min` : `${wholeHours} hr`;
};

const durationOptionsFor = (item: CatalogService) => {
  const start = Math.max(15, Math.round(item.minHours * 60 / 15) * 15);
  const end = Math.max(start, Math.round(item.maxHours * 60 / 15) * 15);
  return Array.from({ length: Math.floor((end - start) / 15) + 1 }, (_, index) => formatHours((start + index * 15) / 60));
};

const standardDurationOptions = Array.from({ length: 80 }, (_, index) => formatHours((index + 1) / 4));
const standardPriceOptions = Array.from({ length: 81 }, (_, index) => index * 5);

const parseMenuService = (service: string) => {
  const parts = service.split(" · ");
  const duration = parts[1] || "1 hr";
  const priceMatch = service.match(/(?:from )?\$(\d+(?:\.\d+)?)/);
  const depositMatch = service.match(/\$(\d+) deposit/);
  return {
    name: parts[0] || "Service",
    duration,
    price: priceMatch ? Number(priceMatch[1]) : 0,
    deposit: depositMatch ? Number(depositMatch[1]) : 0,
  };
};

const buildMenuService = (name: string, duration: string, price: number, deposit: number) =>
  `${name.trim() || "Service"} · ${duration} · $${price} · ${deposit ? `$${deposit} deposit` : "no deposit"}`;

type SavedAppointment = {
  id: string;
  client_id?: string;
  client_name: string;
  service_name: string;
  appointment_date: string;
  start_time: string;
  status: string;
  starts_at?: string;
  ends_at?: string;
  client_notes?: string;
};

type ClientRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string;
  visit_count: number;
  last_visit_at: string | null;
  photos?: Array<{ id: string; storage_path: string; purpose: string }>;
};

type PaymentTransaction = {
  id: string;
  client_name: string;
  service_name: string;
  kind: string;
  status: string;
  amount: number;
  tip_amount: number;
  provider_reference: string;
  created_at: string;
};

const services: Service[] = [
  {
    name: "Knotless Braids",
    description: "Lightweight, seamless braids with a natural finish.",
    duration: "4 hr 30 min",
    deposit: "$30 deposit",
    image:
      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=900&q=85",
    category: "Braids",
    price: 220,
  },
  {
    name: "Boho & Tribal Braids",
    description: "Statement braids with soft curls and custom parting.",
    duration: "5 hr",
    deposit: "$35 deposit",
    image:
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=900&q=85",
    category: "Braids",
    price: 250,
  },
  {
    name: "Starter Locs",
    description: "A personalized loc foundation and healthy-hair plan.",
    duration: "Consultation required",
    deposit: "$20 consultation",
    consultation: true,
    image:
      "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=900&q=85",
    category: "Locs",
    price: 20,
  },
  {
    name: "Senegalese Twists",
    description: "Smooth, polished twists with long-lasting movement.",
    duration: "4 hr",
    deposit: "$30 deposit",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
    category: "Twists",
    price: 210,
  },
  {
    name: "Cornrows",
    description: "Classic or creative feed-in cornrow designs.",
    duration: "2 hr 30 min",
    deposit: "$25 deposit",
    image:
      "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?auto=format&fit=crop&w=900&q=85",
    category: "Braids",
    price: 140,
  },
  {
    name: "Retwist & Style",
    description: "Clean maintenance, palm roll, and a finished loc style.",
    duration: "2 hr 15 min",
    deposit: "$25 deposit",
    image:
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=900&q=85",
    category: "Locs",
    price: 95,
  },
];

const clientReviews = [
  { quote: "Coral is simply the best. My braids are always neat, lightweight, and last for weeks.", name: "Tameka M.", detail: "Verified appointment" },
  { quote: "Professional, patient, and my braids came out beautiful. The booking process was easy and we started on time.", name: "Nicole R.", detail: "Verified appointment" },
  { quote: "The best braider in Buffalo. My hair grows so much because of the care and products used.", name: "Jasmine L.", detail: "Verified appointment" },
  { quote: "Clean environment, great conversation, and beautiful braids every time.", name: "Erica B.", detail: "Returning client" },
];

const dates = [
  { day: "Wed", date: "29", month: "Jul", iso: "2026-07-29", open: true },
  { day: "Thu", date: "30", month: "Jul", iso: "2026-07-30", open: true },
  { day: "Fri", date: "31", month: "Jul", iso: "2026-07-31", open: true },
  { day: "Sat", date: "01", month: "Aug", iso: "2026-08-01", open: true },
  { day: "Tue", date: "04", month: "Aug", iso: "2026-08-04", open: true },
  { day: "Wed", date: "05", month: "Aug", iso: "2026-08-05", open: true },
  { day: "Thu", date: "06", month: "Aug", iso: "2026-08-06", open: true },
  { day: "Fri", date: "07", month: "Aug", iso: "2026-08-07", open: true },
  { day: "Sat", date: "08", month: "Aug", iso: "2026-08-08", open: true },
];

const monthCalendar = [
  { date: "26", muted: true }, { date: "27", muted: true }, { date: "28", muted: true },
  { date: "29", bookingIndex: 0 }, { date: "30", bookingIndex: 1 }, { date: "31", bookingIndex: 2 },
  { date: "1", bookingIndex: 3 }, { date: "2", closed: true }, { date: "3", closed: true },
  { date: "4", bookingIndex: 4 }, { date: "5", bookingIndex: 5 }, { date: "6", bookingIndex: 6 },
  { date: "7", bookingIndex: 7 }, { date: "8", bookingIndex: 8 }, { date: "9", closed: true },
  { date: "10", closed: true }, { date: "11", full: true }, { date: "12", full: true },
  { date: "13", full: true }, { date: "14", full: true }, { date: "15", full: true },
  { date: "16", closed: true }, { date: "17", closed: true }, { date: "18", full: true },
  { date: "19", full: true }, { date: "20", full: true }, { date: "21", full: true },
  { date: "22", full: true }, { date: "23", closed: true }, { date: "24", closed: true },
  { date: "25", full: true }, { date: "26", full: true }, { date: "27", full: true },
  { date: "28", full: true }, { date: "29", full: true }, { date: "30", closed: true },
  { date: "31", closed: true }, { date: "1", muted: true }, { date: "2", muted: true },
  { date: "3", muted: true }, { date: "4", muted: true }, { date: "5", muted: true },
];

const times = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"];

type ServiceAddon = {
  name: string;
  price: number;
  minutes: number;
  note: string;
  categories: Array<"Braiders" | "Weave/Wigs" | "Barbers" | "Locticians" | "Universal">;
  custom?: boolean;
};

const defaultOwnerAddonCatalog: ServiceAddon[] = [
  { name: "Hair included", price: 45, minutes: 0, note: "Professional braiding hair supplied", categories: ["Braiders"] },
  { name: "Extra length", price: 30, minutes: 30, note: "Waist length or longer", categories: ["Braiders","Weave/Wigs","Locticians"] },
  { name: "Extra-small parts", price: 40, minutes: 60, note: "Smaller sections and added detail", categories: ["Braiders"] },
  { name: "Boho curls", price: 35, minutes: 30, note: "Loose human-hair curls added throughout", categories: ["Braiders"] },
  { name: "Beads & accessories", price: 15, minutes: 15, note: "Beads, cuffs, string, or charms", categories: ["Braiders","Locticians"] },
  { name: "Custom braid color blend", price: 25, minutes: 15, note: "Blend two or more braiding-hair colors", categories: ["Braiders"] },
  { name: "Triangle or designer parts", price: 30, minutes: 30, note: "Custom section pattern instead of standard parts", categories: ["Braiders"] },
  { name: "Braid touch-up", price: 45, minutes: 45, note: "Refresh the front or perimeter", categories: ["Braiders"] },
  { name: "Bleach knots", price: 35, minutes: 45, note: "Lighten knots for a natural-looking lace", categories: ["Weave/Wigs"] },
  { name: "Pluck hairline", price: 30, minutes: 30, note: "Customize density around the hairline", categories: ["Weave/Wigs"] },
  { name: "Wig cap", price: 10, minutes: 0, note: "Fresh cap supplied for the install", categories: ["Weave/Wigs"] },
  { name: "Wand curls or crimps", price: 35, minutes: 30, note: "Finished curls, waves, or crimped styling", categories: ["Weave/Wigs"] },
  { name: "Baby-hair styling", price: 20, minutes: 15, note: "Detailed edge and baby-hair finish", categories: ["Weave/Wigs"] },
  { name: "Bundle or wig coloring", price: 95, minutes: 120, note: "Single-process color before installation", categories: ["Weave/Wigs"] },
  { name: "Same-day lace customization", price: 50, minutes: 60, note: "Expedited customization when available", categories: ["Weave/Wigs"] },
  { name: "Install removal", price: 45, minutes: 45, note: "Safely remove the current wig or weave", categories: ["Weave/Wigs"] },
  { name: "Beard trim", price: 20, minutes: 15, note: "Shape and detail the beard", categories: ["Barbers"] },
  { name: "Beard color", price: 25, minutes: 20, note: "Natural-looking beard color enhancement", categories: ["Barbers"] },
  { name: "Razor line", price: 10, minutes: 10, note: "Straight-razor edge finish", categories: ["Barbers"] },
  { name: "Hair design", price: 20, minutes: 20, note: "Simple part, line, or custom design", categories: ["Barbers"] },
  { name: "Shampoo", price: 15, minutes: 15, note: "Cleanse before the cut", categories: ["Barbers"] },
  { name: "Hot towel", price: 15, minutes: 15, note: "Hot-towel face preparation and finish", categories: ["Barbers"] },
  { name: "Black mask facial", price: 25, minutes: 25, note: "Clarifying peel-off facial treatment", categories: ["Barbers"] },
  { name: "Hair fibers or enhancement", price: 15, minutes: 10, note: "Temporary enhancement for a sharper finish", categories: ["Barbers"] },
  { name: "Loc wash", price: 35, minutes: 30, note: "Thorough cleanse before maintenance", categories: ["Locticians"] },
  { name: "Loc style", price: 40, minutes: 45, note: "Barrels, two-strand twists, or a basic updo", categories: ["Locticians"] },
  { name: "Loc detox", price: 55, minutes: 60, note: "Deep buildup-removal treatment", categories: ["Locticians"] },
  { name: "Loc repair", price: 15, minutes: 15, note: "Repair one damaged or thinning loc", categories: ["Locticians"] },
  { name: "Additional loc repairs", price: 10, minutes: 10, note: "Price and time added per extra repair", categories: ["Locticians"] },
  { name: "Loc extensions supplied", price: 150, minutes: 0, note: "Standard loc extensions supplied", categories: ["Locticians"] },
  { name: "Loc jewelry", price: 20, minutes: 15, note: "Cuffs, wire, shells, or decorative pieces", categories: ["Locticians"] },
  { name: "Loc color rinse", price: 65, minutes: 60, note: "Temporary or semi-permanent color finish", categories: ["Locticians"] },
  { name: "Shampoo & blow-dry", price: 45, minutes: 45, note: "Cleanse, condition, and stretch", categories: ["Universal"] },
  { name: "Deep conditioning", price: 30, minutes: 30, note: "Moisture treatment before styling", categories: ["Universal"] },
  { name: "Detangling", price: 35, minutes: 30, note: "For hair needing extra preparation", categories: ["Universal"] },
  { name: "Trim or dusting", price: 25, minutes: 20, note: "Light end maintenance", categories: ["Universal"] },
  { name: "Scalp treatment", price: 25, minutes: 20, note: "Soothing scalp care", categories: ["Universal"] },
  { name: "Takedown", price: 60, minutes: 60, note: "Removal before the new service", categories: ["Braiders","Locticians"] },
];

const addonCategoryForService = (serviceName: string): ServiceAddon["categories"][number] => {
  const catalogMatch = serviceCatalog.find(item => item.name.toLowerCase() === serviceName.toLowerCase());
  if (catalogMatch?.category === "Add-On / Universal") return "Universal";
  if (catalogMatch) return catalogMatch.category;
  const value = serviceName.toLowerCase();
  if (/(loc|retwist|wick|sisterlock|interlock)/.test(value)) return "Locticians";
  if (/(wig|weave|sew-in|closure|frontal|bundle|quick weave)/.test(value)) return "Weave/Wigs";
  if (/(cut|fade|beard|line-up|shave|barber)/.test(value)) return "Barbers";
  return "Braiders";
};

function WizardScreen({ kicker, title, copy, children }: { kicker: string; title: string; copy: string; children: ReactNode }) {
  return <div className="wizard-screen"><span className="step-kicker">{kicker}</span><h1>{title}</h1><p>{copy}</p><div className="wizard-content">{children}</div></div>;
}

function WizardNav({ onNext, label = "Continue →", disabled = false }: { onNext: () => void; label?: string; disabled?: boolean }) {
  return <div className="wizard-nav"><span>You can change this later</span><button className="primary-action" disabled={disabled} onClick={onNext}>{label}</button></div>;
}

function ChoiceGrid({ items, selected, onToggle, single = false }: { items: string[]; selected: string[]; onToggle: (item: string) => void; single?: boolean }) {
  return <div className={`choice-grid ${single ? "single" : ""}`}>{items.map((item) => <button key={item} className={selected.includes(item) ? "selected" : ""} onClick={() => onToggle(item)}><i>{selected.includes(item) ? "✓" : "+"}</i><span>{item}</span></button>)}</div>;
}

function SetupGuide({ title, children, tone = "blue" }: { title: string; children: ReactNode; tone?: "blue" | "green" | "gold" }) {
  return <aside className={`setup-guide ${tone}`} aria-label={title}>
    <span className="setup-guide-icon">i</span>
    <div><strong>{title}</strong><p>{children}</p></div>
  </aside>;
}

function FieldHelp({ id, label, help, open, onToggle }: { id: string; label: string; help: string; open: boolean; onToggle: (id: string) => void }) {
  return <div className="field-help-wrap">
    <button type="button" className="field-help-button" aria-expanded={open} aria-controls={`help-${id}`} onClick={() => onToggle(id)}>
      <span>i</span>{label}
    </button>
    {open && <div className="field-help-popover" id={`help-${id}`} role="note">{help}</div>}
  </div>;
}

export default function Home() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [view, setView] = useState<"discover" | "how-it-works" | "business" | "booking" | "dashboard" | "setup" | "info">("discover");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessRole, setBusinessRole] = useState<"owner" | "manager" | "staff" | "booth_renter" | null>(null);
  const [infoPage, setInfoPage] = useState<"support" | "contact" | "privacy" | "terms">("support");
  const [template, setTemplate] = useState<"braider" | "barber" | "wig">("braider");
  const [specialties, setSpecialties] = useState<string[]>(["braider"]);
  const [addons, setAddons] = useState<string[]>(["Consultations", "Deposits", "Photo portfolio"]);
  const [setupStep, setSetupStep] = useState(1);
  const [setupPath, setSetupPath] = useState<"pro" | null>(null);
  const [accountReady, setAccountReady] = useState(false);
  const [servicePlace, setServicePlace] = useState<string[]>(["At my shop or studio"]);
  const [teamSize, setTeamSize] = useState("Just me");
  const [selectedService, setSelectedService] = useState<Service>({
    name: "Knotless braids – medium",
    description: "Hair included. Professional hair service.",
    duration: "4 hr",
    deposit: "$50 deposit",
    image: services[0].image,
    category: "Braiders",
    price: 180,
  });
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [toast, setToast] = useState("");
  const [bookingsOpen, setBookingsOpen] = useState(true);
  const [blocked, setBlocked] = useState<string[]>(["12:00 PM"]);
  const [starterServices, setStarterServices] = useState([
    "Knotless braids · 4 hr 30 min",
    "Box braids · 5 hr",
    "Cornrows · 2 hr 30 min",
    "Starter loc consultation · 30 min",
    "Retwist & style · 2 hr 15 min",
  ]);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [newService, setNewService] = useState("");
  const [catalogCategory, setCatalogCategory] = useState<CatalogService["category"]>("Braiders");
  const [catalogServiceName, setCatalogServiceName] = useState("Knotless braids – medium");
  const [catalogDuration, setCatalogDuration] = useState("4 hr");
  const [catalogPrice, setCatalogPrice] = useState(180);
  const [catalogCustomPrice, setCatalogCustomPrice] = useState(false);
  const [catalogDeposit, setCatalogDeposit] = useState(50);
  const [openDays, setOpenDays] = useState([true, true, true, true, true, true, false]);
  const [businessHours, setBusinessHours] = useState([
    ["9:00 AM","7:00 PM"],["9:00 AM","7:00 PM"],["9:00 AM","7:00 PM"],
    ["9:00 AM","7:00 PM"],["9:00 AM","7:00 PM"],["9:00 AM","5:00 PM"],["9:00 AM","5:00 PM"],
  ]);
  const [help, setHelp] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#4464e7");
  const [dashTab, setDashTab] = useState<"Overview" | "Appointments" | "Services" | "Clients" | "Automations" | "Money" | "Marketing" | "Profile" | "Booking channels">("Overview");
  const [appointmentView, setAppointmentView] = useState<"list" | "calendar">("calendar");
  const [calendarMode, setCalendarMode] = useState<"day" | "week" | "month">("week");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [appointmentDraft, setAppointmentDraft] = useState({ client: "", service: "Knotless braids – medium", duration: "4 hr", date: "2026-07-28", time: "9:00 AM" });
  const [appointmentFilter, setAppointmentFilter] = useState<"All" | "Confirmed" | "Requests" | "Completed">("All");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [requestStates, setRequestStates] = useState(["Pending", "Pending", "Pending"]);
  const [clientQuery, setClientQuery] = useState("");
  const [campaignReady, setCampaignReady] = useState(false);
  const [embedStyle, setEmbedStyle] = useState<"button" | "popup" | "inline">("popup");
  const [pageMode, setPageMode] = useState<"template" | "sections">("template");
  const [pageTemplate, setPageTemplate] = useState("The Editorial");
  const [profileSections, setProfileSections] = useState(["Hero", "Services", "Portfolio", "About", "Reviews", "Location & hours"]);
  const [profileEditor, setProfileEditor] = useState<"Content" | "Templates" | "Design" | "Settings">("Content");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [profileLogo, setProfileLogo] = useState("");
  const [profileBanner, setProfileBanner] = useState(services[1].image);
  const [profileName, setProfileName] = useState("Your Business");
  const [profileTagline, setProfileTagline] = useState("Exceptional service, designed around you.");
  const [profileSlug, setProfileSlug] = useState("your-business");
  const [profileBackground, setProfileBackground] = useState<"light" | "warm" | "dark">("light");
  const [profilePublished, setProfilePublished] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [previewSection, setPreviewSection] = useState("Hero");
  const [savedAppointments, setSavedAppointments] = useState<SavedAppointment[]>([]);
  const [productionClients, setProductionClients] = useState<ClientRecord[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientNoteDraft, setClientNoteDraft] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [paymentConnected, setPaymentConnected] = useState(false);
  const [paymentRule, setPaymentRule] = useState("fixed_deposit");
  const [depositAmount, setDepositAmount] = useState(3000);
  const [cancellationHours, setCancellationHours] = useState(24);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [paymentPanel, setPaymentPanel] = useState<"overview" | "setup" | "rules" | "payouts">("overview");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [cardName, setCardName] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [serviceQuery, setServiceQuery] = useState("");
  const [showAllServices, setShowAllServices] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [workSlide, setWorkSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState("Coral");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonServiceName, setAddonServiceName] = useState("Knotless braids – medium");
  const [ownerAddonCatalog, setOwnerAddonCatalog] = useState<ServiceAddon[]>(defaultOwnerAddonCatalog);
  const [customPriceService, setCustomPriceService] = useState<number | null>(null);
  const [customAddonService, setCustomAddonService] = useState<string | null>(null);
  const [customAddonDraft, setCustomAddonDraft] = useState({ name: "", price: "", minutes: "0", note: "" });
  const [serviceAddons, setServiceAddons] = useState<Record<string, string[]>>({
    "Knotless braids – medium": ["Hair included", "Extra length", "Extra-small parts", "Beads & accessories", "Shampoo & blow-dry", "Deep conditioning", "Detangling"],
    "Box braids – medium": ["Hair included", "Extra length", "Extra-small parts", "Beads & accessories", "Shampoo & blow-dry", "Detangling"],
    "Cornrows – 6+ / design": ["Hair included", "Beads & accessories", "Shampoo & blow-dry", "Scalp treatment"],
  });
  const [clientDetails, setClientDetails] = useState({ firstName: "", lastName: "", phone: "", email: "", notes: "", hairLength: "", allergies: "" });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingManageToken, setBookingManageToken] = useState("");
  const [schedulingSettings, setSchedulingSettings] = useState({
    googleCalendar: false, outlookCalendar: false, preventConflicts: true,
    emailConfirmation: true, smsConfirmation: true, reminder24h: true, reminder2h: true,
    clientReschedule: true, clientCancel: true, minimumNoticeHours: 24, bookingWindowDays: 90,
  });
  const hourOptions = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM"];
  const selectedCatalogItem = serviceCatalog.find(item => item.name === catalogServiceName && item.category === catalogCategory) || serviceCatalog[0];
  const bookingCatalog = serviceCatalog.filter(item => item.category === "Braiders");
  const selectCatalogItem = (name: string, category = catalogCategory) => {
    const item = serviceCatalog.find(entry => entry.name === name && entry.category === category);
    if (!item) return;
    setCatalogServiceName(item.name);
    setCatalogDuration(durationOptionsFor(item)[0]);
    setCatalogPrice(item.minPrice);
    setCatalogCustomPrice(false);
    setCatalogDeposit(item.deposit);
  };
  const serviceFromCatalog = (item: CatalogService): Service => ({
    name: item.name,
    description: `${item.hair === "Included" ? "Hair included. " : item.hair === "Optional" ? "Hair can be included. " : ""}${item.note || "Professional hair service."}`,
    duration: formatHours(item.minHours),
    deposit: item.deposit ? `$${item.deposit} deposit` : "No deposit",
    image: services[Math.abs(item.name.length) % services.length].image,
    consultation: item.name.toLowerCase().includes("consultation"),
    category: item.category,
    price: item.minPrice,
  });
  const calendarTitle = calendarOffset === 0 ? "July 28 – August 3" : calendarOffset < 0 ? "July 21 – July 27" : "August 4 – August 10";
  const calendarDays = calendarOffset === 0
    ? ["Mon 28","Tue 29","Wed 30","Thu 31","Fri 01","Sat 02","Sun 03"]
    : calendarOffset < 0
      ? ["Mon 21","Tue 22","Wed 23","Thu 24","Fri 25","Sat 26","Sun 27"]
      : ["Mon 04","Tue 05","Wed 06","Thu 07","Fri 08","Sat 09","Sun 10"];

  const isTeam = teamSize !== "Just me";
  const enabledAddons = serviceAddons[selectedService.name] || [];
  const selectedDateRecord = dates[selectedDate];
  const slotStatus = (time: string) => {
    const saved = savedAppointments.some(appointment =>
      appointment.appointment_date === selectedDateRecord.iso && appointment.start_time === time
    );
    const dateBlocks: Record<string, string[]> = {
      "2026-07-29": ["12:00 PM", "4:00 PM"],
      "2026-07-30": ["9:00 AM", "12:00 PM", "5:30 PM"],
      "2026-07-31": ["10:30 AM", "2:30 PM"],
      "2026-08-01": ["12:00 PM", "2:30 PM", "5:30 PM"],
      "2026-08-04": ["9:00 AM", "4:00 PM"],
      "2026-08-05": ["10:30 AM", "12:00 PM"],
      "2026-08-06": ["2:30 PM", "5:30 PM"],
      "2026-08-07": ["9:00 AM", "12:00 PM", "4:00 PM"],
      "2026-08-08": ["10:30 AM", "2:30 PM"],
    };
    const manuallyBlocked = blocked.includes(time) || (dateBlocks[selectedDateRecord.iso] || []).includes(time);
    if (saved) return "booked";
    if (manuallyBlocked && !(isTeam && selectedStaff === "First available")) return "unavailable";
    return "open";
  };
  const availableTimes = useMemo(
    () => times.filter((time) => slotStatus(time) === "open"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocked, savedAppointments, selectedDate, selectedStaff, isTeam],
  );

  const filteredServices = useMemo(() => services.filter(service =>
    `${service.name} ${service.description}`.toLowerCase().includes(serviceQuery.toLowerCase())
  ), [serviceQuery]);
  const selectedClient = productionClients.find(client => client.id === selectedClientId) || productionClients[0] || null;
  const selectedAppointmentRecord = savedAppointments.find(appointment => appointment.client_name === selectedAppointment) || null;
  const selectedClientHistory = selectedClient ? savedAppointments.filter(appointment => appointment.client_id === selectedClient.id) : [];

  const addonTotal = selectedAddons.reduce((sum, addon) => sum + (ownerAddonCatalog.find(item => item.name === addon)?.price || 0), 0);
  const addonMinutes = selectedAddons.reduce((sum, addon) => sum + (ownerAddonCatalog.find(item => item.name === addon)?.minutes || 0), 0);

  useEffect(() => {
    const onScroll = () => document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!businessId || !authUser) return;
    let active = true;
    const loadProductionRecords = async () => {
      const [appointmentResult, clientResult] = await Promise.all([
        supabase
          .from("appointments")
          .select("id, client_id, starts_at, ends_at, status, client_notes, clients(name), services(name)")
          .eq("business_id", businessId)
          .order("starts_at", { ascending: true }),
        supabase
          .from("clients")
          .select("id, name, email, phone, notes, visit_count, last_visit_at, client_photos(id, storage_path, purpose)")
          .eq("business_id", businessId)
          .order("updated_at", { ascending: false }),
      ]);
      if (!active) return;
      if (appointmentResult.error) flash("Appointments could not be loaded.");
      else {
        const rows = (appointmentResult.data || []) as unknown as Array<{
          id: string;
          client_id: string;
          starts_at: string;
          ends_at: string;
          status: string;
          client_notes: string;
          clients: { name: string } | null;
          services: { name: string } | null;
        }>;
        setSavedAppointments(rows.map(row => ({
          id: row.id,
          client_id: row.client_id,
          client_name: row.clients?.name || "Client",
          service_name: row.services?.name || "Service",
          appointment_date: new Date(row.starts_at).toLocaleDateString(),
          start_time: new Date(row.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          status: row.status,
          starts_at: row.starts_at,
          ends_at: row.ends_at,
          client_notes: row.client_notes,
        })));
      }
      if (clientResult.error) flash("Client records could not be loaded.");
      else {
        const clients = (clientResult.data || []) as unknown as ClientRecord[];
        setProductionClients(clients);
        setSelectedClientId(current => current || clients[0]?.id || null);
        if (clients[0]) setClientNoteDraft(clients[0].notes || "");
      }
      setDataReady(true);
    };
    void loadProductionRecords();
    return () => { active = false; };
  }, [authUser, businessId, supabase]);

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setAuthUser(user);
      if (user) {
        const { data: memberships } = await supabase
          .from("business_members")
          .select("business_id, role, businesses(name, slug, settings, published)")
          .eq("user_id", user.id)
          .eq("active", true)
          .limit(1);
        const membership = memberships?.[0] as {
          business_id: string;
          role: "owner" | "manager" | "staff" | "booth_renter";
          businesses: { name: string; slug: string; settings: Record<string, unknown>; published: boolean } | null;
        } | undefined;
        if (membership) {
          setBusinessId(membership.business_id);
          setBusinessRole(membership.role);
          if (membership.businesses) {
            setProfileName(membership.businesses.name);
            setProfileSlug(membership.businesses.slug);
            setProfilePublished(membership.businesses.published);
            const settings = membership.businesses.settings || {};
            if (typeof settings.tagline === "string") setProfileTagline(settings.tagline);
            if (typeof settings.brandColor === "string") setThemeColor(settings.brandColor);
          }
        }
        if (new URLSearchParams(window.location.search).get("studio") === "1") {
          if (membership) setView("dashboard");
          else {
            setAccountReady(true);
            setSetupPath("pro");
            setSetupStep(1);
            setView("setup");
          }
        }
      } else if (new URLSearchParams(window.location.search).get("studio") === "1") {
        window.location.replace("/auth");
        return;
      }
      setAuthChecked(true);
    };
    void loadAccount();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthUser(session?.user || null);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!authChecked || authUser || (view !== "dashboard" && view !== "setup")) return;
    window.location.assign("/auth");
  }, [authChecked, authUser, view]);

  useEffect(() => {
    if (!availableTimes.includes(selectedTime)) setSelectedTime(availableTimes[0] || "");
  }, [availableTimes, selectedTime]);

  useEffect(() => {
    setSelectedAddons(current => current.filter(addon => enabledAddons.includes(addon)));
  }, [selectedService.name]); // owner choices control what remains visible for each service

  useEffect(() => {
    fetch("/api/bookkit")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        setSavedAppointments(data.appointments || []);
        setPaymentTransactions(data.transactions || []);
        if (data.paymentAccount) {
          setPaymentConnected(data.paymentAccount.onboarding_status === "test_ready" || Boolean(data.paymentAccount.payouts_enabled));
          setPaymentRule(data.paymentAccount.default_payment_rule || "fixed_deposit");
          setDepositAmount(Number(data.paymentAccount.default_deposit_amount || 3000));
          setCancellationHours(Number(data.paymentAccount.cancellation_window_hours || 24));
        }
        if (data.profile) {
          setProfileName(data.profile.business_name);
          setProfileTagline(data.profile.tagline);
          setProfileSlug(data.profile.slug);
          setPageTemplate(["The Editorial","The Luxe","The Studio","The Social"].includes(data.profile.template) ? data.profile.template : "The Editorial");
          setThemeColor(data.profile.brand_color);
          setProfileBackground(data.profile.background);
          setProfileSections(JSON.parse(data.profile.sections_json || "[]"));
          setProfilePublished(Boolean(data.profile.published));
        }
        if (data.schedulingSettings) {
          const s = data.schedulingSettings;
          setSchedulingSettings({
            googleCalendar: Boolean(s.google_calendar), outlookCalendar: Boolean(s.outlook_calendar),
            preventConflicts: Boolean(s.prevent_conflicts), emailConfirmation: Boolean(s.email_confirmation),
            smsConfirmation: Boolean(s.sms_confirmation), reminder24h: Boolean(s.reminder_24h),
            reminder2h: Boolean(s.reminder_2h), clientReschedule: Boolean(s.client_reschedule),
            clientCancel: Boolean(s.client_cancel), minimumNoticeHours: Number(s.minimum_notice_hours || 24),
            bookingWindowDays: Number(s.booking_window_days || 90),
          });
        }
      })
      .catch(() => flash("BookKit opened in preview mode."))
      .finally(() => setDataReady(true));
  }, []);

  function toggleList(value: string, current: string[], setCurrent: (next: string[]) => void) {
    setCurrent(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  }

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function ensureBusiness() {
    if (!authUser) {
      window.location.assign("/auth");
      return null;
    }
    if (businessId) return businessId;
    const baseSlug = (profileName || "your-business").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "your-business";
    const slug = `${baseSlug}-${authUser.id.slice(0, 6)}`;
    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        owner_user_id: authUser.id,
        name: profileName || "Your Business",
        slug,
        settings: { tagline: profileTagline, brandColor: themeColor },
      })
      .select("id")
      .single();
    if (error || !business) throw error || new Error("Business could not be created.");
    const { error: membershipError } = await supabase.from("business_members").insert({
      business_id: business.id,
      user_id: authUser.id,
      role: "owner",
      active: true,
    });
    if (membershipError) throw membershipError;
    setBusinessId(business.id);
    setBusinessRole("owner");
    setProfileSlug(slug);
    return business.id as string;
  }

  async function openBusinessStudio() {
    if (!authUser) {
      window.location.assign("/auth");
      return;
    }
    if (businessId) {
      setView("dashboard");
      return;
    }
    setAccountReady(true);
    setSetupPath("pro");
    setSetupStep(1);
    setView("setup");
  }

  async function finishBusinessSetup() {
    setSaving(true);
    try {
      await ensureBusiness();
      setView("dashboard");
      setDashTab("Booking channels");
      flash("Your private Business Studio is ready.");
    } catch {
      flash("BookKit could not create your business yet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthUser(null);
    setBusinessId(null);
    setBusinessRole(null);
    setView("discover");
  }

  async function saveProfile(publish: boolean) {
    setSaving(true);
    try {
      const response = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          profile: {
            businessName: profileName,
            tagline: profileTagline,
            slug: profileSlug,
            template: pageTemplate,
            brandColor: themeColor,
            background: profileBackground,
            sections: profileSections,
            published: publish,
          },
        }),
      });
      if (!response.ok) throw new Error();
      setProfilePublished(publish);
      setProfileDirty(false);
      flash(publish ? "Your web profile is published and saved." : "Draft saved permanently.");
    } catch {
      flash("BookKit could not save that change yet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function createAppointment() {
    setSaving(true);
    try {
      const activeBusinessId = await ensureBusiness();
      if (!activeBusinessId) return;
      const durationMatch = appointmentDraft.duration.match(/(?:(\d+)\s*hr)?\s*(?:(\d+)\s*min)?/i);
      const durationMinutes = Math.max(5, Number(durationMatch?.[1] || 0) * 60 + Number(durationMatch?.[2] || 0));
      const start = new Date(`${appointmentDraft.date} ${appointmentDraft.time}`);
      const service = serviceCatalog.find(item => item.name === appointmentDraft.service);
      const { error } = await supabase.rpc("create_studio_appointment", {
        p_business_id: activeBusinessId,
        p_client_name: appointmentDraft.client,
        p_client_email: "",
        p_client_phone: "",
        p_client_notes: "",
        p_service_name: appointmentDraft.service,
        p_starts_at: start.toISOString(),
        p_duration_minutes: durationMinutes,
        p_subtotal_cents: Math.round((service?.minPrice || 0) * 100),
      });
      if (error) throw error;
      const { data: appointments } = await supabase
        .from("appointments")
        .select("id, client_id, starts_at, ends_at, status, client_notes, clients(name), services(name)")
        .eq("business_id", activeBusinessId)
        .order("starts_at", { ascending: true });
      const rows = (appointments || []) as unknown as Array<{id:string;client_id:string;starts_at:string;ends_at:string;status:string;client_notes:string;clients:{name:string}|null;services:{name:string}|null}>;
      setSavedAppointments(rows.map(row => ({
        id: row.id, client_id: row.client_id, client_name: row.clients?.name || "Client",
        service_name: row.services?.name || "Service", appointment_date: new Date(row.starts_at).toLocaleDateString(),
        start_time: new Date(row.starts_at).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}),
        status: row.status, starts_at: row.starts_at, ends_at: row.ends_at, client_notes: row.client_notes,
      })));
      setNewAppointmentOpen(false);
      flash(`Appointment saved for ${appointmentDraft.client}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      flash(message.toLowerCase().includes("overlap") || message.toLowerCase().includes("conflict")
        ? "That time was just booked. Choose another opening."
        : "BookKit could not save that appointment yet.");
    } finally {
      setSaving(false);
    }
  }

  async function changeAppointmentStatus(appointmentId: string, status: "confirmed" | "completed" | "cancelled" | "no_show") {
    setSaving(true);
    try {
      const reason = status === "cancelled" ? window.prompt("Cancellation reason (optional)") || "" : "";
      const { error } = await supabase.rpc("update_studio_appointment_status", {
        p_appointment_id: appointmentId,
        p_status: status,
        p_reason: reason,
      });
      if (error) throw error;
      setSavedAppointments(current => current.map(item => item.id === appointmentId ? {...item, status} : item));
      flash(status === "no_show" ? "No-show recorded with a permanent event." : `Appointment marked ${status.replace("_", " ")}.`);
    } catch {
      flash("That appointment status could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function saveClientNote() {
    if (!businessId || !selectedClientId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("clients").update({ notes: clientNoteDraft, updated_at: new Date().toISOString() })
        .eq("business_id", businessId).eq("id", selectedClientId);
      if (error) throw error;
      setProductionClients(current => current.map(client => client.id === selectedClientId ? {...client, notes: clientNoteDraft} : client));
      flash("Private client note saved.");
    } catch {
      flash("The client note could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadClientPhoto(file?: File) {
    if (!file || !businessId || !selectedClientId || !authUser) return;
    setUploadingPhoto(true);
    try {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const storagePath = `${businessId}/${selectedClientId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("client-photos").upload(storagePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data, error } = await supabase.from("client_photos").insert({
        business_id: businessId, client_id: selectedClientId, storage_path: storagePath,
        purpose: "inspiration", uploaded_by: authUser.id,
      }).select("id, storage_path, purpose").single();
      if (error) {
        await supabase.storage.from("client-photos").remove([storagePath]);
        throw error;
      }
      setProductionClients(current => current.map(client => client.id === selectedClientId
        ? {...client, photos: [...(client.photos || []), data]} : client));
      flash("Private client photo uploaded.");
    } catch {
      flash("The photo could not be uploaded.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function savePaymentSettings(connect = false) {
    setSaving(true);
    try {
      const response = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "payment_account",
          settings: {
            onboardingStatus: connect ? "test_ready" : paymentConnected ? "test_ready" : "not_started",
            payoutsEnabled: false,
            paymentRule,
            depositAmount,
            cancellationHours,
          },
        }),
      });
      if (!response.ok) throw new Error();
      if (connect) setPaymentConnected(true);
      flash(connect ? "Stripe test account connected. Live payouts remain off." : "Payment rules saved.");
    } catch {
      flash("BookKit could not save the payment settings yet.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSchedulingSettings(next = schedulingSettings) {
    setSaving(true);
    try {
      const response = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "scheduling_settings", settings: next }),
      });
      if (!response.ok) throw new Error();
      setSchedulingSettings(next);
      flash("Scheduling essentials saved.");
    } catch {
      flash("BookKit could not save those settings yet.");
    } finally {
      setSaving(false);
    }
  }

  async function processTestCheckout() {
    if (bookingManageToken) {
      setCheckoutProcessing(true);
      try {
        const response = await fetch("/api/bookkit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type: "manage_appointment",
            action: "reschedule",
            manageToken: bookingManageToken,
            date: dates[selectedDate].iso,
            time: selectedTime,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setConfirmed(true);
        flash("Appointment rescheduled.");
      } catch (error) {
        flash(error instanceof Error ? error.message : "That appointment could not be rescheduled.");
      } finally {
        setCheckoutProcessing(false);
      }
      return;
    }
    if (!cardName.trim()) {
      flash("Enter the cardholder name to continue.");
      return;
    }
    setCheckoutProcessing(true);
    try {
      const amount = Number(selectedService.deposit.replace(/[^0-9]/g, "")) * 100;
      const response = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "test_payment",
          payment: {
            clientName: cardName,
            serviceName: selectedService.name,
            kind: "Deposit",
            amount,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      const appointmentResponse = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "appointment",
          appointment: {
            client: `${clientDetails.firstName} ${clientDetails.lastName}`.trim() || cardName,
            email: clientDetails.email,
            phone: clientDetails.phone,
            notes: [clientDetails.notes, clientDetails.hairLength && `Hair length: ${clientDetails.hairLength}`, clientDetails.allergies && `Allergies/sensitivities: ${clientDetails.allergies}`].filter(Boolean).join("\n"),
            service: `${selectedService.name}${selectedAddons.length ? ` + ${selectedAddons.join(", ")}` : ""}`,
            date: dates[selectedDate].iso,
            time: selectedTime,
          },
        }),
      });
      const appointmentData = await appointmentResponse.json();
      if (!appointmentResponse.ok) throw new Error(appointmentData.error || "Appointment conflict");
      setPaymentTransactions(current => [{
        id: data.id,
        client_name: cardName,
        service_name: selectedService.name,
        kind: "Deposit",
        status: "succeeded_test",
        amount,
        tip_amount: 0,
        provider_reference: data.reference,
        created_at: data.createdAt,
      }, ...current]);
      setSavedAppointments(current => [...current, {
        id: appointmentData.id,
        client_name: `${clientDetails.firstName} ${clientDetails.lastName}`.trim() || cardName,
        service_name: selectedService.name,
        appointment_date: dates[selectedDate].iso,
        start_time: selectedTime,
        status: "Confirmed",
      }]);
      setBookingReference(`BK-${appointmentData.id.slice(0, 6).toUpperCase()}`);
      setBookingManageToken(appointmentData.manageToken);
      setConfirmed(true);
    } catch {
      flash("The test payment could not be completed.");
    } finally {
      setCheckoutProcessing(false);
    }
  }

  function shareProfile() {
    const shareData = { title: "Coral African Hair Braiding", text: "View services and book Coral African Hair Braiding on BookKit.", url: window.location.href };
    if (navigator.share) void navigator.share(shareData);
    else void navigator.clipboard.writeText(window.location.href).then(() => flash("Profile link copied."));
  }

  function beginPayment() {
    if (!clientDetails.firstName || !clientDetails.phone || !clientDetails.email) {
      flash("Add your name, mobile number, and email.");
      return;
    }
    if (!policyAccepted) {
      flash("Please accept the booking and cancellation policy.");
      return;
    }
    setCardName(`${clientDetails.firstName} ${clientDetails.lastName}`.trim());
    setStep(4);
  }

  async function cancelBooking() {
    if (!bookingManageToken) return;
    setSaving(true);
    try {
      const response = await fetch("/api/bookkit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "manage_appointment", action: "cancel", manageToken: bookingManageToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSavedAppointments(current => current.map(item => item.id === bookingReference.replace("BK-", "").toLowerCase() ? { ...item, status: "Cancelled" } : item));
      flash("Appointment cancelled. The business can now apply its disclosed deposit policy.");
    } catch (error) {
      flash(error instanceof Error ? error.message : "This appointment could not be cancelled.");
    } finally {
      setSaving(false);
    }
  }

  function moveProfileSection(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= profileSections.length) return;
    const next = [...profileSections];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setProfileSections(next);
    setProfileDirty(true);
  }

  function loadProfileImage(file: File | undefined, target: "logo" | "banner") {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (target === "logo") setProfileLogo(url);
    else setProfileBanner(url);
    setProfileDirty(true);
  }

  function startBooking(service = services[0]) {
    setSelectedService(service);
    setSelectedTime(service.consultation ? "4:00 PM" : "10:30 AM");
    setStep(1);
    setConfirmed(false);
    setView("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openInfo(page: "support" | "contact" | "privacy" | "terms") {
    setInfoPage(page);
    setView("info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      {toast && <div className="toast">{toast}</div>}
      {view !== "setup" && view !== "dashboard" && <header className="topbar">
        <button className="brand" onClick={() => setView("discover")} aria-label="BookKit home">
          $1B$2ookKit$3
        </button>
        <nav className="desktop-nav" aria-label="Main navigation">
          <button className={view === "discover" ? "active" : ""} onClick={() => setView("discover")}>Product</button>
          <button onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
          <button onClick={() => setView("business")}>Sample booking page</button>
        </nav>
        <div className="header-actions">
          <button className="text-button" onClick={() => void openBusinessStudio()}>{authUser ? "Business Studio" : "Log in"}</button>
          <button className="dark-button" onClick={() => void openBusinessStudio()}>{authUser ? "Open Studio" : "Get started"}</button>
        </div>
      </header>}

      {view === "discover" && (
        <>
          <section className="hero premium-hero hair-pro-hero">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-orbit orbit-one">BOOK</div>
            <div className="hero-orbit orbit-two">CREATE</div>
            <div className="hero-copy">
              <span className="eyebrow">THE BUSINESS HOME FOR HAIR PROFESSIONALS</span>
              <h1>Your chair.<br />Everything handled.</h1>
              <p>BookKit gives locticians, barbers, braiders, and wig &amp; weave stylists one place to book clients, collect deposits, manage the day, and grow without the chaos.</p>
              <div className="hero-actions">
                <button className="hero-primary" onClick={() => setView("setup")}>Start with BookKit →</button>
                <button className="hero-secondary" onClick={() => setView("how-it-works")}>See how it works</button>
              </div>
              <div className="trust-row">
                <span>✓ Solo and shop mode</span>
                <span>✓ Hair-specific booking</span>
                <span>✓ Your clients stay yours</span>
              </div>
            </div>
            <div className="hero-hair-stage parallax-frame" aria-label="Braiding and wig installation professionals at work">
              <figure className="hair-shot braid-shot">
                <img src="/bookkit-$1" alt="Black braider with short natural hair finishing a client’s long jumbo braids" />
                <figcaption><span>01</span><strong>Braiding</strong></figcaption>
              </figure>
              <figure className="hair-shot wig-shot">
                <img src="/bookkit-$1" alt="Black wig stylist completing a long premium 613 blonde wig install" />
                <figcaption><span>02</span><strong>Wig install</strong></figcaption>
              </figure>
              <div className="hair-booking-float">
                <div className="booking-check">✓</div>
                <div><span>DEPOSIT PAID</span><strong>Knotless braids booked</strong><small>Tomorrow · 10:30 AM</small></div>
              </div>
            </div>
          </section>

          <section className="premium-marquee" aria-label="BookKit features">
            <div>SMART BOOKINGS · SERVICE ADD-ONS · DEPOSITS · CONSULTATIONS · CLIENT NOTES · AUTOMATIC REMINDERS · SOLO + SHOP MODE · SMART BOOKINGS · SERVICE ADD-ONS · DEPOSITS ·</div>
          </section>

          <section className="featured platform-section" id="platform">
            <div className="section-heading">
              <div><span className="eyebrow">EVERYTHING YOUR CHAIR NEEDS</span><h2>From the first click to the next appointment.</h2></div>
              <button onClick={() => setView("setup")}>Set up your business →</button>
            </div>
            <div className="platform-grid">
              <article><span>01</span><h3>Bookings that understand hair</h3><p>Services, length, size, add-ons, consultations, deposits, preparation, and timing work together before the client chooses an opening.</p></article>
              <article><span>02</span><h3>A booking link that looks like you</h3><p>Share a clean booking link immediately. Add a branded landing page, portfolio, colors, policies, and social links only when you want them.</p></article>
              <article><span>03</span><h3>Fewer no-shows. Less chasing.</h3><p>Collect deposits, send confirmations and reminders, protect cancellation windows, and let clients reschedule within your rules.</p></article>
              <article><span>04</span><h3>One chair or the whole shop</h3><p>Run a solo calendar or group independent professionals under one shop, with each stylist controlling their own services and schedule.</p></article>
              <article><span>05</span><h3>Use your BookKit page—or your own website</h3><p>Share one polished booking link or place the complete experience inside a website you already own.</p></article>
              <article><span>06</span><h3>Your clients stay yours</h3><p>Bring clients from social media, Google, referrals, text messages, or email. BookKit organizes the relationship without new-client commissions.</p></article>
              <article className="channel-story"><span>07</span><h3>Book from anywhere</h3><p>Share your BookKit link, add a QR code, or embed booking into an existing website. Every channel feeds one calendar.</p><div className="channel-pills"><b>Booking link</b><b>QR code</b><b>Website embed</b></div></article>
            </div>
          </section>
          <section className="premium-break">
            <div className="break-copy">
              <span className="eyebrow">MADE FOR THE WAY HAIR PROFESSIONALS WORK</span>
              <h2>Take the booking. Keep the craft.</h2>
              <p>Your client gets a polished experience. You get the deposit, the right appointment length, the prep details, and a calendar you can trust.</p>
              <button onClick={() => setView("setup")}>Create your booking link →</button>
            </div>
            <div className="floating-proof">
              <strong>4.9</strong><span>average client rating</span><i />
              <strong>24/7</strong><span>online booking</span>
            </div>
          </section>

          <section className="parallax-story">
            <div className="parallax-shade" />
            <div className="parallax-copy">
              <span className="eyebrow">YOUR WORK BRINGS THEM IN. BOOKKIT GETS THEM BOOKED.</span>
              <h2>One link.<br />No back-and-forth.</h2>
              <p>Put your link on Instagram, TikTok, Google, text, or your existing website. Clients choose the right service, add-ons, and an open time without messaging you first.</p>
              <button onClick={() => setView("setup")}>Get your booking link <span>↗</span></button>
            </div>
            <div className="floating-proof proof-one"><b>24/7</b><span>clients can book</span></div>
            <div className="floating-proof proof-two"><b>1 link</b><span>your complete business page</span></div>
          </section>

          <section className="experience-section">
            <div className="experience-intro">
              <span className="eyebrow">THE HOME BASE FOR YOUR BUSINESS</span>
              <h2>Built for the chair, the booth,<br /><em>and the whole shop.</em></h2>
            </div>
            <div className="experience-grid">
              <article><span>01</span><h3>Set up how you really work</h3><p>Choose your specialty, services, timing, deposits, add-ons, availability, and appointment rules.</p></article>
              <article><span>02</span><h3>Bring your own clients</h3><p>BookKit is not a marketplace. Your clients book through your private link and the relationship stays yours.</p></article>
              <article><span>03</span><h3>Run everything in one place</h3><p>Appointments, payments, client history, reminders, rebooking, staff, and your optional landing page stay connected.</p></article>
            </div>
          </section>
        </>
      )}

      {view === "info" && <section className="info-page">
        <div className="info-hero">
          <button className="info-back" onClick={() => setView("discover")}>← Back to BookKit</button>
          <span>BOOKKIT {infoPage.toUpperCase()}</span>
          <h1>{infoPage === "support" ? "How can we help?" : infoPage === "contact" ? "Talk to BookKit." : infoPage === "privacy" ? "Your privacy matters." : "Clear terms. No surprises."}</h1>
          <p>{infoPage === "support" ? "Answers and guidance for setting up your booking link, accepting appointments, and running your business." : infoPage === "contact" ? "Questions, account help, or feedback—send the BookKit team a message." : infoPage === "privacy" ? "This notice explains what information BookKit uses and how it is protected." : "These terms explain the rules for using BookKit’s booking and business tools."}</p>
        </div>

        {infoPage === "support" && <div className="info-content support-grid">
          <article><span>01</span><h2>Getting started</h2><p>Create your account, add services and availability, then copy your booking link. The optional mini-website can be added later.</p></article>
          <article><span>02</span><h2>Bookings</h2><p>Clients choose a service, available date and time, complete your intake questions, accept policies, and confirm payment.</p></article>
          <article><span>03</span><h2>Payments</h2><p>Connect Stripe from Business Studio → Payments. Choose deposits, full payment, card hold, or pay later for each service.</p></article>
          <article><span>04</span><h2>Need a person?</h2><p>Contact BookKit for account, payment, or setup support and include the email used for your business account.</p><button onClick={() => openInfo("contact")}>Contact support →</button></article>
        </div>}

        {infoPage === "contact" && <div className="info-content contact-layout">
          <div><span>CONTACT SUPPORT</span><h2>Send us a message.</h2><p>Support messages are answered in the order received. Never include card numbers, passwords, or banking details.</p><div className="contact-points"><strong>Account &amp; setup</strong><span>Booking links, services, availability, teams, and mini-sites</span><strong>Payments</strong><span>Connection status, deposits, refunds, and payout questions</span></div></div>
          <form onSubmit={(event) => { event.preventDefault(); flash("Your support request has been received."); }}>
            <label>Name<input required name="name" autoComplete="name" /></label>
            <label>Email<input required type="email" name="email" autoComplete="email" /></label>
            <label>What do you need help with?<select name="topic"><option>Account setup</option><option>Bookings</option><option>Payments</option><option>Billing</option><option>Technical problem</option><option>Other</option></select></label>
            <label>Message<textarea required name="message" rows={6} /></label>
            <button type="submit">Send message →</button>
          </form>
        </div>}

        {infoPage === "privacy" && <div className="info-content policy-copy">
          <p className="policy-date">Effective July 29, 2026</p>
          <h2>Information BookKit collects</h2><p>BookKit may collect business account details, service and availability settings, client contact information, appointment details, device information, and records needed to operate and secure the service.</p>
          <h2>How information is used</h2><p>Information is used to provide booking pages, prevent scheduling conflicts, send confirmations and reminders, process support requests, improve BookKit, and protect users from fraud or misuse.</p>
          <h2>Payments</h2><p>Payment and bank-account verification is handled by the connected payment provider. BookKit does not store complete card numbers or online-banking credentials.</p>
          <h2>Sharing and retention</h2><p>Information is shared only with service providers needed to operate BookKit, when a business or client directs us to share it, or when required by law. Records are retained only as long as reasonably necessary for the service, safety, accounting, and legal obligations.</p>
          <h2>Your choices</h2><p>You may request access, correction, export, or deletion of eligible account information by contacting BookKit support. Some records may need to be retained for legal or transaction requirements.</p>
          <aside>This is BookKit’s current product-stage privacy notice and should be reviewed by qualified counsel before broad commercial launch.</aside>
        </div>}

        {infoPage === "terms" && <div className="info-content policy-copy">
          <p className="policy-date">Effective July 29, 2026</p>
          <h2>Using BookKit</h2><p>You must provide accurate information, keep your account secure, use BookKit lawfully, and have authority to manage the business, services, staff, and booking policies connected to your account.</p>
          <h2>Business responsibility</h2><p>Each business controls its services, prices, deposits, availability, cancellation rules, client relationships, and fulfillment. BookKit provides software and is not the provider of the booked hair or grooming service.</p>
          <h2>Bookings, payments, and refunds</h2><p>Businesses are responsible for clearly disclosing booking and refund rules. Payment processing may be provided by a third party and is also subject to that provider’s terms. BookKit may charge disclosed platform or subscription fees.</p>
          <h2>Acceptable use</h2><p>Users may not misuse client data, interfere with the service, impersonate others, publish unlawful content, evade fees, or use BookKit for deceptive or fraudulent activity.</p>
          <h2>Availability and changes</h2><p>BookKit may update features and these terms as the product develops. Material changes will be communicated through the service or the account email when required.</p>
          <aside>These product-stage terms should be reviewed by qualified counsel before broad commercial launch.</aside>
        </div>}
      </section>}

      {view === "how-it-works" && (
        <section className="how-page">
          <div className="how-hero">
            <span className="eyebrow">HOW BOOKKIT WORKS</span>
            <h1>From social post<br/>to paid appointment.</h1>
            <p>BookKit turns the clients you already have into organized, deposit-protected appointments—without DMs, back-and-forth, or a marketplace taking over the relationship.</p>
            <button onClick={() => setView("setup")}>Create your booking link →</button>
          </div>
          <div className="how-steps">
            <article><span>01</span><div><small>SET UP</small><h2>Add the way you work.</h2><p>Choose services, prices, durations, deposits, add-ons, preparation questions, policies, and availability. Solo professionals skip team controls; shops can add independent professionals.</p></div></article>
            <article><span>02</span><div><small>SHARE</small><h2>Put one link everywhere.</h2><p>Add your BookKit link to Instagram, TikTok, Google, text messages, QR codes, or your existing website. A branded mini-site is optional.</p></div></article>
            <article><span>03</span><div><small>BOOK</small><h2>Clients choose the right appointment.</h2><p>They select a service, owner-approved add-ons, an open date and time, complete intake questions, accept policies, and pay the required deposit.</p></div></article>
            <article><span>04</span><div><small>RUN</small><h2>BookKit handles the follow-through.</h2><p>Confirmations, reminders, rescheduling rules, client records, payments, rebooking, and the day’s calendar stay together in Business Studio.</p></div></article>
          </div>
          <div className="how-conversion">
            <span>READY WHEN YOU ARE</span><h2>Your clients are already finding you.<br/>Give them a better way to book.</h2>
            <button onClick={() => setView("setup")}>Start setting up BookKit →</button>
            <small>No marketplace. Your clients stay yours.</small>
          </div>
        </section>
      )}

      {view === "setup" && (
        <section className="onboarding">
          <aside className="onboard-brand">
            <button className="brand light" onClick={() => setView("discover")}>$1B$2ookKit$3</button>
            <div>
              <span className="eyebrow">WELCOME TO BOOKKIT</span>
              <h2>{!accountReady ? "Your business, organized." : "Let’s get you bookable."}</h2>
              <p>{!accountReady ? "Create one account for your calendar, clients, payments, and booking link." : "Add your services, availability, and booking rules. Your shareable booking link will be ready when you finish."}</p>
            </div>
            <small>SHARE YOUR LINK · RUN YOUR BUSINESS</small>
          </aside>

          <div className="onboard-main">
            <div className="onboard-top">
              {(accountReady || setupPath || setupStep > 1) && <button onClick={() => {
                if (setupStep > 1) setSetupStep(setupStep - 1);
                else if (setupPath) { setSetupPath(null); setAccountReady(false); }
                else { setAccountReady(false); }
              }}>← Back</button>}
              <span>{!accountReady ? "Create your business account" : `Business setup · ${setupStep} of 8`}</span>
            </div>
            {setupPath && <div className="onboard-progress"><i style={{ width: `${setupStep / 8 * 100}%` }} /></div>}

            {!accountReady && <div className="onboard-card auth-screen">
              <span className="step-kicker">WELCOME TO BOOKKIT</span>
              <h1>Create your business account.</h1>
              <p>Set your services and availability, then start sharing one simple booking link.</p>
              <SetupGuide title="Secure BookKit account">Create or sign in to your real account before adding private business, client, appointment, or payment information.</SetupGuide>
              <div className="auth-box">
                <button className="email-button" onClick={() => window.location.assign("/auth")}>
                  <span>✉</span><strong>Create account or sign in</strong>
                </button>
              </div>
              <small className="demo-note">Authentication, email confirmation, and password recovery are connected to BookKit Production.</small>
            </div>}

            {setupPath === "pro" && <div className="onboard-card business-wizard">
              {setupStep === 1 && <WizardScreen kicker="BUILD YOUR STARTING MENU" title="What do you do?" copy="Choose one or combine several. BookKit will create a basic template you can add to and change anytime.">
                <SetupGuide title="Choose everything your business offers">Selecting more than one combines the starter services into one business page. You are not creating separate accounts.</SetupGuide>
                <FieldHelp id="specialty-pack" label="What choosing a specialty changes" help="Each choice adds a starter group of common services and setup suggestions. It does not lock your business into that category, and every item can be changed or removed." open={help === "specialty-pack"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <div className="specialty-choices">{[
                  ["wig","◇","Wigs & Weave","Installs, sew-ins, closures, frontals and wig customization"],
                  ["barber","✂","Barber","Cuts, fades, lineups, beard care and enhancements"],
                  ["loctician","◉","Loctician","Starter locs, maintenance, retwists, repairs and styling"],
                  ["braider","✦","Braider","Braids, twists, cornrows, kids styles and add-ons"],
                ].map(([id,icon,title,copy]) => <button key={id} className={specialties.includes(id) ? "selected" : ""} onClick={() => { toggleList(id, specialties, setSpecialties); setTemplate(id as typeof template); }}><i>{specialties.includes(id) ? "✓" : icon}</i><span><strong>{title}</strong><small>{copy}</small></span></button>)}</div>
              </WizardScreen>}
              {setupStep === 2 && <WizardScreen kicker="WHERE CLIENTS SEE YOU" title="Where do you provide services?" copy="Select every option that applies. You can set separate rules for each.">
                <SetupGuide title="Your exact address stays in your control">A shop address can appear on your page. For mobile service, clients see the travel area and any travel fee you choose.</SetupGuide>
                <FieldHelp id="service-location" label="Shop and mobile options explained" help="Choose your shop or studio when clients come to you. Choose the client’s location when you travel to them. You can choose both and later set separate prices, travel zones, and availability." open={help === "service-location"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <ChoiceGrid items={["At my shop or studio", "At the client’s location"]} selected={servicePlace} onToggle={(x) => toggleList(x, servicePlace, setServicePlace)} />
              </WizardScreen>}
              {setupStep === 3 && <WizardScreen kicker="BUSINESS DETAILS" title="Tell clients who they’re booking." copy="These details appear in your booking flow and confirmations.">
                <SetupGuide title="This identifies your booking link">Use the business name clients know. You can decide later whether to add a full landing page.</SetupGuide>
                <FieldHelp id="public-details" label="What will clients see?" help="Your business name, booking contact information, and service location can appear during booking and in confirmations. Your personal account email and private account details remain hidden." open={help === "public-details"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <div className="field-grid"><label className="full">Business name<input value={profileName === "Your Business" ? "" : profileName} onChange={(e)=>setProfileName(e.target.value)} placeholder="Enter your business name" /></label><label>Business phone<input placeholder="Business phone number" /></label><label>Public email<input placeholder="Business email address" /></label><label className="full">Business address<input placeholder="Street, city, state, ZIP" /></label></div>
              </WizardScreen>}
              {setupStep === 4 && <WizardScreen kicker="STARTING SERVICE MENU" title="Make the menu yours." copy="BookKit gives you a useful starting point. Edit, remove, reorder, or add anything your business actually offers.">
                <div className="setup-tip"><button onClick={() => setHelp(help === "services" ? null : "services")}>i</button><span><strong>Nothing here is permanent.</strong> Tap any service to change its name, time, price, deposit, or consultation rule.</span></div>
                <div className="catalog-service-builder">
                  <div className="catalog-builder-head"><div><span>BUFFALO SERVICE CATALOG</span><h3>Add a ready-made service</h3></div><b>{serviceCatalog.length} services</b></div>
                  <div className="catalog-fields">
                    <label>Category<select value={catalogCategory} onChange={(event) => {
                      const category = event.target.value as CatalogService["category"];
                      const first = serviceCatalog.find(item => item.category === category);
                      setCatalogCategory(category);
                      if (first) selectCatalogItem(first.name, category);
                    }}>{(["Braiders","Weave/Wigs","Barbers","Locticians","Add-On / Universal"] as const).map(category => <option key={category}>{category}</option>)}</select></label>
                    <label className="wide">Service<select value={catalogServiceName} onChange={(event) => selectCatalogItem(event.target.value)}>{serviceCatalog.filter(item => item.category === catalogCategory).map(item => <option key={item.name}>{item.name}</option>)}</select></label>
                    <label>Duration<select value={catalogDuration} onChange={(event) => setCatalogDuration(event.target.value)}>{durationOptionsFor(selectedCatalogItem).map(duration => <option key={duration}>{duration}</option>)}</select></label>
                    <label>Price<select value={catalogCustomPrice ? "custom" : String(catalogPrice)} onChange={(event) => {
                      if (event.target.value === "custom") setCatalogCustomPrice(true);
                      else { setCatalogCustomPrice(false); setCatalogPrice(Number(event.target.value)); }
                    }}>{Array.from(new Set([selectedCatalogItem.minPrice, selectedCatalogItem.maxPrice, catalogPrice])).sort((a,b)=>a-b).map(price => <option key={price} value={price}>{price ? `$${price}` : "Free"}</option>)}<option value="custom">Custom price…</option></select>
                    {catalogCustomPrice && <input className="custom-price-input" aria-label="Enter any service price" type="number" min="0" step="0.01" inputMode="decimal" value={catalogPrice} onChange={(event)=>setCatalogPrice(Math.max(0,Number(event.target.value)))} placeholder="Enter any amount" />}</label>
                    <label>Deposit<select value={catalogDeposit} onChange={(event) => setCatalogDeposit(Number(event.target.value))}>{Array.from(new Set([0, selectedCatalogItem.deposit, 25, 30, 40, 50, 75, 100, 150])).sort((a,b)=>a-b).map(deposit => <option key={deposit} value={deposit}>{deposit ? `$${deposit}` : "No deposit"}</option>)}</select></label>
                  </div>
                  <div className="catalog-facts"><span>Appointment type <strong>{selectedCatalogItem.multiSession ? "Multi-session" : "Single appointment"}</strong></span><span>Hair <strong>{selectedCatalogItem.hair}</strong></span><span>Price style <strong>Fixed price</strong></span>{selectedCatalogItem.note && <span className="wide">Note <strong>{selectedCatalogItem.note}</strong></span>}</div>
                  <button className="catalog-add" onClick={() => {
                    const service = `${catalogServiceName} · ${catalogDuration} · $${catalogPrice} · ${catalogDeposit ? `$${catalogDeposit} deposit` : "no deposit"}`;
                    if (!starterServices.includes(service)) setStarterServices([...starterServices, service]);
                    flash(`${catalogServiceName} added to your menu.`);
                  }}>＋ Add selected service</button>
                </div>
                <div className="service-setup-list editable">{starterServices.map((x,i)=>{const details=parseMenuService(x);return <div className={`service-edit-row ${editingService===i?"editing":""}`} key={`${i}-${details.name}`}>
                  {editingService === i ? <div className="guided-service-editor">
                    <div className="guided-editor-title"><div><span>EDIT SERVICE</span><strong>Change the details clients will see.</strong></div><button onClick={()=>setEditingService(null)}>Done</button></div>
                    <label className="service-name-field">Service name<input autoFocus value={details.name} onChange={(e)=>setStarterServices(starterServices.map((s,n)=>n===i?buildMenuService(e.target.value,details.duration,details.price,details.deposit):s))}/></label>
                    <label>Duration<select value={details.duration} onChange={(e)=>setStarterServices(starterServices.map((s,n)=>n===i?buildMenuService(details.name,e.target.value,details.price,details.deposit):s))}>{Array.from(new Set([details.duration,...standardDurationOptions])).map(duration=><option key={duration}>{duration}</option>)}</select></label>
                    <label>Price<select value={customPriceService===i ? "custom" : String(details.price)} onChange={(e)=>{
                      if(e.target.value==="custom") setCustomPriceService(i);
                      else { setCustomPriceService(null); setStarterServices(starterServices.map((s,n)=>n===i?buildMenuService(details.name,details.duration,Number(e.target.value),details.deposit):s)); }
                    }}>{Array.from(new Set([details.price,...standardPriceOptions])).sort((a,b)=>a-b).map(price=><option key={price} value={price}>{price?`$${price}`:"Free"}</option>)}<option value="custom">Custom price…</option></select>
                    {customPriceService===i && <input className="custom-price-input" aria-label={`Custom price for ${details.name}`} type="number" min="0" step="0.01" inputMode="decimal" value={details.price} onChange={(e)=>setStarterServices(starterServices.map((s,n)=>n===i?buildMenuService(details.name,details.duration,Math.max(0,Number(e.target.value)),details.deposit):s))} placeholder="Enter any amount" />}</label>
                    <label>Deposit<select value={details.deposit} onChange={(e)=>setStarterServices(starterServices.map((s,n)=>n===i?buildMenuService(details.name,details.duration,details.price,Number(e.target.value)):s))}>{[0,10,15,20,25,30,40,50,75,100,125,150,200].map(deposit=><option key={deposit} value={deposit}>{deposit?`$${deposit}`:"No deposit"}</option>)}</select></label>
                    <div className="inline-addon-manager">
                      <div className="inline-addon-heading"><div><span>OPTIONAL ADD-ONS FOR THIS SERVICE</span><strong>Clients only see the options you turn on.</strong></div><b>{(serviceAddons[details.name] || []).length} active</b></div>
                      <div className="addon-library-label"><span>{addonCategoryForService(details.name)}</span><small>Common add-ons for this service</small></div>
                      <div className="inline-addon-grid">{ownerAddonCatalog.filter(addon=>addon.categories.includes("Universal")||addon.categories.includes(addonCategoryForService(details.name))).map(addon=>{
                        const active=(serviceAddons[details.name]||[]).includes(addon.name);
                        return <button type="button" key={addon.name} className={active?"active":""} onClick={()=>setServiceAddons(current=>{
                          const existing=current[details.name]||[];
                          return {...current,[details.name]:active?existing.filter(name=>name!==addon.name):[...existing,addon.name]};
                        })}><i>{active?"✓":"+"}</i><span><strong>{addon.name}</strong><small>+${addon.price}{addon.minutes?` · +${addon.minutes} min`:" · no added time"}</small></span></button>
                      })}</div>
                      {customAddonService===details.name ? <div className="custom-addon-form">
                        <label>Add-on name<input value={customAddonDraft.name} onChange={e=>setCustomAddonDraft({...customAddonDraft,name:e.target.value})} placeholder="Example: Waist-length hair" /></label>
                        <label>Price<input type="number" min="0" step="0.01" inputMode="decimal" value={customAddonDraft.price} onChange={e=>setCustomAddonDraft({...customAddonDraft,price:e.target.value})} placeholder="Any amount" /></label>
                        <label>Added time<select value={customAddonDraft.minutes} onChange={e=>setCustomAddonDraft({...customAddonDraft,minutes:e.target.value})}>{[0,15,30,45,60,75,90,120,180].map(minutes=><option key={minutes} value={minutes}>{minutes?`${minutes} minutes`:"No added time"}</option>)}</select></label>
                        <label className="addon-description">What clients see<input value={customAddonDraft.note} onChange={e=>setCustomAddonDraft({...customAddonDraft,note:e.target.value})} placeholder="Short description of this option" /></label>
                        <div className="custom-addon-actions"><button type="button" onClick={()=>{setCustomAddonService(null);setCustomAddonDraft({name:"",price:"",minutes:"0",note:""});}}>Cancel</button><button type="button" disabled={!customAddonDraft.name.trim()} onClick={()=>{
                          const addon: ServiceAddon={name:customAddonDraft.name.trim(),price:Math.max(0,Number(customAddonDraft.price)||0),minutes:Number(customAddonDraft.minutes)||0,note:customAddonDraft.note.trim()||"Optional service upgrade",categories:[addonCategoryForService(details.name)],custom:true};
                          setOwnerAddonCatalog(current=>current.some(item=>item.name.toLowerCase()===addon.name.toLowerCase())?current:[...current,addon]);
                          setServiceAddons(current=>({...current,[details.name]:Array.from(new Set([...(current[details.name]||[]),addon.name]))}));
                          setCustomAddonDraft({name:"",price:"",minutes:"0",note:""});
                          setCustomAddonService(null);
                          flash(`${addon.name} added to ${details.name}.`);
                        }}>Add to this service</button></div>
                      </div> : <button type="button" className="create-custom-addon" onClick={()=>setCustomAddonService(details.name)}>＋ Create your own add-on</button>}
                    </div>
                  </div> : <button onClick={()=>setEditingService(i)}><i>✓</i><span><strong>{details.name}</strong><small>{details.duration} · $${details.price} · {details.deposit?`$${details.deposit} deposit`:"no deposit"}</small></span><b>Edit</b></button>}
                  <button className="remove-service" aria-label={`Remove ${x}`} onClick={()=>setStarterServices(starterServices.filter((_,n)=>n!==i))}>×</button>
                </div>})}</div>
                {help === "services" && <div className="help-popover">You can finish the details later. Every service supports duration, price, deposit, preparation notes, add-ons, and an optional required consultation.</div>}
                <FieldHelp id="service-time" label="Why accurate service time matters" help="BookKit uses duration to calculate real openings and prevent overlapping appointments. Include cleanup or reset time later as buffer time instead of making the service look longer to clients." open={help === "service-time"} onToggle={(id) => setHelp(help === id ? null : id)} />
              </WizardScreen>}
              {setupStep === 5 && <WizardScreen kicker="YOUR TEAM" title="How many people can clients book?" copy="Choose the number for now. You can add names, schedules, and services later.">
                <SetupGuide title="This prepares the right calendar">Choose “Just me” if you work alone. For a team, BookKit makes room for separate schedules and services for each person.</SetupGuide>
                <FieldHelp id="team-count" label="You only need the number right now" help="BookKit uses this to prepare the correct workspace. You will add each person’s name, services, hours, time off, and booking permissions later inside Business Studio." open={help === "team-count"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <ChoiceGrid single items={["Just me", "2–5 people", "6–10 people", "11+ people"]} selected={[teamSize]} onToggle={setTeamSize} />
              </WizardScreen>}
              {setupStep === 6 && <WizardScreen kicker="AVAILABILITY" title="Set your regular working hours." copy="Switch days on or off, then choose the exact opening and closing time for each day.">
                <SetupGuide title="These are your normal hours">Appointments, breaks, days off, and blocked time are handled separately in your calendar. Turning a day off here marks it regularly closed.</SetupGuide>
                <FieldHelp id="business-hours" label="Hours do not expose every minute" help="These times define the outside edges of your normal workday. BookKit only offers times that also fit the selected service, your existing appointments, blocked time, breaks, and booking rules." open={help === "business-hours"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <div className="hours-list">{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((day,i)=><div key={day} className={!openDays[i] ? "closed" : ""}><button className={`day-toggle ${openDays[i] ? "on" : ""}`} onClick={()=>setOpenDays(openDays.map((v,n)=>n===i?!v:v))}><i /></button><strong>{day}</strong>{openDays[i] ? <div className="time-selects"><select value={businessHours[i][0]} onChange={(e)=>setBusinessHours(businessHours.map((v,n)=>n===i?[e.target.value,v[1]]:v))}>{hourOptions.map(x=><option key={x}>{x}</option>)}</select><span>to</span><select value={businessHours[i][1]} onChange={(e)=>setBusinessHours(businessHours.map((v,n)=>n===i?[v[0],e.target.value]:v))}>{hourOptions.map(x=><option key={x}>{x}</option>)}</select></div> : <span>Closed</span>}</div>)}</div>
              </WizardScreen>}
              {setupStep === 7 && <WizardScreen kicker="BOOKING RULES" title="Protect your time." copy="Choose the controls you want now. Every service can have its own rules later.">
                <SetupGuide title="Start with rules that fit most appointments" tone="gold">These become your defaults. You can later give selected services a different deposit, consultation requirement, or cancellation rule.</SetupGuide>
                <FieldHelp id="booking-defaults" label="What does “default” mean?" help="A default is automatically applied to new services to save time. You can override it for any individual service without changing the rest of your menu." open={help === "booking-defaults"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <div className="rules-stack">
                  <label><span><strong>Require a deposit</strong><small>Hold appointments with a fixed or percentage deposit.</small></span><input type="checkbox" defaultChecked /></label>
                  <label><span><strong>24-hour cancellation policy</strong><small>Late cancellations and no-shows forfeit the deposit.</small></span><input type="checkbox" defaultChecked /></label>
                  <label><span><strong>Automatic confirmation</strong><small>Confirm bookings instantly when the time is open.</small></span><input type="checkbox" /></label>
                  <label><span><strong>Some services require a consultation <button className="info-button" onClick={(e)=>{e.preventDefault();setHelp(help === "consult" ? null : "consult")}}>i</button></strong><small>Use this only for services that need assessment before booking.</small></span><input type="checkbox" defaultChecked /></label>
                </div>
                {help === "consult" && <div className="help-popover">A required consultation becomes the first appointment. After it is completed, the client can book the connected service. This is useful for starter locs, corrective color, wig measurements, and services needing an in-person assessment.</div>}
              </WizardScreen>}
              {setupStep === 8 && <div className="finish-screen pro-finish">
                <SetupGuide title="Your booking link is ready" tone="green">Clients can choose a service, see available times, pay the required deposit, and receive confirmation. A landing page is not required.</SetupGuide>
                <FieldHelp id="brand-color" label="Where your color appears" help="Your color is used for buttons, selected services, booking steps, and confirmations. You can change it anytime." open={help === "brand-color"} onToggle={(id) => setHelp(help === id ? null : id)} />
                <div className="theme-builder">
                  <div className="theme-copy"><span>YOUR BOOKING FLOW</span><h3>Choose your booking color.</h3><p>This updates buttons, highlights, and booking selections. You can change it anytime.</p><input type="color" value={themeColor} onChange={(e)=>setThemeColor(e.target.value)} /></div>
                  <div className="theme-swatches">{["#4464e7","#b51f35","#1f7665","#8b4d9d","#d06b37","#171715"].map(color=><button key={color} style={{background:color}} className={themeColor===color?"selected":""} onClick={()=>setThemeColor(color)} aria-label={`Choose ${color}`} />)}</div>
                </div>
                <div className="booking-link-ready">
                  <span className="step-kicker">YOUR BOOKING LINK</span>
                  <h3>bookkit.site/{profileSlug}</h3>
                  <p>Use it on Instagram, TikTok, Google, text messages, email, or a QR code.</p>
                  <div>
                    <button className="primary-action" onClick={() => void navigator.clipboard.writeText(`https://bookkit.site/${profileSlug}`).then(() => flash("Booking link copied."))}>Copy booking link</button>
                    <button onClick={() => startBooking()}>Preview booking flow</button>
                  </div>
                </div>
                <div className="optional-page-card">
                  <div><span>OPTIONAL</span><strong>Want a complete landing page too?</strong><p>Add photos, portfolio, About, reviews, and one of four protected templates whenever you are ready.</p></div>
                  <button onClick={() => { setView("dashboard"); setDashTab("Profile"); }}>Create landing page later →</button>
                </div>
                <SetupGuide title="Already have a website?">Use the same booking link as a button, pop-up, or embedded booking panel on the site you already own.</SetupGuide>
                <span className="step-kicker">SETUP COMPLETE</span><h1>You’re ready to accept bookings.</h1><p>Enter Business Studio to manage appointments, connect payments, share your link, and fine-tune your services.</p>
                <div className="launch-buttons"><button onClick={() => setSetupStep(2)}>Review details</button><button className="primary-action" disabled={saving} onClick={() => void finishBusinessSetup()}>{saving ? "Creating your business…" : "Get my booking link →"}</button></div>
              </div>}
              {setupStep < 8 && <WizardNav disabled={setupStep === 1 && !specialties.length} onNext={() => setSetupStep(setupStep + 1)} label={setupStep === 7 ? "Create my booking link →" : "Continue →"} />}
            </div>}
          </div>
        </section>
      )}

      {view === "business" && (
        <section className="profile-page">
          <div className="profile-cover mini-site-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(9,21,39,.96) 0%,rgba(9,21,39,.80) 43%,rgba(9,21,39,.15) 72%),url(${services[1].image})`}}>
            <div className="profile-cover-tools"><button className="back" onClick={() => setView("discover")}>← BookKit</button><div><button onClick={shareProfile}>↗ <span>Share</span></button><button className={profileSaved ? "saved" : ""} onClick={() => { setProfileSaved(!profileSaved); flash(profileSaved ? "Removed from saved businesses." : "Saved to your favorites."); }}>{profileSaved ? "♥" : "♡"} <span>{profileSaved ? "Saved" : "Save"}</span></button></div></div>
            <div className="mini-site-hero-copy">
              <span>WELCOME TO CORAL AFRICAN HAIR BRAIDING</span>
              <h1>Braiding<br/><em>elegance.</em></h1>
              <p>Expertly crafted styles backed by more than 20 years of experience, precision, and care.</p>
              <div><button onClick={() => startBooking()}>Book appointment</button><a href="#services">View services</a></div>
            </div>
          </div>
          <div className="profile-summary">
            <div className="profile-identity">
              <div className="profile-logo">CA</div>
              <div>
                <div className="identity-kicker"><span>LIBERIAN-OWNED</span><b>✓ VERIFIED</b></div>
                <h1>Coral African Hair Braiding</h1><p className="tagline">Braiding elegance. Rooted in experience.</p>
                <div className="profile-facts"><button onClick={() => document.querySelector("#reviews")?.scrollIntoView()}>★ 4.9 <u>127 reviews</u></button><button onClick={()=>window.open("https://maps.google.com/?q=231+Bissell+Ave+Buffalo+NY+14211","_blank")}>231 Bissell Ave, Buffalo, NY</button><a href="tel:+17165550123">Call</a><a href="sms:+17165550123">Message</a><span className="open-status">Open today until 7 PM</span></div>
              </div>
            </div>
            <div className="summary-actions"><small>Next opening</small><strong>Tomorrow, 10:30 AM</strong><button className="book-primary" onClick={() => startBooking()}>Book appointment</button></div>
          </div>

          <div className="profile-tabs">
            <a href="#services">Services</a><a href="#work">Portfolio</a><a href="#about">About</a><a href="#reviews">Reviews</a><a href="#location">Location</a><a href="#policies">Policies</a>
          </div>

          <div className="profile-content">
            <div className="profile-main">
              <section id="services">
                <div className="section-heading compact"><div><span className="eyebrow">AVAILABLE APPOINTMENTS</span><h2>Book a service.</h2></div><span>{services.length} services</span></div>
                <div className="service-tools">
                  <input aria-label="Search services" placeholder="Search services…" value={serviceQuery} onChange={event => setServiceQuery(event.target.value)} />
                  <span>Choose a service below to see its details and available times.</span>
                </div>
                <div className="service-list">
                  {filteredServices.slice(0, showAllServices ? filteredServices.length : 3).map((service) => {
                    const expanded = expandedService === service.name;
                    return (
                      <article className={`service-row service-accordion ${expanded ? "expanded" : ""}`} key={service.name}>
                        <button className="service-summary" aria-expanded={expanded} onClick={() => setExpandedService(expanded ? null : service.name)}>
                          <div className="service-mark">{service.name.split(" ").map(word=>word[0]).slice(0,2).join("")}</div>
                          <div>
                            <h3>{service.name}</h3>
                            <span>{service.duration} · ${service.price}</span>
                          </div>
                          <i aria-hidden="true">⌄</i>
                        </button>
                        {expanded && <div className="service-details">
                          <p>{service.description}</p>
                          <div><span>{service.deposit}</span><span>{service.consultation ? "Consultation required" : "Instant booking"}</span></div>
                          <button onClick={() => startBooking(service)}>{service.consultation ? "Book consultation" : "Book this service"}</button>
                        </div>}
                      </article>
                    );
                  })}
                </div>
                {filteredServices.length > 3 && <button className="show-services" onClick={() => { setShowAllServices(!showAllServices); setExpandedService(null); }}>
                  {showAllServices ? "Show fewer services ↑" : `Show all ${filteredServices.length} services ↓`}
                </button>}
              </section>

              <section id="work" className="work-section">
                <span className="eyebrow">THE LOOKBOOK</span>
                <div className="work-heading"><h2>Styles created with care.</h2><div><button aria-label="Previous style" onClick={() => setWorkSlide((workSlide - 1 + services.length) % services.length)}>←</button><button aria-label="Next style" onClick={() => setWorkSlide((workSlide + 1) % services.length)}>→</button></div></div>
                <div className="work-carousel">
                  <div className="work-track" style={{transform:`translateX(-${workSlide * 100}%)`}}>
                    {services.map((service) => <figure key={service.name}><img src={service.image} alt={service.name} /><figcaption><span>{String(services.indexOf(service)+1).padStart(2,"0")}</span><strong>{service.name}</strong></figcaption></figure>)}
                  </div>
                </div>
                <div className="carousel-dots">{services.map((service,index)=><button key={service.name} className={index===workSlide?"active":""} aria-label={`View ${service.name}`} onClick={()=>setWorkSlide(index)}/>)}</div>
              </section>

              <section id="about" className="about-section">
                <span className="eyebrow">ABOUT THE BUSINESS</span><h2>Liberian roots. More than 20 years of experience.</h2>
                <p>Coral African Hair Braiding is led by a Liberian braiding specialist with more than two decades of experience. Her work has taken her from Buffalo to Brooklyn, Queens, Newark, Irvington, Jersey City, and Philadelphia. Every appointment is approached with patience, precision, and care for healthy hair.</p>
              </section>
              <section className="team-section">
                <div><span className="eyebrow">BOOK WITH CONFIDENCE</span><h2>Experience you can trust.</h2><p>More than 20 years of braiding experience, clear appointment policies, secure deposits, and care for healthy hair.</p></div>
                <button onClick={() => startBooking()}>Book your appointment →</button>
              </section>
              <section id="reviews" className="reviews-section">
                <div><span className="eyebrow">VERIFIED REVIEWS</span><h2>What clients are saying.</h2><strong>4.9</strong><p>★★★★★</p><small>Based on 127 verified appointments</small></div>
                <div className="review-carousel-shell">
                  <div className="review-carousel" style={{transform:`translateX(-${reviewSlide * 100}%)`}}>
                    {clientReviews.map(review=><article key={review.name}><span>★★★★★</span><p>“{review.quote}”</p><strong>— {review.name}</strong><small>{review.detail}</small></article>)}
                  </div>
                  <div className="review-controls"><button aria-label="Previous review" onClick={()=>setReviewSlide((reviewSlide-1+clientReviews.length)%clientReviews.length)}>←</button><span>{reviewSlide+1} / {clientReviews.length}</span><button aria-label="Next review" onClick={()=>setReviewSlide((reviewSlide+1)%clientReviews.length)}>→</button></div>
                </div>
              </section>
              <section id="location" className="location-section">
                <div className="location-map"><span>231</span><small>BISSELL AVE</small></div>
                <div><span className="eyebrow">LOCATION & HOURS</span><h2>Coral African Hair Braiding</h2><p>231 Bissell Ave<br/>Buffalo, NY 14211</p><button onClick={()=>window.open("https://maps.google.com/?q=231+Bissell+Ave+Buffalo+NY+14211","_blank")}>Get directions ↗</button></div>
              </section>
              <section id="policies" className="about-section">
                <span className="eyebrow">BEFORE YOU BOOK</span><h2>Simple, respectful appointment policies.</h2>
                <p><strong>Deposit.</strong> Your deposit holds your appointment and is applied to your service. <strong>Cancellation.</strong> Please cancel or reschedule at least 24 hours before your appointment; late cancellations and no-shows forfeit the deposit. <strong>Preparation.</strong> Arrive with hair clean, fully detangled, and free of heavy oils unless your selected service says otherwise.</p>
              </section>
            </div>
            <aside className="booking-side">
              <span className="eyebrow">BOOK ONLINE</span><strong>Ready for your next look?</strong><p>Choose a service and see Coral’s real availability.</p><button onClick={() => startBooking()}>View available times</button><ul><li>Secure deposit</li><li>Instant confirmation</li><li>Easy rescheduling</li></ul><span>No account required.</span>
            </aside>
          </div>
          <div className="mobile-book-bar"><div><small>Next opening</small><strong>Tomorrow, 10:30 AM</strong></div><button onClick={() => startBooking()}>Book now</button></div>
        </section>
      )}

      {view === "booking" && (
        <section className="booking-page">
          <div className="booking-top">
            <button className="back" onClick={() => setView("business")}>← Coral African Hair Braiding</button>
            <div className="steps"><span className={step >= 1 ? "done" : ""}>1 Service</span><i /><span className={step >= 2 ? "done" : ""}>2 Time</span><i /><span className={step >= 3 ? "done" : ""}>3 Details</span><i /><span className={step >= 4 ? "done" : ""}>4 Payment</span></div>
          </div>

          {!confirmed ? (
            <div className="booking-grid">
              <div className="booking-panel">
                {step === 1 && <>
                  <span className="eyebrow">STEP 1 OF 4</span><h1>Build your appointment</h1><p>{isTeam ? "Choose a service, professional, and any options you need." : "Choose your service and any owner-approved options you need."}</p>
                  <div className="booking-dropdown-card">
                    <label>Service<select value={selectedService.name} onChange={(event) => {
                      const item = bookingCatalog.find(service => service.name === event.target.value);
                      if (item) {
                        setSelectedService(serviceFromCatalog(item));
                        setSelectedAddons([]);
                      }
                    }}>{bookingCatalog.map(service => <option key={service.name}>{service.name}</option>)}</select></label>
                    <label>Duration<select value={selectedService.duration} onChange={(event) => setSelectedService({...selectedService,duration:event.target.value})}>{durationOptionsFor(bookingCatalog.find(item => item.name === selectedService.name) || bookingCatalog[0]).map(duration => <option key={duration}>{duration}</option>)}</select></label>
                    <div className="booking-selection-facts"><span>Price <strong>${selectedService.price || 0}</strong></span><span>Booking deposit <strong>{selectedService.deposit}</strong></span></div>
                  </div>
                  {isTeam && <div className="professional-choice">
                    <div><span>TEAM BOOKING</span><strong>Who would you like to book?</strong><p>Choose a professional or let BookKit find the earliest opening across the team.</p></div>
                    <label>Professional<select value={selectedStaff} onChange={event => setSelectedStaff(event.target.value)}><option>First available</option><option>Coral</option><option>Nia</option><option>Imani</option></select></label>
                  </div>}
                  <div className="client-addons">
                    <div className="client-addons-head"><div><span>OPTIONAL</span><strong>Customize your service</strong><p>Only add-ons offered by the owner for this service appear here.</p></div>{selectedAddons.length > 0 && <b>{selectedAddons.length} selected</b>}</div>
                    {enabledAddons.length ? <div className="client-addon-grid">{enabledAddons.map(addonName => {
                      const addon = ownerAddonCatalog.find(item => item.name === addonName)!;
                      const active = selectedAddons.includes(addon.name);
                      return <label key={addon.name} className={active ? "selected" : ""}>
                        <input type="checkbox" checked={active} onChange={() => setSelectedAddons(current => current.includes(addon.name) ? current.filter(item => item !== addon.name) : [...current, addon.name])}/>
                        <i>{active ? "✓" : "+"}</i><span><strong>{addon.name}</strong><small>{addon.note}</small></span><em>+${addon.price}{addon.minutes ? ` · +${addon.minutes} min` : ""}</em>
                      </label>;
                    })}</div> : <div className="no-addons">No optional add-ons are offered for this service.</div>}
                  </div>
                  <button className="continue" onClick={() => setStep(2)}>Continue to date & time →</button>
                </>}

                {step === 2 && <>
                  <span className="eyebrow">STEP 2 OF 4</span><h1>Book a time</h1><p>{isTeam && selectedStaff === "First available" ? "Showing the earliest openings across the team." : "Choose an open date, then select an available start time."} Times are Eastern Time.</p>
                  <div className="full-calendar">
                    <div className="calendar-book-head"><button aria-label="Previous month" onClick={()=>flash("Earlier availability is not open for booking.")}>←</button><div><strong>August 2026</strong><span>{isTeam ? selectedStaff : "Coral’s calendar"}</span></div><button aria-label="Next month" onClick={()=>flash("September availability opens soon.")}>→</button></div>
                    <div className="calendar-weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><span key={day}>{day}</span>)}</div>
                    <div className="calendar-month-grid">
                      {monthCalendar.map((cell,index) => {
                        const active = cell.bookingIndex === selectedDate;
                        const unavailable = cell.closed || cell.full || cell.muted || cell.bookingIndex === undefined;
                        return <button key={`${cell.date}-${index}`} disabled={unavailable} className={`${active ? "selected" : ""} ${cell.muted ? "muted" : ""} ${cell.closed ? "closed" : ""} ${cell.full ? "full" : ""}`} onClick={()=>cell.bookingIndex !== undefined && setSelectedDate(cell.bookingIndex)}>
                          <span>{cell.date}</span>
                          {cell.bookingIndex !== undefined && <i>Open</i>}
                          {cell.closed && <i>Closed</i>}
                          {cell.full && <i>Full</i>}
                        </button>;
                      })}
                    </div>
                    <div className="calendar-legend"><span><i className="open"/>Open</span><span><i className="picked"/>Selected</span><span><i className="not-open"/>Not available</span></div>
                  </div>
                  <div className="time-picker-complete">
                    <div className="time-picker-head"><div><span>AVAILABLE TIMES</span><strong>{selectedDateRecord.day}, {selectedDateRecord.month} {selectedDateRecord.date}</strong></div><small>{availableTimes.length} openings</small></div>
                    <div className="time-slot-grid">{times.map(time => {
                      const status = slotStatus(time);
                      const allowed = status === "open";
                      return <button key={time} disabled={!allowed} className={`${selectedTime === time ? "selected" : ""} ${status}`} onClick={()=>setSelectedTime(time)}>
                        <strong>{time}</strong><span>{status === "open" ? "Open" : status === "booked" ? "Booked" : "Not available"}</span>
                      </button>;
                    })}</div>
                    <label className="time-dropdown compact">Selected time<select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>{availableTimes.map(time => <option key={time}>{time}</option>)}</select></label>
                  </div>
                  <div className="booking-nav"><button onClick={() => setStep(1)}>← Back</button><button className="continue" disabled={!selectedTime} onClick={() => setStep(3)}>Continue with {selectedTime || "a time"} →</button></div>
                </>}

                {step === 3 && <>
                  <span className="eyebrow">STEP 3 OF 4</span><h1>Your details</h1><p>We’ll send confirmation and appointment updates here.</p>
                  <div className="form-grid">
                    <label>First name<input value={clientDetails.firstName} onChange={e=>setClientDetails({...clientDetails,firstName:e.target.value})} placeholder="First name" /></label>
                    <label>Last name<input value={clientDetails.lastName} onChange={e=>setClientDetails({...clientDetails,lastName:e.target.value})} placeholder="Last name" /></label>
                    <label className="wide">Mobile number<input value={clientDetails.phone} onChange={e=>setClientDetails({...clientDetails,phone:e.target.value})} placeholder="(716) 555-0123" /></label>
                    <label className="wide">Email<input value={clientDetails.email} onChange={e=>setClientDetails({...clientDetails,email:e.target.value})} type="email" placeholder="you@email.com" /></label>
                    <label>Current hair length<select value={clientDetails.hairLength} onChange={e=>setClientDetails({...clientDetails,hairLength:e.target.value})}><option value="">Select</option><option>Above shoulders</option><option>Shoulder length</option><option>Below shoulders</option></select></label>
                    <label>Allergies or sensitivities<input value={clientDetails.allergies} onChange={e=>setClientDetails({...clientDetails,allergies:e.target.value})} placeholder="None, or explain" /></label>
                    <label className="wide">Appointment notes<textarea value={clientDetails.notes} onChange={e=>setClientDetails({...clientDetails,notes:e.target.value})} placeholder="Hair color, inspiration, or anything Coral should know..." /></label>
                  </div>
                  <label className="policy-check"><input type="checkbox" checked={policyAccepted} onChange={e=>setPolicyAccepted(e.target.checked)} /> I agree to Coral’s deposit, preparation, and 24-hour cancellation policy.</label>
                  <div className="booking-nav"><button onClick={() => setStep(2)}>← Back</button><button className="continue" onClick={beginPayment}>Continue to payment →</button></div>
                </>}

                {step === 4 && <>
                  <span className="eyebrow">STEP 4 OF 4 · SECURE TEST CHECKOUT</span><h1>{bookingManageToken ? "Confirm your new time" : "Hold your appointment"}</h1><p>{bookingManageToken ? "Your original appointment will move to the open time you selected." : "This checkout demonstrates BookKit’s payment flow. No real card will be charged."}</p>
                  {bookingManageToken ? <div className="test-mode-banner"><b>RESCHEDULE</b><span>No second deposit is collected when a client changes an existing appointment.</span></div> : <>
                  <div className="test-mode-banner"><b>TEST MODE</b><span>Stripe Connect activation is intentionally off until BookKit’s live platform account is connected.</span></div>
                  <div className="checkout-methods"><button className="active">Card</button><button onClick={() => flash("Apple Pay appears automatically on supported devices in live mode.")}>Apple Pay</button><button onClick={() => flash("Google Pay appears automatically on supported devices in live mode.")}>Google Pay</button></div>
                  <div className="secure-card-form">
                    <label>Cardholder name<input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" /></label>
                    <label>Card number<input inputMode="numeric" placeholder="4242 4242 4242 4242" /></label>
                    <div><label>Expiration<input placeholder="MM / YY" /></label><label>Security code<input inputMode="numeric" placeholder="CVC" /></label></div>
                    <label>ZIP code<input inputMode="numeric" placeholder="14211" /></label>
                  </div>
                  <div className="checkout-protection"><span>🔒</span><p><strong>Protected payment</strong>Your card details are handled by the payment provider in live mode. BookKit never stores raw card numbers.</p></div>
                  </>}
                  <div className="booking-nav"><button onClick={() => setStep(3)}>← Back</button><button className="continue" disabled={checkoutProcessing} onClick={() => void processTestCheckout()}>{checkoutProcessing ? "Processing…" : bookingManageToken ? "Confirm new time" : `Pay ${selectedService.deposit.split(" ")[0]} & request booking`}</button></div>
                </>}
              </div>
              <aside className="summary-card">
                <span>YOUR APPOINTMENT</span>
                <div className="mini-business"><div className="coral-logo">CA</div><div><strong>Coral African Hair Braiding</strong><small>231 Bissell Ave, Buffalo</small></div></div>
                <hr />
                <strong>{selectedService.name}</strong>
                <p>{selectedService.duration}{addonMinutes ? ` + ${addonMinutes} min add-ons` : ""}{isTeam ? ` · with ${selectedStaff}` : ""}</p>
                {selectedAddons.map(addon => <p key={addon}>+ {addon}</p>)}
                {step >= 2 && <p className="summary-time">◷ {selectedDateRecord.day}, {selectedDateRecord.month} {selectedDateRecord.date} at {selectedTime}</p>}
                <hr />
                <div className="summary-total"><span>Service estimate</span><strong>${(selectedService.price || 0) + addonTotal}</strong></div>
                <div className="summary-total"><span>Due today</span><strong>{selectedService.deposit.split(" ")[0]}</strong></div>
                <small>The deposit holds your time and goes toward your service.</small>
              </aside>
            </div>
          ) : (
            <div className="confirmation">
              <div className="confirm-mark">✓</div><span className="eyebrow">BOOKING REQUEST SENT</span>
              <h1>Your time is being held.</h1>
              <p>Coral will receive your request for <strong>{selectedService.name}</strong> on <strong>{selectedDateRecord.day}, {selectedDateRecord.month} {selectedDateRecord.date} at {selectedTime}</strong>.</p>
              <div className="confirmation-card"><span>Confirmation number</span><strong>{bookingReference || "BK-PENDING"}</strong><p>Your appointment is securely saved. Email and text delivery will activate when BookKit’s messaging providers are connected.</p></div>
              <div className="confirmation-actions"><button onClick={() => flash("Calendar file is prepared when calendar delivery is connected.")}>Add to calendar</button><button onClick={() => { setConfirmed(false); setStep(2); }}>Reschedule</button><button disabled={saving} onClick={() => void cancelBooking()}>{saving ? "Cancelling…" : "Cancel appointment"}</button><button className="dark-button" onClick={() => setView("business")}>Back to profile</button></div>
            </div>
          )}
        </section>
      )}

      {view === "dashboard" && (
        <section className="dashboard-page">
          <aside className="dash-nav">
            <div className="studio-brand"><div className="brand light">$1B$2ookKit$3</div><span>PRO</span></div>
            <button className="dash-business" onClick={()=>setDashTab("Profile")}>
              <div className="coral-logo">YB</div>
              <div><strong>{profileName}</strong><small>{businessRole ? `${businessRole.replace("_", " ")} access` : "Business studio"}</small></div>
              <span className="business-switch">⌄</span>
            </button>
            <nav aria-label="Business Studio">
              <div className="nav-group">
                <span className="nav-label">RUN YOUR DAY</span>
                {(["Overview","Appointments","Services","Clients","Automations"] as const).map((tab)=><button key={tab} className={dashTab===tab?"active":""} onClick={()=>setDashTab(tab)}><i>{tab==="Overview"?"⌂":tab==="Appointments"?"▦":tab==="Clients"?"♙":tab==="Automations"?"↻":"◇"}</i><span>{tab}</span>{tab==="Appointments"&&<b>3</b>}</button>)}
                <button onClick={()=>{setView("setup");setSetupPath("pro");setAccountReady(true);setSetupStep(6)}}><i>◷</i><span>Availability</span></button>
              </div>
              <div className="nav-group">
                <span className="nav-label">GROW YOUR BUSINESS</span>
                {(["Money","Marketing","Profile","Booking channels"] as const).map((tab)=><button key={tab} className={dashTab===tab?"active":""} onClick={()=>setDashTab(tab)}><i>{tab==="Money"?"$":tab==="Marketing"?"◎":tab==="Profile"?"◈":"↗"}</i><span>{tab==="Profile"?"Landing page (optional)":tab==="Booking channels"?"Booking link":tab}</span>{tab==="Profile"&&profilePublished&&<small>LIVE</small>}</button>)}
              </div>
              <div className="nav-group nav-support">
                <span className="nav-label">ACCOUNT</span>
                <button onClick={()=>flash("Business settings opened.")}><i>⚙</i><span>Settings</span></button>
                <button onClick={()=>flash("BookKit help center opened.")}><i>?</i><span>Help & support</span></button>
                <button onClick={() => void signOut()}><i>↗</i><span>Sign out</span></button>
              </div>
            </nav>
            <div className="nav-footer"><div><span>PRO PLAN</span><strong>Everything is active</strong></div><button aria-label="Plan details">›</button></div>
            <button className="exit" onClick={() => setView("discover")}><i>↗</i><span>View public page</span></button>
          </aside>
          <div className="dash-main">
            <div className="workspace-hero">
              <div><span>BOOKKIT BUSINESS STUDIO</span><h1>{dashTab === "Overview" ? "Your business, at a glance." : dashTab === "Profile" ? "Landing page" : dashTab === "Booking channels" ? "Your booking link" : dashTab}</h1><p>{dashTab === "Overview" ? "Appointments, momentum, and next moves in one beautiful workspace." : dashTab === "Appointments" ? "Every appointment, request, open hour, and client detail—beautifully organized." : dashTab === "Clients" ? "Know every client, their history, preferences, and next opportunity." : dashTab === "Automations" ? "Connect calendars, prevent conflicts, and let reminders handle the follow-up." : dashTab === "Money" ? "See deposits, payouts, tips, and what your business earned." : dashTab === "Marketing" ? "Fill open time and bring good clients back without starting from scratch." : dashTab === "Profile" ? "Optional: turn your booking link into a complete branded landing page." : dashTab === "Booking channels" ? "Copy your link first. Add it to a website only if you already have one." : "Build a menu that matches the way you actually work."}</p></div>
              <button onClick={() => setView("business")}>Preview your page ↗</button>
              <div className="workspace-glow" />
            </div>
            {dashTab === "Overview" && <>
            <div className="status-banner">
              <div><span className={bookingsOpen ? "status-dot" : "status-dot off"} /> <strong>{bookingsOpen ? "Online booking is open" : "Online booking is paused"}</strong><p>{bookingsOpen ? "Clients can see and request your available times." : "Clients cannot request new appointments."}</p></div>
              <button onClick={() => { setBookingsOpen(!bookingsOpen); flash(bookingsOpen ? "Online booking paused." : "Online booking opened."); }}>{bookingsOpen ? "Pause booking" : "Open booking"}</button>
            </div>
            <div className="stat-grid">
              <article><span>APPOINTMENTS THIS WEEK</span><strong>12</strong><em>↑ 20% from last week</em></article>
              <article><span>NEW BOOKING REQUESTS</span><strong>3</strong><em>Need your response</em></article>
              <article><span>PROFILE VIEWS</span><strong>248</strong><em>↑ 34 this week</em></article>
            </div>
            <section className="request-queue">
              <div className="request-head"><div><span>NEEDS ATTENTION</span><h2>New booking requests</h2></div><small>Responding quickly protects the client’s selected time.</small></div>
              {[["Monique L.","Starter Loc Consultation","Fri, Jul 31 · 4:00 PM"],["Nia B.","Boho Braids","Sat, Aug 1 · 9:00 AM"],["Keisha W.","Wig Install","Sun, Aug 2 · 12:00 PM"]].map((row,i)=><article key={row[0]} className={requestStates[i].toLowerCase()}><div className="client-avatar">{row[0][0]}</div><div><strong>{row[0]}</strong><span>{row[1]} · {row[2]}</span></div>{requestStates[i]==="Pending"?<div className="request-actions"><button onClick={()=>setRequestStates(requestStates.map((x,n)=>n===i?"Declined":x))}>Decline</button><button onClick={()=>{setRequestStates(requestStates.map((x,n)=>n===i?"Confirmed":x));flash("Appointment confirmed and client notified.")}}>Confirm</button></div>:<em>{requestStates[i]} ✓</em>}</article>)}
            </section>
            <div className="dash-columns">
              <section className="schedule-card">
                <div className="card-heading"><div><span>TODAY</span><h2>Your schedule</h2></div><button onClick={()=>{setDashTab("Appointments");setAppointmentView("calendar")}}>Open calendar →</button></div>
                {[["9:00 AM", "Jasmine R.", "Knotless Braids", "Confirmed"], ["2:30 PM", "Tia M.", "Retwist & Style", "Confirmed"], ["4:00 PM", "Monique L.", "Starter Loc Consultation", "Request"]].map(row => <div className="appointment" key={row[0]}><strong>{row[0]}</strong><div className="client-avatar">{row[1][0]}</div><div><b>{row[1]}</b><span>{row[2]}</span></div><em className={row[3] === "Request" ? "request" : ""}>{row[3]}</em></div>)}
              </section>
              <section className="availability-editor">
                <div className="card-heading"><div><span>QUICK AVAILABILITY</span><h2>Wednesday, Jul 30</h2></div></div>
                <p>Tap a time to open or block it.</p>
                <div className="manage-times">
                  {times.map(time => <button key={time} className={blocked.includes(time) ? "blocked" : ""} onClick={() => setBlocked(blocked.includes(time) ? blocked.filter(t => t !== time) : [...blocked, time])}><span>{time}</span><strong>{blocked.includes(time) ? "Blocked" : "Open"}</strong></button>)}
                </div>
                <button className="save-availability" onClick={() => flash("Availability saved. Your booking page is updated.")}>Save availability</button>
              </section>
            </div>
            </>}
            {dashTab === "Appointments" && <section className="appointments-workspace">
              <div className="appointments-command">
                <div className="date-command"><button aria-label="Previous period" onClick={()=>setCalendarOffset(calendarOffset-1)}>‹</button><button className="today-button" onClick={()=>setCalendarOffset(0)}>Today</button><button aria-label="Next period" onClick={()=>setCalendarOffset(calendarOffset+1)}>›</button><div><span>{calendarOffset===0?"THIS WEEK":calendarOffset<0?"PREVIOUS WEEK":"NEXT WEEK"}</span><strong>{calendarTitle}</strong></div></div>
                <div className="appointment-view-switch" aria-label="Appointment view">
                  <button className={appointmentView==="list"?"active":""} onClick={()=>setAppointmentView("list")}><i>☷</i> List</button>
                  <button className={appointmentView==="calendar"?"active":""} onClick={()=>setAppointmentView("calendar")}><i>▦</i> Calendar</button>
                </div>
                <button className="new-appointment" onClick={()=>setNewAppointmentOpen(true)}>＋ New appointment</button>
              </div>
              <div className="appointment-insights">
                <article><span>APPOINTMENTS</span><strong>12</strong><small>8 confirmed · 3 requests</small></article>
                <article><span>BOOKED TIME</span><strong>31h</strong><small>74% of available hours</small></article>
                <article><span>EXPECTED</span><strong>$1,840</strong><small>$245 deposits collected</small></article>
                <div className="week-meter"><span><b style={{width:"74%"}} /></span><small>Availability this week</small></div>
              </div>
              <div className="appointment-filterbar">
                <div>{(["All","Confirmed","Requests","Completed"] as const).map(filter=><button key={filter} className={appointmentFilter===filter?"active":""} onClick={()=>setAppointmentFilter(filter)}>{filter}{filter==="Requests"&&<em>3</em>}</button>)}</div>
                <button onClick={()=>flash("Search and advanced filters opened.")}>⌕ Search & filter</button>
              </div>
              {appointmentView === "calendar" ? <div className="premium-calendar">
              <div className="calendar-subhead"><div><button className={calendarMode==="week"?"active":""} onClick={()=>setCalendarMode("week")}>Week</button><button className={calendarMode==="day"?"active":""} onClick={()=>setCalendarMode("day")}>Day</button><button className={calendarMode==="month"?"active":""} onClick={()=>setCalendarMode("month")}>Month</button></div><button className="team-filter" onClick={()=>flash("Team calendar filter opened.")}><span className="staff-dot" /> All team members⌄</button></div>
              {calendarMode === "month" ? <div className="month-calendar">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=><b key={day}>{day}</b>)}
                {Array.from({length:35}).map((_,i)=><button key={i} className={i===7?"today":""} onClick={()=>{setCalendarMode("day");flash(`Opened ${i+21 > 31 ? "August "+(i-10) : "July "+(i+21)}`)}}><span>{i+21 > 31 ? i-10 : i+21}</span>{[7,9,11,14,18,22,27].includes(i)&&<i>● {[7,14,22].includes(i)?"3":"2"} bookings</i>}</button>)}
              </div> : <div className={`week-calendar ${calendarMode==="day"?"day-mode":""}`}>
                <div className="time-axis"><span /><span>9 AM</span><span>10 AM</span><span>11 AM</span><span>12 PM</span><span>1 PM</span><span>2 PM</span><span>3 PM</span><span>4 PM</span><span>5 PM</span></div>
                {calendarDays.filter((_,i)=>calendarMode==="week"||i===0).map((day,i)=><div className={`calendar-day ${calendarOffset===0&&i===0?"today":""}`} key={day}><header><span>{day.split(" ")[0]}</span><strong>{day.split(" ")[1]}</strong></header><div className="calendar-lines">{Array.from({length:9}).map((_,n)=><i key={n} />)}
                  {calendarOffset===0&&i===0&&<><button className="cal-event event-a" onClick={()=>setSelectedAppointment("Jasmine Reed")}><b>9:00 · 4h 30m</b><span>Knotless Braids</span><small>Jasmine Reed · $30 paid</small></button><button className="cal-event event-b" onClick={()=>setSelectedAppointment("Tia Moore")}><b>2:30 · 2h 15m</b><span>Retwist & Style</span><small>Tia Moore · Confirmed</small></button></>}
                  {i===2&&<button className="cal-event event-c" onClick={()=>setSelectedAppointment("Aaliyah Price")}><b>11:00 · 5h</b><span>Box Braids</span><small>Aaliyah Price · Request</small></button>}
                  {i===4&&<button className="cal-event event-d" onClick={()=>setSelectedAppointment("Monique Lewis")}><b>10:00 · 30m</b><span>Loc Consultation</span><small>Monique Lewis · New client</small></button>}
                </div></div>)}
              </div>}
              <div className="calendar-legend"><span><i className="confirmed" /> Confirmed</span><span><i className="request" /> Request</span><span><i className="blocked-time" /> Blocked time</span><button onClick={()=>flash("Time-off controls opened.")}>＋ Block time</button></div>
              </div> : <div className="appointment-list">
                {savedAppointments.length > 0 && <div className="appointment-day saved"><div className="appointment-day-label"><span>SAVED IN BOOKKIT</span><strong>New appointments</strong><small>Permanent records · conflict protected</small></div><div className="appointment-list-rows">
                  {savedAppointments.map(row=><button key={row.id} onClick={()=>setSelectedAppointment(row.client_name)}><time>{row.start_time}</time><span className="client-photo">{row.client_name[0]}</span><span className="list-client"><strong>{row.client_name}</strong><small>{row.service_name} · {row.appointment_date}</small></span><em className="confirmed">{row.status}</em><b>Saved</b><i>›</i></button>)}
                </div></div>}
                <div className="appointment-day"><div className="appointment-day-label"><span>TODAY</span><strong>Tue, Jul 28</strong><small>3 appointments · $455 expected</small></div><div className="appointment-list-rows">
                  {[["9:00 AM","Jasmine Reed","Knotless Braids","4h 30m","Confirmed","$220"],["2:30 PM","Tia Moore","Retwist & Style","2h 15m","Confirmed","$165"],["4:00 PM","Monique Lewis","Starter Loc Consultation","30m","Request","$20"]].filter(row=>appointmentFilter==="All"||row[4]===appointmentFilter.replace("Requests","Request")).map(row=><button key={row[1]} onClick={()=>setSelectedAppointment(row[1])}><time>{row[0]}</time><span className="client-photo">{row[1][0]}</span><span className="list-client"><strong>{row[1]}</strong><small>{row[2]} · {row[3]}</small></span><em className={row[4].toLowerCase()}>{row[4]}</em><b>{row[5]}</b><i>›</i></button>)}
                </div></div>
                <div className="appointment-day future"><div className="appointment-day-label"><span>UP NEXT</span><strong>Wed, Jul 29</strong><small>2 appointments · 4 open hours</small></div><div className="appointment-list-rows">
                  {[["10:00 AM","Danielle Carter","Cornrows","2h 30m","Confirmed","$140"],["1:30 PM","Nia Brooks","Boho Braids","5h","Confirmed","$245"]].filter(row=>appointmentFilter==="All"||row[4]===appointmentFilter.replace("Requests","Request")).map(row=><button key={row[1]} onClick={()=>setSelectedAppointment(row[1])}><time>{row[0]}</time><span className="client-photo">{row[1][0]}</span><span className="list-client"><strong>{row[1]}</strong><small>{row[2]} · {row[3]}</small></span><em className={row[4].toLowerCase()}>{row[4]}</em><b>{row[5]}</b><i>›</i></button>)}
                </div></div>
              </div>}
              {selectedAppointment&&<aside className="appointment-drawer"><button className="drawer-close" onClick={()=>setSelectedAppointment(null)}>×</button><span>APPOINTMENT DETAILS</span><div className="drawer-client"><div className="client-photo large">{selectedAppointment[0]}</div><div><h3>{selectedAppointment}</h3><p>{selectedAppointmentRecord ? "Saved production client" : "Example appointment"}</p></div></div><div className="drawer-service"><small>SERVICE</small><strong>{selectedAppointmentRecord?.service_name || (selectedAppointment.includes("Monique")?"Starter Loc Consultation":selectedAppointment.includes("Tia")?"Retwist & Style":selectedAppointment.includes("Aaliyah")?"Box Braids":"Knotless Braids")}</strong><p>{selectedAppointmentRecord ? `${selectedAppointmentRecord.appointment_date} · ${selectedAppointmentRecord.start_time}` : "Tue, July 28 · 9:00 AM"}</p></div><div className="drawer-status"><span>✓ {(selectedAppointmentRecord?.status || "Confirmed").replace("_"," ")}</span><span>{selectedAppointmentRecord ? "✓ Permanent history active" : "✓ Example record"}</span></div>{selectedAppointmentRecord&&<div className="drawer-actions"><button disabled={saving} onClick={()=>void changeAppointmentStatus(selectedAppointmentRecord.id,"completed")}>Complete</button><button disabled={saving} onClick={()=>void changeAppointmentStatus(selectedAppointmentRecord.id,"no_show")}>No-show</button><button disabled={saving} onClick={()=>void changeAppointmentStatus(selectedAppointmentRecord.id,"cancelled")}>Cancel</button></div>}<button className="drawer-more" onClick={()=>flash(selectedAppointmentRecord ? "Every change is saved in appointment history." : "This is an example appointment.")}>Appointment history ···</button></aside>}
              {newAppointmentOpen&&<div className="appointment-modal-backdrop" onClick={()=>setNewAppointmentOpen(false)}><form className="appointment-modal" onClick={(e)=>e.stopPropagation()} onSubmit={(e)=>{e.preventDefault();void createAppointment()}}><button type="button" className="drawer-close" onClick={()=>setNewAppointmentOpen(false)}>×</button><span>NEW APPOINTMENT</span><h2>Add to your calendar</h2><label>Client<input required value={appointmentDraft.client} onChange={(e)=>setAppointmentDraft({...appointmentDraft,client:e.target.value})} placeholder="Search or enter a client" /></label><label>Service<select value={appointmentDraft.service} onChange={(e)=>{const item=serviceCatalog.find(service=>service.name===e.target.value);setAppointmentDraft({...appointmentDraft,service:e.target.value,duration:item?durationOptionsFor(item)[0]:appointmentDraft.duration})}}>{(["Braiders","Weave/Wigs","Barbers","Locticians"] as const).map(category=><optgroup key={category} label={category}>{serviceCatalog.filter(service=>service.category===category).map(service=><option key={`${category}-${service.name}`}>{service.name}</option>)}</optgroup>)}</select></label><div><label>Duration<select value={appointmentDraft.duration} onChange={(e)=>setAppointmentDraft({...appointmentDraft,duration:e.target.value})}>{durationOptionsFor(serviceCatalog.find(service=>service.name===appointmentDraft.service)||serviceCatalog[0]).map(duration=><option key={duration}>{duration}</option>)}</select></label><label>Start time<select value={appointmentDraft.time} onChange={(e)=>setAppointmentDraft({...appointmentDraft,time:e.target.value})}>{times.map(time=><option key={time}>{time}</option>)}</select></label></div><label>Date<input type="date" value={appointmentDraft.date} onChange={(e)=>setAppointmentDraft({...appointmentDraft,date:e.target.value})} /></label><aside>BookKit checks this owner’s saved appointments before confirming the time.</aside><button className="create-appointment" disabled={saving} type="submit">{saving ? "Saving…" : "Create appointment"}</button></form></div>}
            </section>}
            {dashTab === "Services" && <section className="services-workspace">
              <div className="service-work-head"><div><span>YOUR MENU</span><h2>{starterServices.length} active services</h2><p>Edit details, require a consultation, or change what clients can book.</p></div><button onClick={()=>{setView("setup");setSetupPath("pro");setAccountReady(true);setSetupStep(4)}}>＋ Add service</button></div>
              <div className="owner-service-menu">
                {starterServices.map((service,i)=>{
                  const details=parseMenuService(service);
                  const serviceName=details.name;
                  const enabled=serviceAddons[serviceName] || [];
                  const addonsOpen=addonServiceName===serviceName;
                  return <article className={`owner-service-card ${addonsOpen?"addons-open":""}`} key={`${service}-${i}`}>
                    <div className="owner-service-row">
                      <i>⋮⋮</i>
                      <div><strong>{serviceName}</strong><span>{details.duration || "Duration not set"} · ${details.price} · Online booking on</span></div>
                      {service.toLowerCase().includes("consult")&&<em>Consultation</em>}
                      <button className="service-addon-toggle" onClick={()=>setAddonServiceName(addonsOpen?"":serviceName)}><span>{enabled.length?`${enabled.length} add-ons`:"Add add-ons"}</span><b>{addonsOpen?"−":"＋"}</b></button>
                      <button className="service-edit-button" onClick={()=>{setEditingService(i);setView("setup");setSetupPath("pro");setAccountReady(true);setSetupStep(4)}}>Edit</button>
                    </div>
                    {addonsOpen&&<div className="inline-addon-manager">
                      <div className="owner-addon-head">
                        <div><span>OPTIONAL FOR THIS SERVICE</span><h3>Add-ons for {serviceName}</h3><p>Turn on only the extras clients may add to this appointment.</p></div>
                        <b>{enabled.length} active</b>
                      </div>
                      {enabled.length>0&&<div className="enabled-addon-strip">{enabled.map(name=><span key={name}>✓ {name}</span>)}</div>}
                      <div className="addon-library-label"><span>{addonCategoryForService(serviceName)}</span><small>Common add-ons for this service</small></div>
                      <div className="owner-addon-grid">{ownerAddonCatalog.filter(addon=>addon.categories.includes("Universal")||addon.categories.includes(addonCategoryForService(serviceName))).map(addon=>{
                        const active=enabled.includes(addon.name);
                        return <div className={`owner-addon-option ${active?"active":""}`} key={addon.name}><button className="owner-addon-switch" aria-pressed={active} onClick={()=>setServiceAddons(current=>{
                          const existing=current[serviceName] || [];
                          return {...current,[serviceName]:active?existing.filter(name=>name!==addon.name):[...existing,addon.name]};
                        })}><i>{active?"✓":"+"}</i><span><strong>{addon.name}</strong><small>{addon.note}</small></span><em>+${addon.price}<small>{addon.minutes?`+${addon.minutes} min`:"No added time"}</small></em></button>{addon.custom&&<button className="remove-addon-option" aria-label={`Remove ${addon.name}`} onClick={()=>{
                          setOwnerAddonCatalog(current=>current.filter(item=>item.name!==addon.name));
                          setServiceAddons(current=>Object.fromEntries(Object.entries(current).map(([name,items])=>[name,items.filter(item=>item!==addon.name)])));
                          flash(`${addon.name} removed.`);
                        }}>Remove</button>}</div>;
                      })}</div>
                      <button type="button" className="create-custom-addon" onClick={()=>{setView("setup");setSetupPath("pro");setAccountReady(true);setSetupStep(4);setEditingService(i);setCustomAddonService(serviceName);}}>＋ Create a custom add-on</button>
                      <aside><b>What the client sees:</b> Optional add-ons appear after this service is selected. Their choices automatically update the price and appointment length.</aside>
                    </div>}
                  </article>;
                })}
              </div>
            </section>}
            {dashTab === "Clients" && <section className="crm-workspace">
              <div className="crm-head"><div><span>CLIENT BOOK</span><h2>Relationships, not just appointments.</h2><p>History, notes, preferences, forms, and rebooking live together.</p></div><div className="crm-search"><input value={clientQuery} onChange={(e)=>setClientQuery(e.target.value)} placeholder="Search clients…" /><button onClick={()=>flash("New clients are created when an appointment is saved.")}>＋ Add client</button></div></div>
              <div className="crm-layout">
                <div className="client-list">
                  {productionClients.filter(client=>client.name.toLowerCase().includes(clientQuery.toLowerCase())).map(client=><button key={client.id} className={selectedClient?.id===client.id?"active":""} onClick={()=>{setSelectedClientId(client.id);setClientNoteDraft(client.notes||"")}}><span className="client-photo">{client.name[0]}</span><span><strong>{client.name}</strong><small>{client.visit_count ? `${client.visit_count} visits` : "New client"} · {(client.photos || []).length} photos</small></span><em>{client.last_visit_at ? `Last ${new Date(client.last_visit_at).toLocaleDateString()}` : "No completed visit"} ›</em></button>)}
                  {!productionClients.length&&<div className="empty-client-book"><strong>No clients yet</strong><p>Create the first real appointment and BookKit will build the client record automatically.</p></div>}
                </div>
                {selectedClient?<aside className="client-detail"><div className="client-detail-top"><span className="client-photo large">{selectedClient.name[0]}</span><div><small>PRIVATE CLIENT RECORD</small><h3>{selectedClient.name}</h3><p>{selectedClient.phone || "No phone"} · {selectedClient.email || "No email"}</p></div><label className="client-photo-upload"><input type="file" accept="image/*" disabled={uploadingPhoto} onChange={event=>void uploadClientPhoto(event.target.files?.[0])}/>{uploadingPhoto?"Uploading…":"＋ Add photo"}</label></div>
                  <div className="client-metrics"><div><span>VISITS</span><strong>{selectedClient.visit_count}</strong></div><div><span>APPOINTMENTS</span><strong>{selectedClientHistory.length}</strong></div><div><span>PHOTOS</span><strong>{(selectedClient.photos || []).length}</strong></div></div>
                  <div className="client-note"><span>PRIVATE NOTE</span><textarea value={clientNoteDraft} onChange={event=>setClientNoteDraft(event.target.value)} placeholder="Preferences, sensitivities, formulas, and care notes…"/><button disabled={saving} onClick={()=>void saveClientNote()}>{saving?"Saving…":"Save note"}</button></div>
                  {(selectedClient.photos || []).length>0&&<div className="client-photo-records"><span>PRIVATE PHOTOS</span><div>{selectedClient.photos!.map(photo=><article key={photo.id}><i>▧</i><strong>{photo.purpose}</strong><small>Stored privately</small></article>)}</div></div>}
                  <div className="client-history"><span>APPOINTMENT HISTORY</span>{selectedClientHistory.map(appointment=><article key={appointment.id}><b>{appointment.appointment_date}</b><div><strong>{appointment.service_name}</strong><small>{appointment.status.replace("_"," ")} · {appointment.start_time}</small></div></article>)}{!selectedClientHistory.length&&<p>No appointments saved for this client yet.</p>}</div>
                </aside>:<aside className="client-detail empty-detail"><strong>Select or create a client</strong><p>Private notes, photos, and appointment history will appear here.</p></aside>}
              </div>
            </section>}
            {dashTab === "Automations" && <section className="essentials-workspace">
              <div className="essentials-head">
                <div><span>BOOKING ESSENTIALS</span><h2>The follow-up runs itself.</h2><p>These are the Calendly and Acuity fundamentals every serious booking business needs.</p></div>
                <button disabled={saving} onClick={()=>void saveSchedulingSettings()}>{saving ? "Saving…" : "Save changes"}</button>
              </div>
              <div className="essential-status">
                <article><i className={schedulingSettings.googleCalendar||schedulingSettings.outlookCalendar?"ready":""}>1</i><div><span>CALENDAR</span><strong>{schedulingSettings.googleCalendar||schedulingSettings.outlookCalendar?"Connected":"Connection needed"}</strong><small>Two-way conflict protection</small></div></article>
                <article><i>2</i><div><span>REMINDERS</span><strong>Delivery provider needed</strong><small>Message rules are saved; sending is not connected</small></div></article>
                <article><i className="ready">3</i><div><span>SELF-SERVICE</span><strong>Client controls ready</strong><small>Reschedule and cancel without calling</small></div></article>
              </div>
              <div className="essential-grid">
                <article className="integration-card">
                  <div className="essential-title"><span>01 · CALENDAR SYNC</span><h3>One schedule, everywhere.</h3><p>BookKit checks connected calendars before showing a time and adds confirmed bookings automatically.</p></div>
                  <button onClick={()=>flash("Google Calendar connection requires BookKit’s Google OAuth credentials.")}><b className="google-g">G</b><span><strong>Google Calendar</strong><small>Provider connection required</small></span><em>＋</em></button>
                  <button onClick={()=>flash("Outlook connection requires BookKit’s Microsoft OAuth credentials.")}><b className="outlook-o">O</b><span><strong>Outlook Calendar</strong><small>Provider connection required</small></span><em>＋</em></button>
                  <label className="essential-toggle"><span><strong>Prevent double-booking</strong><small>Hide times busy on any connected calendar</small></span><input type="checkbox" checked={schedulingSettings.preventConflicts} onChange={e=>setSchedulingSettings({...schedulingSettings,preventConflicts:e.target.checked})}/><i/></label>
                </article>
                <article>
                  <div className="essential-title"><span>02 · MESSAGES</span><h3>Confirm. Remind. Protect.</h3><p>Send branded updates automatically so clients know exactly where to be and when.</p></div>
                  {[["emailConfirmation","Email confirmation","Immediately after booking"],["smsConfirmation","Text confirmation","Immediately after booking"],["reminder24h","24-hour reminder","Includes manage-booking link"],["reminder2h","2-hour reminder","Final arrival reminder"]].map(row=><label className="essential-toggle" key={row[0]}><span><strong>{row[1]}</strong><small>{row[2]}</small></span><input type="checkbox" checked={Boolean(schedulingSettings[row[0] as keyof typeof schedulingSettings])} onChange={e=>setSchedulingSettings({...schedulingSettings,[row[0]]:e.target.checked})}/><i/></label>)}
                  <button className="message-preview" onClick={()=>flash("Reminder preview opened.")}>Preview client message →</button>
                </article>
                <article>
                  <div className="essential-title"><span>03 · CLIENT CONTROLS</span><h3>No back-and-forth.</h3><p>Every confirmation includes a secure link where the client can manage the appointment.</p></div>
                  <label className="essential-toggle"><span><strong>Allow rescheduling</strong><small>Client chooses another valid opening</small></span><input type="checkbox" checked={schedulingSettings.clientReschedule} onChange={e=>setSchedulingSettings({...schedulingSettings,clientReschedule:e.target.checked})}/><i/></label>
                  <label className="essential-toggle"><span><strong>Allow cancellation</strong><small>Policy and deposit rules still apply</small></span><input type="checkbox" checked={schedulingSettings.clientCancel} onChange={e=>setSchedulingSettings({...schedulingSettings,clientCancel:e.target.checked})}/><i/></label>
                  <div className="essential-fields"><label>Minimum notice<select value={schedulingSettings.minimumNoticeHours} onChange={e=>setSchedulingSettings({...schedulingSettings,minimumNoticeHours:Number(e.target.value)})}><option value={12}>12 hours</option><option value={24}>24 hours</option><option value={48}>48 hours</option><option value={72}>72 hours</option></select></label><label>Book ahead<select value={schedulingSettings.bookingWindowDays} onChange={e=>setSchedulingSettings({...schedulingSettings,bookingWindowDays:Number(e.target.value)})}><option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option><option value={180}>6 months</option></select></label></div>
                </article>
                <article className="beauty-edge">
                  <div className="essential-title"><span>04 · BOOKKIT ADVANTAGE</span><h3>Beyond generic scheduling.</h3><p>The booking fundamentals stay simple. Beauty-specific details appear only when the service needs them.</p></div>
                  <div className="edge-pills"><span>Deposits</span><span>Consultations</span><span>Hair included</span><span>Style add-ons</span><span>Inspiration photos</span><span>Prep instructions</span></div>
                  <button onClick={()=>setDashTab("Services")}>Edit service workflows →</button>
                </article>
              </div>
            </section>}
            {dashTab === "Money" && <section className="money-workspace">
              <div className="payment-command"><div><span>BOOKKIT PAYMENTS</span><h2>Money without the mystery.</h2><p>Set booking payment rules, track every charge, and see exactly when funds become available.</p></div><div className={`connection-status ${paymentConnected ? "connected" : ""}`}><i>{paymentConnected ? "✓" : "!"}</i><span><strong>{paymentConnected ? "Test account ready" : "Payments not connected"}</strong><small>{paymentConnected ? "Safe testing · live payouts off" : "Connect Stripe before accepting money"}</small></span><button onClick={()=>setPaymentPanel("setup")}>{paymentConnected ? "Manage" : "Connect Stripe"}</button></div></div>
              <div className="payment-tabs">{(["overview","setup","rules","payouts"] as const).map(tab=><button key={tab} className={paymentPanel===tab?"active":""} onClick={()=>setPaymentPanel(tab)}>{tab==="overview"?"Overview":tab==="setup"?"Get paid":tab==="rules"?"Booking rules":"Payouts"}</button>)}</div>
              {paymentPanel === "overview" && <>
              <div className="money-summary"><div><span>AVAILABLE PAYOUT</span><strong>{paymentConnected ? "$1,284.50" : "$0.00"}</strong><small>{paymentConnected ? "Demonstration balance · live payouts off" : "Connect payments to begin accepting deposits"}</small><button onClick={()=>setPaymentPanel("payouts")}>View payouts</button></div><div className="revenue-ring"><b>$4.8k</b><span>July revenue</span></div></div>
              <div className="money-cards"><article><span>GROSS SALES</span><strong>$4,860</strong><em>↑ 18% this month</em></article><article><span>DEPOSITS HELD</span><strong>$420</strong><em>14 upcoming bookings</em></article><article><span>TIPS</span><strong>$386</strong><em>8.6% average</em></article><article><span>REFUNDS</span><strong>$0</strong><em>No issues this month</em></article></div>
              <div className="transactions"><div className="transactions-head"><div><span>RECENT ACTIVITY</span><h2>Payments and deposits</h2></div><button onClick={()=>flash("Report exported.")}>Export report</button></div>
                {paymentTransactions.map(row=><article key={row.id}><span>{new Date(row.created_at).toLocaleDateString()}</span><div><strong>{row.client_name}</strong><small>{row.service_name} · {row.kind} · Test</small></div><b>+${(row.amount/100).toFixed(2)}</b></article>)}
                {[["Today, 2:31 PM","Tia Moore","Retwist & Style","Service + tip","+$165.00"],["Today, 9:02 AM","Jasmine Reed","Knotless Braids","Deposit","+$30.00"],["Yesterday","Aaliyah Price","Box Braids","Service + tip","+$245.00"],["Jul 26","Monique Lewis","Loc consultation","Consultation","+$20.00"]].map(row=><article key={row[0]+row[1]}><span>{row[0]}</span><div><strong>{row[1]}</strong><small>{row[2]} · {row[3]}</small></div><b>{row[4]}</b></article>)}
              </div>
              </>}
              {paymentPanel === "setup" && <div className="payment-setup"><div className="payment-setup-copy"><span>STRIPE CONNECT</span><h2>Connect once. Get paid everywhere.</h2><p>Stripe securely verifies the business owner, links a bank account, and routes deposits, full payments, refunds, tips, and payouts for that business.</p><ul><li><b>Identity verification</b><span>Handled securely by Stripe</span></li><li><b>Bank payouts</b><span>Each business receives its own balance</span></li><li><b>BookKit protection</b><span>No raw card or banking data stored here</span></li></ul></div><div className="connect-card"><div className="stripe-lock">S</div><span>{paymentConnected ? "TEST CONNECTION READY" : "CONNECT YOUR BUSINESS"}</span><h3>{paymentConnected ? "Safe testing is on." : "Start accepting secure payments."}</h3><p>{paymentConnected ? "You can test deposits and transaction records. Live charges and payouts stay disabled." : "The live version opens Stripe’s secure onboarding for identity and bank verification."}</p><button disabled={saving || paymentConnected} onClick={()=>void savePaymentSettings(true)}>{paymentConnected ? "Connected in test mode ✓" : saving ? "Connecting…" : "Connect Stripe test account →"}</button><small>Live activation will require BookKit’s Stripe platform credentials.</small></div></div>}
              {paymentPanel === "rules" && <div className="payment-rules"><div className="rules-head"><div><span>DEFAULT BOOKING RULE</span><h2>Choose how clients secure time.</h2></div><button disabled={saving} onClick={()=>void savePaymentSettings(false)}>{saving ? "Saving…" : "Save rules"}</button></div><div className="rule-options">{[["no_payment","No payment","Book without collecting money"],["card_hold","Card on file","Protect against late cancellations"],["fixed_deposit","Fixed deposit","Collect the same amount per booking"],["full_payment","Full payment","Charge the full service price"]].map(rule=><button key={rule[0]} className={paymentRule===rule[0]?"active":""} onClick={()=>setPaymentRule(rule[0])}><i>{paymentRule===rule[0]?"✓":"○"}</i><span><strong>{rule[1]}</strong><small>{rule[2]}</small></span></button>)}</div><div className="rule-fields"><label>Default deposit amount<div><span>$</span><input type="number" min="0" value={depositAmount/100} onChange={e=>setDepositAmount(Math.round(Number(e.target.value)*100))}/></div></label><label>Cancellation window<select value={cancellationHours} onChange={e=>setCancellationHours(Number(e.target.value))}><option value={12}>12 hours</option><option value={24}>24 hours</option><option value={48}>48 hours</option><option value={72}>72 hours</option></select></label></div><aside>Individual services can override this default with a percentage deposit, full prepayment, pay-later, or no-show card hold.</aside></div>}
              {paymentPanel === "payouts" && <div className="payout-workspace"><div className="payout-card"><span>NEXT PAYOUT</span><strong>{paymentConnected ? "$1,284.50" : "$0.00"}</strong><p>{paymentConnected ? "Demonstration only · live bank payouts are off" : "Connect and verify a bank account to receive payouts."}</p><button onClick={()=>setPaymentPanel("setup")}>{paymentConnected ? "Manage connected account" : "Connect payment account"}</button></div><div className="payout-timeline"><span>PAYOUT ACTIVITY</span><article><i>✓</i><div><strong>Payment collected</strong><small>Client checkout · funds enter the business balance</small></div></article><article><i>2</i><div><strong>Processing</strong><small>Provider completes settlement and risk checks</small></div></article><article><i>3</i><div><strong>Bank payout</strong><small>Net funds arrive in the connected bank account</small></div></article></div></div>}
            </section>}
            {dashTab === "Marketing" && <section className="marketing-workspace">
              <div className="marketing-hero">
                <div><span>SMART REBOOKING</span><h2>Your next appointments are already in your client book.</h2><p>BookKit finds clients due to return, open times worth filling, and the right people to contact—without training you to discount every service.</p><button onClick={()=>setCampaignReady(true)}>{campaignReady ? "Campaign ready ✓" : "Build a rebooking campaign →"}</button></div>
                <div className="campaign-orbit"><strong>17</strong><span>clients ready<br/>to rebook</span></div>
              </div>
              <div className="marketing-grid">
                <article><i>01</i><span>OPEN-TIME BOOST</span><h3>Fill Thursday at 2:30 PM.</h3><p>Six returning clients usually book services that fit this opening.</p><button onClick={()=>flash("Six matching clients selected.")}>See matching clients →</button></article>
                <article><i>02</i><span>REVIEW REQUESTS</span><h3>Turn great visits into trust.</h3><p>Four completed appointments have not received a review request yet.</p><button onClick={()=>flash("Four review requests prepared.")}>Send 4 requests →</button></article>
                <article><i>03</i><span>SHARE YOUR WORK</span><h3>One service link. Every channel.</h3><p>Prepare a booking link for Instagram, TikTok, text, email, or a QR code.</p><button onClick={()=>flash("Share kit opened.")}>Create share kit →</button></article>
              </div>
              {campaignReady && <div className="campaign-builder"><div><span>AUDIENCE</span><strong>17 clients due in the next 14 days</strong></div><div><span>MESSAGE</span><strong>“It may be time for your next appointment…”</strong></div><div><span>SEND WITH</span><strong>Text + email</strong></div><button onClick={()=>flash("Demo campaign scheduled.")}>Schedule campaign</button></div>}
            </section>}
            {dashTab === "Profile" && <section className="profile-builder-workspace">
              <div className="profile-builder-top">
                <div><span>PUBLIC WEBSITE</span><h2>Build once. Book everywhere.</h2><p>BookKit has already used your setup answers to create a complete starting page.</p></div>
                <div className="profile-publish-actions"><small>{!dataReady ? "Loading…" : profileDirty ? "Unsaved changes" : profilePublished ? "Published" : "Draft"}</small><button disabled={saving} onClick={()=>void saveProfile(false)}>Save draft</button><button disabled={saving} className="publish-button" onClick={()=>void saveProfile(true)}>{saving ? "Saving…" : profilePublished ? "Update site" : "Publish site"}</button></div>
              </div>
              <div className="profile-editor-tabs" aria-label="Booking page editor">
                {([["Content","Page content"],["Templates","Page style"],["Design","Colors"],["Settings","Link & search"]] as const).map(([tab,label])=><button key={tab} className={profileEditor===tab?"active":""} onClick={()=>setProfileEditor(tab)}><strong>{label}</strong><small>{tab==="Content"?"Name and photos":tab==="Templates"?"Choose a template":tab==="Design"?"Brand appearance":"URL and Google"}</small></button>)}
              </div>
              <div className="profile-builder-grid">
                <aside className="profile-control-panel">
                  {profileEditor === "Content" && <>
                    <div className="panel-intro"><span>YOUR BOOKING PAGE</span><h3>Make it yours</h3><p>Update your identity and message. Services, hours, policies, team and booking rules stay connected automatically.</p></div>
                    <label className="profile-upload"><input type="file" accept="image/*" onChange={e=>loadProfileImage(e.target.files?.[0],"logo")}/><i>{profileLogo?<img src={profileLogo} alt="Business logo"/>:"＋"}</i><span><strong>Logo or profile photo</strong><small>Square image · shown beside your name</small></span></label>
                    <label className="profile-upload banner-upload"><input type="file" accept="image/*" onChange={e=>loadProfileImage(e.target.files?.[0],"banner")}/><i>▧</i><span><strong>Banner image or video cover</strong><small>Wide image · 1600 × 900 recommended</small></span></label>
                    <label className="builder-field">Business name<input value={profileName} onChange={e=>{setProfileName(e.target.value);setProfileDirty(true)}}/></label>
                    <label className="builder-field">Headline<textarea value={profileTagline} onChange={e=>{setProfileTagline(e.target.value);setProfileDirty(true)}}/></label>
                    <div className="autofill-card"><b>✓</b><div><strong>Already added from setup</strong><p>6 services, business hours, booking policies, Buffalo location, and contact details.</p></div></div>
                  </>}
                  {profileEditor === "Templates" && <>
                    <div className="panel-intro"><span>4 PREMIUM DESIGNS</span><h3>Choose your page style</h3><p>Each design uses the same proven booking flow. Switch styles without losing any business information.</p></div>
                    <div className="template-picker visual premium-four">
                      {[
                        ["The Editorial","#171717","Large photography · refined type"],
                        ["The Luxe","#8b6848","Warm, elegant · high-touch"],
                        ["The Studio","#233a67","Clean, modern · service-first"],
                        ["The Social","#c64f52","Bold media · mobile-first"],
                      ].map(([name,color,copy],i)=><button key={name} className={pageTemplate===name?"active":""} onClick={()=>{setPageTemplate(name);setPageMode("template");setProfileDirty(true)}}><i style={{background:color}}/><span><strong>{name}</strong><small>{copy}</small></span><b>{pageTemplate===name?"✓":String(i+1).padStart(2,"0")}</b></button>)}
                    </div>
                    <div className="layout-guardrail">
                      <b>✓</b><div><strong>Protected premium layout</strong><p>Clients always see services, live availability, policies and a Book button in the right order.</p></div>
                    </div>
                  </>}
                  {profileEditor === "Design" && <>
                    <div className="panel-intro"><span>BRAND SYSTEM</span><h3>Make it feel like you</h3><p>BookKit keeps every combination readable and mobile-ready.</p></div>
                    <div className="design-control"><strong>Brand color</strong><input type="color" value={themeColor} onChange={(e)=>{setThemeColor(e.target.value);setProfileDirty(true)}} /></div>
                    <div className="design-control stack"><strong>Page background</strong><div>{(["light","warm","dark"] as const).map(x=><button key={x} className={profileBackground===x?"active":""} onClick={()=>{setProfileBackground(x);setProfileDirty(true)}}>{x}</button>)}</div></div>
                    <div className="accessibility-check"><b>AA</b><div><strong>Accessible color check passed</strong><small>Text and buttons remain easy to read.</small></div></div>
                  </>}
                  {profileEditor === "Settings" && <>
                    <div className="panel-intro"><span>PAGE SETTINGS</span><h3>Link, search & sharing</h3><p>Control how clients find and share your page.</p></div>
                    <label className="builder-field">BookKit URL<div className="slug-input"><span>bookkit.site/</span><input value={profileSlug} onChange={e=>{setProfileSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""));setProfileDirty(true)}}/></div></label>
                    <label className="builder-field">Search title<input value={`${profileName} | Book Online`} readOnly/></label>
                    <label className="builder-field">Search description<textarea value={`${profileTagline} View services, availability, reviews, and book online.`} readOnly/></label>
                    <div className="profile-settings-note"><b>✓</b><div><strong>Ready to share</strong><small>Your page title, description, and booking link update automatically when you publish.</small></div></div>
                  </>}
                </aside>
                <div className="profile-preview-stage">
                  <div className="preview-toolbar"><div><button className={previewDevice==="desktop"?"active":""} onClick={()=>setPreviewDevice("desktop")}>▱ Desktop</button><button className={previewDevice==="mobile"?"active":""} onClick={()=>setPreviewDevice("mobile")}>▯ Mobile</button></div><span>Live preview</span><button onClick={()=>setView("business")}>Open full page ↗</button></div>
                  <div className={`website-preview ${previewDevice} ${profileBackground} template-${pageTemplate.toLowerCase().replaceAll(" ","-")}`} style={{"--profile-color":themeColor} as React.CSSProperties}>
                    <div className="preview-browser"><i/><i/><i/><span>bookkit.site/{profileSlug} · {pageTemplate}</span></div>
                    <div className="preview-cover"><img src={profileBanner} alt="Business banner" /><div className="preview-nav"><strong>{profileLogo?<img src={profileLogo} alt=""/>:profileName.split(" ").map(x=>x[0]).join("").slice(0,2)}</strong><span>Services&nbsp;&nbsp; Portfolio&nbsp;&nbsp; About&nbsp;&nbsp; Reviews</span><button>Book now</button></div><div className="preview-title"><small>BUFFALO · APPOINTMENT ONLY</small><h2>{profileName || "Your Business"}</h2><p>{profileTagline}</p><div><button onClick={()=>setView("business")}>Book appointment</button><span>★ 4.9 · 127 reviews</span></div></div></div>
                    {profileSections.filter(x=>x!=="Hero").map(section=>section==="Services"?<div className="preview-body" key={section}><span>FEATURED SERVICES</span><h3>Choose your next appointment.</h3><div>{starterServices.slice(0,3).map((x,i)=><article key={x}><b>0{i+1}</b><strong>{x.split(" · ")[0]}</strong><span>{x.split(" · ")[1] || "View details"} →</span></article>)}</div></div>:<section className="mini-preview-section" key={section}><span>{section.toUpperCase()}</span><h3>{section==="Portfolio"?"Work worth showing.":section==="About"?"Care, craft, and experience.":section==="Reviews"?"Loved by returning clients.":section==="Location & hours"?"Plan your visit.":`${section}, built into your page.`}</h3><p>{section==="About"?"Your setup information automatically becomes a polished business story.":section==="Reviews"?"★★★★★ “Beautiful work and an easy booking experience.”":"This section is ready to customize with your business content."}</p></section>)}
                    <button className="preview-sticky-book">Book now</button>
                  </div>
                </div>
              </div>
            </section>}
            {dashTab === "Booking channels" && <section className="channels-workspace">
              <div className="channel-head"><div><span>BOOK EVERYWHERE</span><h2>One calendar. Your link everywhere.</h2><p>Share your booking page or install BookKit on your existing website without creating separate schedules, services, or availability.</p></div><div className="sync-badge"><i /> Live sync on</div></div>
              <div className="channel-cards">
                <article className="featured-channel"><div className="channel-icon page">↗</div><div><strong>Your booking link</strong><p>Ready now. Share it on social media, texts, Google, email, or QR codes. No landing page required.</p><button onClick={()=>void navigator.clipboard.writeText(`https://bookkit.site/${profileSlug}`).then(()=>flash("Booking link copied."))}>Copy booking link</button></div></article>
                <article><div className="channel-icon embed">&lt;/&gt;</div><div><strong>Add to an existing website <em>Optional</em></strong><p>Use a button, pop-up, or embedded booking panel on Wix, Squarespace, Shopify, WordPress, or another site.</p><button onClick={()=>flash("Website installer opened.")}>Website options</button></div></article>
              </div>
              <div className="embed-builder">
                <div className="embed-controls"><span>WEBSITE INSTALLER</span><h3>Choose how BookKit appears.</h3><p>Your services, colors, staff, policies, and availability update automatically.</p>
                  <div className="embed-options">{(["button","popup","inline"] as const).map(x=><button key={x} className={embedStyle===x?"active":""} onClick={()=>setEmbedStyle(x)}><b>{x==="button"?"Book now button":x==="popup"?"Booking pop-up":"Full inline booking"}</b><small>{x==="button"?"Opens your booking page":x==="popup"?"Books without leaving the site":"Lives inside a page section"}</small></button>)}</div>
                  <label>Button label<input defaultValue="Book an appointment"/></label>
                  <div className="install-actions"><button onClick={()=>flash("Embed code copied.")}>Copy install code</button><button onClick={()=>flash("Instructions ready to send.")}>Email to web designer</button></div>
                </div>
                <div className="embed-preview"><div className="fake-site-nav"><strong>YOUR BUSINESS</strong><span>Services&nbsp;&nbsp; About&nbsp;&nbsp; Contact</span></div><div className="fake-site-copy"><small>EXPERT CARE · PERSONAL SERVICE</small><h3>Look good.<br/>Feel like yourself.</h3><p>A sample of how BookKit booking fits naturally into an existing business website.</p><button>{embedStyle==="inline"?"Choose a service":"Book an appointment"}</button></div>{embedStyle==="popup"&&<div className="mini-booker"><span>BOOK WITH US</span><strong>What would you like to book?</strong><button>Browse services →</button></div>}{embedStyle==="inline"&&<div className="inline-booker"><b>Popular services</b><span>Knotless braids <em>4 hr 30 min →</em></span><span>Retwist & style <em>2 hr 15 min →</em></span></div>}</div>
              </div>
            </section>}
          </div>
        </section>
      )}

      {view === "setup" && <div className="setup-footer">
        <div>$1B$2ookKit$3<p>Your booking page. Your clients. Your business.</p></div>
        <nav aria-label="Setup help"><button onClick={() => openInfo("support")}>Support</button><button onClick={() => openInfo("contact")}>Contact</button><button onClick={() => openInfo("privacy")}>Privacy</button><button onClick={() => openInfo("terms")}>Terms</button></nav>
        <span>© 2026 BookKit</span>
      </div>}

      {view !== "setup" && view !== "dashboard" && <footer className="site-footer">
        <div className="footer-lead">
          <div className="brand light">$1B$2ookKit$3</div>
          <h2>Built for the people<br />behind the chair.</h2>
          <p>Bookings, deposits, reminders, clients, and the whole business—together in one place made for hair professionals.</p>
          <button onClick={() => setView("setup")}>Get your booking link →</button>
        </div>
        <div className="footer-links">
          <div><span>PRODUCT</span><button onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}>Features</button><button onClick={() => setView("business")}>Sample booking page</button><button onClick={() => setView("setup")}>Create account</button><button onClick={() => setView("setup")}>Log in</button></div>
          <div><span>SUPPORT</span><button onClick={() => openInfo("support")}>Support center</button><button onClick={() => openInfo("contact")}>Contact</button><button onClick={() => openInfo("privacy")}>Privacy</button><button onClick={() => openInfo("terms")}>Terms</button></div>
        </div>
        <div className="footer-bottom"><span>© 2026 BookKit</span><span>Your clients. Your rules. Your business.</span></div>
      </footer>
      }

      {view !== "setup" && view !== "dashboard" && <nav className="mobile-nav">
        <button onClick={() => setView("discover")}>⌂<span>Product</span></button>
        <button onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}>✦<span>Features</span></button>
        <button onClick={() => setView("setup")}>＋<span>Get started</span></button>
        <button onClick={() => setView("business")}>▦<span>Sample page</span></button>
      </nav>}
    </main>
  );
}
