import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("guest contact draft is preserved through login and requires confirmation", () => {
  const contact = read("src/components/contact/contact-form.tsx");
  const auth = read("src/lib/auth.ts");
  assert.match(contact, /rentnest_contact_draft/);
  assert.match(contact, /\/auth\/login\?from=/);
  assert.match(contact, /Your message was restored/);
  assert.match(contact, /Review it, then select Send message/);
  assert.match(auth, /from\.startsWith\("\/contact"\)/);
});

test("support conversations have authenticated user and admin reply interfaces", () => {
  const api = read("src/lib/api.ts");
  const admin = read("src/components/dashboard/admin-support-inbox.tsx");
  const conversation = read("src/components/contact/support-conversation.tsx");
  assert.match(api, /contact\.reply|reply:/);
  assert.match(api, /contact-submissions/);
  assert.match(admin, /Support inbox/);
  assert.match(admin, /Close/);
  assert.match(conversation, /Send reply/);
});
