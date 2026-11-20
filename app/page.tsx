"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createListing, isConfigured, loadListings, type Listing } from "./supabase";

const categories = ["All items", "Furniture", "Electronics", "Home & garden", "Fashion", "Sports"];
const samples: Listing[] = [
  { id: "demo-1", title: "The Sunday lounge chair", description: "A little mid-century magic. Solid oak frame, lovely linen upholstery, and the best reading nook in the house. Excellent condition.", price: 285, category: "Furniture", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-16T10:00:00Z" },
  { id: "demo-2", title: "Film camera, ready to shoot", description: "A dependable 35mm point-and-shoot with a sharp lens. Comes with a strap and fresh batteries. Tested and working perfectly.", price: 140, category: "Electronics", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-15T10:00:00Z" },
  { id: "demo-3", title: "Hand-thrown breakfast set", description: "Four speckled stoneware pieces, made by hand in a tiny studio. Dishwasher safe, and each one is a little different.", price: 68, category: "Home & garden", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-14T10:00:00Z" },
  { id: "demo-4", title: "Everyday leather tote", description: "Soft, sturdy leather with room for your laptop, a book, and everything else. Gently used and beautifully broken in.", price: 92, category: "Fashion", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-13T10:00:00Z" },
  { id: "demo-5", title: "A lamp for slow evenings", description: "Warm light, sculptural shape. This vintage lamp has a brass finish and includes a new linen shade.", price: 75, category: "Home & garden", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-12T10:00:00Z" },
  { id: "demo-6", title: "Weekend road bike", description: "Lightweight aluminum frame, recently tuned, ready for its next adventure. Fits riders around 5'6\" to 5'10\".", price: 320, category: "Sports", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=85", created_at: "2026-11-11T10:00:00Z" },
];

const money = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

function NewListing({ onClose, onCreated }: { onClose: () => void; onCreated: (listing: Listing) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = new FormData(event.currentTarget);
      const created = await createListing({ title: String(data.get("title")), description: String(data.get("description")), price: Number(data.get("price")), email: String(data.get("email")), category: String(data.get("category")), photo: data.get("photo") as File });
      onCreated(created); onClose();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save your listing."); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-heading"><div className="modal-top"><div><span className="eyebrow">PASS IT ON</span><h2 id="create-heading">List something lovely</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><p className="muted">Good things deserve a second chapter.</p><form onSubmit={submit} className="listing-form"><label className="photo-input"><span className="photo-icon">↥</span><strong>Add a photo</strong><span>JPG, PNG or WebP · up to 5 MB</span><input name="photo" type="file" accept="image/*" required /></label><div className="form-grid"><label>Item name<input name="title" placeholder="What are you selling?" required maxLength={90} /></label><label>Price (USD)<input name="price" type="number" min="1" step="0.01" placeholder="0.00" required /></label></div><label>Category<select name="category" required>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label>Description<textarea name="description" rows={3} placeholder="Tell its story…" required maxLength={1200} /></label><label>Your email<input name="email" type="email" placeholder="you@example.com" required /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark submit-button" disabled={busy}>{busy ? "Saving your listing…" : "Publish listing ↗"}</button></form></section></div>;
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>(samples);
  const [category, setCategory] = useState("All items");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [ready, setReady] = useState(false);
  useEffect(() => { loadListings().then((items) => { if (items) setListings(items); }).catch(() => {}).finally(() => setReady(true)); }, []);
  const filtered = useMemo(() => listings.filter((item) => (category === "All items" || item.category === category) && `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [listings, category, search]);
  return <main>
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">g</span> good<span className="brand-italic">again</span><span className="brand-period">.</span></Link><nav className="top-links"><a href="#browse">Browse</a><a href="#about">Our little idea</a></nav><button className="button button-dark header-button" onClick={() => setDialog(true)}>＋ <span>Sell an item</span></button></header>
    <section className="hero"><div className="hero-copy"><span className="eyebrow"><span className="eyebrow-dot"/> A MARKETPLACE FOR GOOD THINGS</span><h1>Good things<br/>find <em>new homes.</em></h1><p>Thoughtful finds, kind people, and the joy of passing something on. Welcome to your neighborhood’s favorite little marketplace.</p><a href="#browse" className="hero-link">Find your next favorite <span>↓</span></a></div><div className="hero-art"><img className="hero-photo" src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=90" alt="A sunlit room with thoughtfully collected furniture"/><div className="hero-sticker"><span>GOOD<br/>FINDS</span><i>✳</i></div><div className="hero-note">A little more loved<br/>with every new home <span>↗</span></div></div><div className="hero-index">01 <span>—</span> A BETTER WAY TO FIND</div></section>
    <section className="intro-strip" id="about"><span>NOT JUST SECONDHAND.</span><p>Second chances for the things we love. <em>And the people looking for them.</em></p><span className="intro-spark">✳</span></section>
    <section className="market" id="browse"><div className="section-heading"><div><span className="eyebrow">THE GOOD STUFF</span><h2>A fresh batch of <em>finds.</em></h2></div><span className="listing-count">{listings.length.toString().padStart(2,"0")} lovely things, and counting</span></div><div className="controls"><div className="tabs">{categories.map((item) => <button key={item} className={category === item ? "tab active" : "tab"} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="toolbar"><label className="search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find something…" aria-label="Search listings"/><kbd>⌘ K</kbd></label><div className="view-toggle"><button onClick={() => setView("grid")} className={view === "grid" ? "selected" : ""} aria-label="Grid view">▦</button><button onClick={() => setView("list")} className={view === "list" ? "selected" : ""} aria-label="List view">☰</button></div></div></div>
      {!isConfigured() && <div className="setup-note">You’re browsing a preview. Connect Supabase to publish listings and accept messages.</div>}
      {!ready && isConfigured() && <div className="loading-note">Gathering the good stuff…</div>}
      {filtered.length ? <div className={view === "grid" ? "listing-grid" : "listing-grid list-view"}>{filtered.map((item, index) => <Link href={`/listing/${item.id}`} className="listing-card" key={item.id}><div className="card-image"><img src={item.image_url} alt={item.title}/><span className="card-category">{item.category}</span><span className="card-number">0{index + 1}</span><span className="card-arrow">↗</span></div><div className="card-info"><h3>{item.title}</h3><span className="price">{money(item.price)}</span><p>{item.description}</p><span className="card-location">A GOOD FIND <i>·</i> JUST ADDED</span></div></Link>)}</div> : <div className="empty-state"><span>✳</span><h3>No finds just yet.</h3><p>Try another search or category. Your next favorite might be around the corner.</p><button onClick={() => {setSearch("");setCategory("All items");}}>Show everything ↗</button></div>}
      <div className="more-row"><span>THAT’S THE GOOD STUFF (FOR NOW)</span><button onClick={() => setDialog(true)}>Have something to pass on? <b>List it here ↗</b></button></div>
    </section><footer><Link className="brand" href="/"><span className="brand-mark">g</span> good<span className="brand-italic">again</span><span className="brand-period">.</span></Link><span>Made for things with more to give. <i>✳</i> 2026</span><a href="#">BACK TO THE TOP ↑</a></footer>
    {dialog && <NewListing onClose={() => setDialog(false)} onCreated={(item) => setListings((all) => [item, ...all])}/>}
  </main>;
}
