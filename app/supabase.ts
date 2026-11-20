export type Listing = { id: string; title: string; description: string; price: number; category: string; email: string; image_url: string; created_at: string };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isConfigured = () => Boolean(url && key);
function headers(extra: Record<string, string> = {}) {
  if (!url || !key) throw new Error("Marketplace is not connected yet. Add your Supabase URL and anon key to .env.local.");
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}
export async function loadListings(): Promise<Listing[] | null> {
  if (!isConfigured()) return null;
  const response = await fetch(`${url}/rest/v1/listings?select=id,title,description,price,category,image_url,created_at&order=created_at.desc`, { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error("Could not load listings.");
  return response.json();
}
export async function loadListing(id: string): Promise<Listing | null> {
  if (!isConfigured()) return null;
  const response = await fetch(`${url}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=id,title,description,price,category,image_url,created_at&limit=1`, { headers: headers(), cache: "no-store" });
  if (!response.ok) throw new Error("Could not load this listing.");
  const items: Listing[] = await response.json();
  return items[0] ?? null;
}
export async function createListing(item: { title: string; description: string; price: number; email: string; category: string; photo: File }): Promise<Listing> {
  if (!isConfigured()) throw new Error("Add your Supabase URL and anon key to .env.local before publishing.");
  if (!item.photo.type.startsWith("image/") || item.photo.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
  const ext = item.photo.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const upload = await fetch(`${url}/storage/v1/object/listing-images/${path}`, { method: "POST", headers: headers({ "Content-Type": item.photo.type, "x-upsert": "false" }), body: item.photo });
  if (!upload.ok) throw new Error("Photo upload failed. Check the listing-images storage bucket.");
  const image_url = `${url}/storage/v1/object/public/listing-images/${path}`;
  const response = await fetch(`${url}/rest/v1/listings`, { method: "POST", headers: headers({ "Content-Type": "application/json", Prefer: "return=representation" }), body: JSON.stringify({ title: item.title, description: item.description, price: item.price, email: item.email, category: item.category, image_url }) });
  if (!response.ok) throw new Error("Listing could not be saved. Check the Supabase table permissions.");
  const rows: Listing[] = await response.json();
  return rows[0];
}
export async function saveMessage(input: { listing_id: string; buyer_email: string; message: string }) {
  if (!isConfigured()) throw new Error("Messaging will be available when this marketplace is connected to Supabase.");
  const response = await fetch(`${url}/rest/v1/messages`, { method: "POST", headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }), body: JSON.stringify(input) });
  if (!response.ok) throw new Error("Message could not be saved. Please try again.");
}
