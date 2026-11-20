"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { loadListing, saveMessage, type Listing } from "../../supabase";

const demos: Record<string, Listing> = {
  "demo-1": { id: "demo-1", title: "The Sunday lounge chair", description: "A little mid-century magic. Solid oak frame, lovely linen upholstery, and the best reading nook in the house. Excellent condition.", price: 285, category: "Furniture", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-16T10:00:00Z" },
  "demo-2": { id: "demo-2", title: "Film camera, ready to shoot", description: "A dependable 35mm point-and-shoot with a sharp lens. Comes with a strap and fresh batteries. Tested and working perfectly.", price: 140, category: "Electronics", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-15T10:00:00Z" },
  "demo-3": { id: "demo-3", title: "Hand-thrown breakfast set", description: "Four speckled stoneware pieces, made by hand in a tiny studio. Dishwasher safe, and each one is a little different.", price: 68, category: "Home & garden", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-14T10:00:00Z" },
  "demo-4": { id: "demo-4", title: "Everyday leather tote", description: "Soft, sturdy leather with room for your laptop, a book, and everything else. Gently used and beautifully broken in.", price: 92, category: "Fashion", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-13T10:00:00Z" },
  "demo-5": { id: "demo-5", title: "A lamp for slow evenings", description: "Warm light, sculptural shape. This vintage lamp has a brass finish and includes a new linen shade.", price: 75, category: "Home & garden", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-12T10:00:00Z" },
  "demo-6": { id: "demo-6", title: "Weekend road bike", description: "Lightweight aluminum frame, recently tuned, ready for its next adventure. Fits riders around 5'6\" to 5'10\".", price: 320, category: "Sports", email: "hello@example.com", image_url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=90", created_at: "2026-11-11T10:00:00Z" },
};

export default function ListingPage() {
  return <Suspense fallback={<div className="detail-loading">Finding the details…</div>}><ListingContent /></Suspense>;
}

function ListingContent() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Listing | null>(demos[id] ?? null);
  const [loading, setLoading] = useState(!demos[id]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { let live = true; loadListing(id).then((listing) => { if (live && listing) setItem(listing); }).catch(() => {}).finally(() => { if (live) setLoading(false); }); return () => { live = false; }; }, [id]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget);
    try { await saveMessage({ listing_id: id, buyer_email: String(data.get("buyer_email")), message: String(data.get("message")) }); setSent(true); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not send your message."); }
    finally { setBusy(false); }
  }
  return <main><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">g</span> good<span className="brand-italic">again</span><span className="brand-period">.</span></Link><Link className="back-link" href="/">← Back to the finds</Link><Link href="/#browse" className="button button-dark header-button">Browse finds ↗</Link></header>
    {loading ? <div className="detail-loading">Finding the details…</div> : !item ? <div className="detail-loading"><span>✳</span><h1>This find has moved on.</h1><Link href="/">Back to the marketplace ↗</Link></div> : <><div className="detail-breadcrumb"><Link href="/">HOME</Link><span>/</span>{item.category.toUpperCase()}<span>/</span><span>{item.title.toUpperCase()}</span></div><section className="detail-layout"><div className="detail-photo"><img src={item.image_url} alt={item.title}/><span className="photo-caption">A GOOD THING, READY FOR A NEW HOME <i>✳</i></span></div><div className="detail-copy"><span className="eyebrow"><span className="eyebrow-dot"/> {item.category.toUpperCase()} · PRE-LOVED</span><h1>{item.title}<em>.</em></h1><div className="detail-price">${Number(item.price).toLocaleString("en-US", { maximumFractionDigits: 2 })} <span>USD</span></div><div className="detail-rule"/><span className="eyebrow detail-label">A LITTLE ABOUT IT</span><p className="detail-description">{item.description}</p><div className="seller-card"><span className="seller-avatar">g</span><span><strong>A neighbor, just like you</strong><small>Thoughtfully passing it on</small></span><span className="seller-spark">✳</span></div><div className="message-box"><span className="eyebrow">MAKE IT YOURS</span><h2>Interested? <em>Say hello.</em></h2>{sent ? <div className="success-message"><span>✓</span><div><strong>Your message is on its way.</strong><small>The seller will get back to you soon.</small></div></div> : <form onSubmit={submit} className="message-form"><label>Your email<input type="email" name="buyer_email" placeholder="you@example.com" required /></label><label>Your message<textarea name="message" rows={3} placeholder="Hi! I’d love to know more about this…" required maxLength={1000}/></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark submit-button" disabled={busy}>{busy ? "Sending…" : "Message the seller ↗"}</button></form>}<p className="privacy-note">Your details are only shared with this seller.</p></div></div></section><footer className="detail-footer"><Link className="brand" href="/"><span className="brand-mark">g</span> good<span className="brand-italic">again</span><span className="brand-period">.</span></Link><span>Things with more to give. <i>✳</i></span><Link href="/">KEEP BROWSING ↑</Link></footer></>}
  </main>;
}
