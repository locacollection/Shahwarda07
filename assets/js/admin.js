import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL, MEDIA_BUCKET } from "./supabase-config.js";
import { DEFAULT_CONTENT, mergeContent } from "./archive-data.js";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const loginPanel = document.getElementById("login-panel"), editorPanel = document.getElementById("editor-panel");
const loginStatus = document.getElementById("login-status"), saveStatus = document.getElementById("save-status");
const editorFields = document.getElementById("editor-fields");
let content = structuredClone(DEFAULT_CONTENT), currentUser = null;
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}
function field(label, path, value, multiline) {
  const id = "f-" + path.replace(/[^a-z0-9]+/gi, "-");
  const control = multiline ? '<textarea id="' + id + '" data-field="' + path + '">' + esc(value) + '</textarea>' :
    '<input id="' + id + '" type="text" data-field="' + path + '" value="' + esc(value) + '">';
  return '<div class="field"><label for="' + id + '">' + label + '</label>' + control + '</div>';
}
function imageURL(url) {
  const prefix = SUPABASE_URL + "/storage/v1/object/public/" + MEDIA_BUCKET + "/";
  return typeof url === "string" && url.startsWith(prefix) ? url : "";
}
function renderEditor() {
  const c = content;
  let html = '<div class="section"><div class="eyebrow">Opening</div><h2>Hero</h2>' +
    field("Small heading", "hero.eyebrow", c.hero.eyebrow) + field("Main title", "hero.title", c.hero.title, true) +
    field("Intro text", "hero.subtitle", c.hero.subtitle, true) + '</div>';
  html += '<div class="section"><div class="eyebrow">01 / Fragments</div><h2>Memory cards</h2>' +
    field("Section heading", "fragments.title", c.fragments.title) + field("Intro text", "fragments.lead", c.fragments.lead, true);
  c.fragments.cards.forEach((card, i) => {
    const url = imageURL(card.image_url);
    html += '<div class="card-editor"><div class="card-head"><strong>Memory ' + (i + 1) + '</strong><button class="button danger" type="button" data-remove-card="' + i + '">Remove</button></div>' +
      field("Small label", "fragments.cards." + i + ".eyebrow", card.eyebrow) +
      field("Title", "fragments.cards." + i + ".title", card.title) +
      field("Description", "fragments.cards." + i + ".body", card.body, true) +
      field("Caption when no photo is uploaded", "fragments.cards." + i + ".caption", card.caption, true) +
      (url ? '<img class="photo-preview" src="' + esc(url) + '" alt="Current uploaded photo">' : '') +
      '<div class="field"><label for="upload-' + i + '">Upload a photo</label><input class="file-input" id="upload-' + i + '" type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-upload-card="' + i + '"><span class="small">JPG, PNG, WebP or GIF. Maximum 8 MB.</span></div>' +
      field("Photo description (alt text)", "fragments.cards." + i + ".image_alt", card.image_alt || "") +
      (url ? '<button class="button secondary" type="button" data-clear-image="' + i + '">Remove photo</button>' : '') + '</div>';
  });
  html += '<button class="button secondary" type="button" id="add-card">Add memory card</button></div>';
  html += '<div class="section"><div class="eyebrow">02 / Timeline</div><h2>A little time</h2>' +
    field("Section heading", "timeline.title", c.timeline.title) + field("Intro text", "timeline.lead", c.timeline.lead, true);
  c.timeline.items.forEach((item, i) => {
    html += '<div class="moment-editor"><div class="card-head"><strong>Timeline entry ' + (i + 1) + '</strong><button class="button danger" type="button" data-remove-timeline="' + i + '">Remove</button></div>' +
      field("Date or label", "timeline.items." + i + ".label", item.label) + field("Title", "timeline.items." + i + ".title", item.title) +
      field("Description", "timeline.items." + i + ".body", item.body, true) + '</div>';
  });
  html += '<button class="button secondary" type="button" id="add-timeline">Add timeline entry</button></div>';
  html += '<div class="section"><div class="eyebrow">03 / Notes</div><h2>Notes to time</h2>' +
    field("Section heading", "notes.title", c.notes.title) + field("Quote", "notes.quote", c.notes.quote, true) +
    field("Words to emphasize (must appear in the quote)", "notes.emphasis", c.notes.emphasis) +
    field("Attribution", "notes.attribution", c.notes.attribution) + field("Reflection heading", "notes.reflectionLabel", c.notes.reflectionLabel) +
    field("Reflection", "notes.reflection", c.notes.reflection, true) + '</div>';
  html += '<div class="section"><div class="eyebrow">04 / Optional interaction</div><h2>A small pause</h2>' +
    field("Section heading", "clue.title", c.clue.title) + field("Intro text", "clue.lead", c.clue.lead, true) +
    field("Question", "clue.prompt", c.clue.prompt, true) + field("Accepted answer", "clue.answer", c.clue.answer) +
    field("Correct response", "clue.success", c.clue.success, true) + field("Other response", "clue.hint", c.clue.hint, true) + '</div>';
  html += '<div class="section"><div class="eyebrow">Closing</div><h2>Final note</h2>' +
    field("Small heading", "closing.eyebrow", c.closing.eyebrow) + field("Title", "closing.title", c.closing.title) +
    field("Text", "closing.body", c.closing.body, true) + field("Final line", "closing.footer", c.closing.footer) + '</div>';
  editorFields.innerHTML = html;
}
function setPath(path, value) {
  const keys = path.split(".");
  let target = content;
  for (let i = 0; i < keys.length - 1; i++) target = target[keys[i]];
  target[keys[keys.length - 1]] = value;
}
function showLogin(message) {
  loginPanel.classList.remove("hidden"); editorPanel.classList.add("hidden");
  if (message) loginStatus.textContent = message;
}
let dashboardData = null, activeResponseFilter = "all";
function answerLabel(key) {
  return ({ q1: "Looking back", q2: "What matters in an apology", q3: "A conversation someday" })[key] || key;
}
function renderResponses() {
  const list = document.getElementById("responses-list");
  const status = document.getElementById("responses-status");
  if (!dashboardData) { list.innerHTML = ""; return; }
  const all = Array.isArray(dashboardData.submissions) ? dashboardData.submissions : [];
  const items = activeResponseFilter === "all" ? all : all.filter(item => item.submission_type === activeResponseFilter);
  status.textContent = items.length ? items.length + (items.length === 1 ? " submission" : " submissions") : "Nothing has been submitted here yet.";
  if (!items.length) { list.innerHTML = ""; return; }
  list.innerHTML = items.map(item => {
    const date = new Date(item.created_at);
    const when = Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    const isMessage = item.submission_type === "message";
    const body = isMessage
      ? '<p class="response-message">' + esc(item.message || "") + '</p>'
      : '<dl class="answer-list">' + Object.entries(item.answers || {}).map(([key, value]) => '<div><dt>' + esc(answerLabel(key)) + '</dt><dd>' + esc(value) + '</dd></div>').join("") + '</dl>';
    return '<article class="response-card"><div class="response-card-head"><span class="response-kind">' + (isMessage ? "Written note" : "Survey answers") + '</span><time>' + esc(when) + '</time></div>' + body + '</article>';
  }).join("");
}
async function refreshResponses() {
  const status = document.getElementById("responses-status");
  const button = document.getElementById("refresh-responses");
  button.disabled = true; status.textContent = "Checking for new submissions…";
  const { data, error } = await supabase.rpc("get_archive_dashboard");
  button.disabled = false;
  if (error) {
    status.textContent = "Could not load the private dashboard. Check that you are signed in with the administrator account.";
    console.error(error); return;
  }
  dashboardData = data;
  document.getElementById("stat-visitors").textContent = Number(data.visitor_count || 0).toLocaleString();
  document.getElementById("stat-messages").textContent = Number(data.message_count || 0).toLocaleString();
  document.getElementById("stat-surveys").textContent = Number(data.survey_count || 0).toLocaleString();
  renderResponses();
}
document.getElementById("refresh-responses").addEventListener("click", refreshResponses);
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  activeResponseFilter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
  renderResponses();
}));
async function loadDashboard(user) {
  if (!user || (user.email || "").toLowerCase() !== ADMIN_EMAIL) {
    await supabase.auth.signOut(); showLogin("This account is not authorized for the archive."); return;
  }
  currentUser = user; loginPanel.classList.add("hidden"); editorPanel.classList.remove("hidden");
  saveStatus.textContent = "Loading your archive…";
  await refreshResponses();
  const { data, error } = await supabase.from("archive_content").select("content").eq("id", "main").single();
  if (error) { saveStatus.textContent = "Could not load saved content. Check the Supabase Data API exposure setting."; console.error(error); return; }
  content = mergeContent(data.content); renderEditor(); saveStatus.textContent = "Ready to edit.";
}
document.getElementById("login-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = document.getElementById("login-button");
  const password = document.getElementById("password").value;
  button.disabled = true; loginStatus.textContent = "Signing in…";
  const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  button.disabled = false;
  if (error) {
    loginStatus.textContent = "Sign-in failed. Check your password and try again.";
    console.error(error);
    return;
  }
  await loadDashboard(data.user);
});
document.getElementById("logout-button").addEventListener("click", async () => {
  await supabase.auth.signOut(); currentUser = null; document.getElementById("password").value = ""; showLogin("You have signed out.");
});
document.getElementById("editor-form").addEventListener("input", event => {
  if (event.target.dataset.field) setPath(event.target.dataset.field, event.target.value);
});
document.getElementById("editor-form").addEventListener("submit", async event => {
  event.preventDefault(); if (!currentUser) return;
  const button = document.getElementById("save-button"); button.disabled = true; saveStatus.textContent = "Publishing…";
  const { error } = await supabase.from("archive_content").update({ content, updated_at: new Date().toISOString() }).eq("id", "main");
  button.disabled = false;
  saveStatus.textContent = error ? "Could not publish. Your changes are still in this editor." : "Published. The public archive now shows your changes.";
  if (error) console.error(error);
});
editorFields.addEventListener("click", event => {
  const removeCard = event.target.closest("[data-remove-card]"), removeTimeline = event.target.closest("[data-remove-timeline]");
  const clearImage = event.target.closest("[data-clear-image]");
  if (removeCard) { content.fragments.cards.splice(Number(removeCard.dataset.removeCard), 1); renderEditor(); }
  else if (removeTimeline) { content.timeline.items.splice(Number(removeTimeline.dataset.removeTimeline), 1); renderEditor(); }
  else if (clearImage) { const card = content.fragments.cards[Number(clearImage.dataset.clearImage)]; card.image_url = ""; card.image_alt = ""; renderEditor(); }
  else if (event.target.id === "add-card") {
    content.fragments.cards.push({ eyebrow: String(content.fragments.cards.length + 1).padStart(2, "0") + " · A memory", title: "A new fragment", body: "", caption: "ADD A SHORT CAPTION", image_url: "", image_alt: "" }); renderEditor();
  } else if (event.target.id === "add-timeline") { content.timeline.items.push({ label: "A moment", title: "A new memory", body: "" }); renderEditor(); }
});
editorFields.addEventListener("change", async event => {
  const input = event.target;
  if (!input.matches("[data-upload-card]") || !input.files || !input.files[0]) return;
  const file = input.files[0], index = Number(input.dataset.uploadCard);
  if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) { saveStatus.textContent = "Choose an image file smaller than 8 MB."; input.value = ""; return; }
  saveStatus.textContent = "Uploading photo…"; input.disabled = true;
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-80);
  const path = "archive/" + crypto.randomUUID() + "-" + safeName;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  input.disabled = false;
  if (error) { saveStatus.textContent = "Photo upload failed. Please try again."; console.error(error); return; }
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  content.fragments.cards[index].image_url = data.publicUrl;
  if (!content.fragments.cards[index].image_alt) content.fragments.cards[index].image_alt = content.fragments.cards[index].title;
  renderEditor(); saveStatus.textContent = "Photo uploaded. Save and publish to show it on the public site.";
});
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session) await loadDashboard(sessionData.session.user);
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") { currentUser = null; showLogin(); }
  else if (event === "SIGNED_IN" && session) queueMicrotask(() => loadDashboard(session.user));
});


document.getElementById("password-form").addEventListener("submit", async event => {
  event.preventDefault();
  const password = document.getElementById("new-password").value;
  const confirmation = document.getElementById("confirm-password").value;
  const status = document.getElementById("password-status");
  if (password.length < 10) { status.textContent = "Use at least 10 characters."; return; }
  if (password !== confirmation) { status.textContent = "The passwords do not match."; return; }
  status.textContent = "Updating password…";
  const { error } = await supabase.auth.updateUser({ password });
  status.textContent = error ? "Could not update the password. Please try again." : "Password updated.";
  if (error) console.error(error);
  else { document.getElementById("new-password").value = ""; document.getElementById("confirm-password").value = ""; }
});
