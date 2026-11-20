"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { loadListing, saveMessage, type Listing } from "../../supabase";

export default function ListingPage() {
  return <Suspense fallback={<div className="detail-loading">Finding the details…</div>}><ListingContent /></Suspense>;
}

function ListingContent() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
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
