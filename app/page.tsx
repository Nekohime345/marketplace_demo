"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createListing, isConfigured, loadListings, type Listing } from "./supabase";

const categories = ["All items", "Furniture", "Electronics", "Home & garden", "Fashion", "Sports"];
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
  const [listings, setListings] = useState<Listing[]>([]);
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
      {!ready && isConfigured() && <div className="loading-note">Gathering the good stuff…</div>}
      {filtered.length ? <div className={view === "grid" ? "listing-grid" : "listing-grid list-view"}>{filtered.map((item, index) => <Link href={`/listing/${item.id}`} className="listing-card" key={item.id}><div className="card-image"><img src={item.image_url} alt={item.title}/><span className="card-category">{item.category}</span><span className="card-number">{String(index + 1).padStart(2, "0")}</span><span className="card-arrow">↗</span></div><div className="card-info"><h3>{item.title}</h3><span className="price">{money(item.price)}</span><p>{item.description}</p><span className="card-location">A GOOD FIND <i>·</i> JUST ADDED</span></div></Link>)}</div> : listings.length === 0 ? <div className="empty-state"><span>✳</span><h3>No listings yet.</h3><p>Be the first to pass something good along.</p><button onClick={() => setDialog(true)}>List the first item ↗</button></div> : <div className="empty-state"><span>✳</span><h3>No matching finds.</h3><p>Try a different search or category.</p><button onClick={() => {setSearch("");setCategory("All items");}}>Show all listings ↗</button></div>}
      <div className="more-row"><span>THAT’S THE GOOD STUFF (FOR NOW)</span><button onClick={() => setDialog(true)}>Have something to pass on? <b>List it here ↗</b></button></div>
    </section><footer><Link className="brand" href="/"><span className="brand-mark">g</span> good<span className="brand-italic">again</span><span className="brand-period">.</span></Link><span>Made for things with more to give. <i>✳</i> 2026</span><a href="#">BACK TO THE TOP ↑</a></footer>
    {dialog && <NewListing onClose={() => setDialog(false)} onCreated={(item) => setListings((all) => [item, ...all])}/>}
  </main>;
}
