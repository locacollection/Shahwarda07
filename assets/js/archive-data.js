export const DEFAULT_CONTENT = {
  hero: { eyebrow: "A collection of things time kept", title: "Somewhere\nin the Archive", subtitle: "Some memories don't ask to be explained. They simply remain, quietly, in the places we left them." },
  fragments: {
    title: "Fragments",
    lead: "A few small windows into another time. Each space can hold a photograph, a sentence, or a detail that might otherwise fade.",
    cards: [
      { eyebrow: "01 · A place", title: "The village", body: "Familiar roads, quiet afternoons, doorways, and the feeling of knowing every turn by heart.", caption: "YOUR PHOTOGRAPH OR A SHORT CAPTION", image_url: "", image_alt: "" },
      { eyebrow: "02 · A season", title: "School days", body: "Classrooms, notebooks, shared mischief, and ordinary days that only later became keepsakes.", caption: "YOUR PHOTOGRAPH OR A SHORT CAPTION", image_url: "", image_alt: "" },
      { eyebrow: "03 · Words", title: "Pages and conversations", body: "A few carefully chosen words, a poem, or a page from an older chapter. Keep private details out of anything shared publicly.", caption: "A POEM, EXCERPT, OR REDACTED IMAGE", image_url: "", image_alt: "" },
      { eyebrow: "04 · After hours", title: "Worlds we visited", body: "Old games, familiar maps, late sessions, and the little escapes that made time disappear.", caption: "A GAME IMAGE, SCREENSHOT, OR VIDEO LINK", image_url: "", image_alt: "" }
    ]
  },
  timeline: {
    title: "A little time",
    lead: "Not a complete history. Just a few markers along the way, with room for the details only you would know.",
    items: [
      { label: "Then · The beginning", title: "Before everything had a name", body: "Write a few lines about an early place, a familiar routine, or a small memory that stayed with you." },
      { label: "Later · The in-between", title: "Days that carried on", body: "Add a moment from school, a game, a journey, or a time when life quietly changed direction." },
      { label: "Now · Looking back", title: "What remains", body: "Some things are worth remembering without needing to bring them back. This space can hold that thought." }
    ]
  },
  notes: { title: "Notes to time", quote: "Some things become memories before we understand what they meant.", emphasis: "what they meant.", attribution: "A note kept in the archive", reflectionLabel: "For the pages ahead", reflection: "Use this space for a short reflection, a poem, or a few honest lines. It does not need to ask anything of anyone. It can simply be true." },
  clue: { title: "A small pause", lead: "A tiny optional interaction, just for this page. The answer is checked in your browser and is not saved or sent anywhere.", prompt: "Complete the thought: “A memory is a place we can ___.”", answer: "return", hint: "Not quite. Think of a word about going back in memory.", success: "That will do. Some places stay with us." },
  closing: { eyebrow: "At the end of the page", title: "Nothing is required.", body: "This archive can simply exist as a personal record. It does not ask for a reply, a decision, or anything in return.", footer: "End of this volume" }
};

export function mergeContent(saved) {
  if (!saved || typeof saved !== "object") return structuredClone(DEFAULT_CONTENT);
  const result = structuredClone(DEFAULT_CONTENT);
  for (const key of Object.keys(result)) {
    if (saved[key] && typeof saved[key] === "object" && !Array.isArray(saved[key])) result[key] = { ...result[key], ...saved[key] };
  }
  if (Array.isArray(saved.fragments?.cards)) result.fragments.cards = saved.fragments.cards;
  if (Array.isArray(saved.timeline?.items)) result.timeline.items = saved.timeline.items;
  return result;
}
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
}
function safeImageURL(value) {
  const prefix = "https://qudvkofypbtihpjhwqjm.supabase.co/storage/v1/object/public/archive-media/";
  return typeof value === "string" && value.startsWith(prefix) ? value : "";
}
export function renderArchive(saved) {
  const c = mergeContent(saved);
  document.getElementById("hero-module").innerHTML =
    '<header class="hero wrap" id="top"><div class="hero-inner"><div class="eyebrow">' + esc(c.hero.eyebrow) + '</div><h1>' +
    esc(c.hero.title).replace(/\n/g, "<br>") + '</h1><div class="ornament"></div><p class="hero-copy">' + esc(c.hero.subtitle) +
    '</p><div class="scrollcue">Take your time</div></div></header>';
  const cards = c.fragments.cards.map((card, i) => {
    const image = safeImageURL(card.image_url);
    const media = image ? '<img class="archive-photo" src="' + esc(image) + '" alt="' + esc(card.image_alt || card.title) + '" loading="lazy">' :
      '<div class="media-slot">' + esc(card.caption || "A photograph or a short caption") + '</div>';
    return '<article class="card"><span class="index">' + esc(card.eyebrow || String(i + 1).padStart(2, "0")) + '</span><h3>' +
      esc(card.title) + '</h3><p>' + esc(card.body) + '</p>' + media + '</article>';
  }).join("");
  document.getElementById("fragments-module").innerHTML =
    '<section id="fragments"><div class="wrap"><div class="section-head"><span class="index">01 /</span><h2>' + esc(c.fragments.title) +
    '</h2></div><p class="lead">' + esc(c.fragments.lead) + '</p><div class="cards">' + cards + '</div></div></section>';
  const moments = c.timeline.items.map(item => '<div class="moment"><div class="micro">' + esc(item.label) + '</div><h3>' +
    esc(item.title) + '</h3><p>' + esc(item.body) + '</p></div>').join("");
  document.getElementById("timeline-module").innerHTML =
    '<section id="timeline"><div class="wrap"><div class="section-head"><span class="index">02 /</span><h2>' + esc(c.timeline.title) +
    '</h2></div><p class="lead">' + esc(c.timeline.lead) + '</p><div class="timeline">' + moments + '</div></div></section>';
  const quote = esc(c.notes.quote), emphasis = esc(c.notes.emphasis);
  const quoteMarkup = emphasis && quote.includes(emphasis) ? quote.replace(emphasis, "<em>" + emphasis + "</em>") : quote;
  document.getElementById("notes-module").innerHTML =
    '<section id="notes"><div class="wrap"><div class="section-head"><span class="index">03 /</span><h2>' + esc(c.notes.title) +
    '</h2></div><div class="wide-note"><p class="quote">“' + quoteMarkup + '”</p><div class="attribution">' + esc(c.notes.attribution) +
    '</div></div><div style="max-width:700px;margin:34px 0 0 22px;border-left:1px solid var(--gold2);padding:4px 0 4px 24px"><div class="eyebrow">' +
    esc(c.notes.reflectionLabel) + '</div><p style="color:var(--muted);font-size:14px">' + esc(c.notes.reflection) + '</p></div></div></section>';
  document.getElementById("clue-module").innerHTML =
    '<section id="clue"><div class="wrap"><div class="section-head"><span class="index">04 /</span><h2>' + esc(c.clue.title) +
    '</h2></div><p class="lead">' + esc(c.clue.lead) + '</p><div class="cluebox"><div class="eyebrow">A simple question</div><p>' +
    esc(c.clue.prompt) + '</p><label for="answer">Your answer</label><div class="answerrow"><input id="answer" type="text" placeholder="Write a word…" autocomplete="off"><button id="check" type="button">Check</button></div><div id="feedback" class="feedback" role="status" aria-live="polite"></div><div class="smallprint">This is a local interaction only. No analytics, tracking, forms, or reply requests are built into the page.</div></div></div></section>';
  document.getElementById("closing-module").innerHTML =
    '<section class="closing"><div class="wrap"><div class="eyebrow">' + esc(c.closing.eyebrow) + '</div><h2>' + esc(c.closing.title) +
    '</h2><p>' + esc(c.closing.body) + '</p><div class="ornament"></div><div class="eyebrow">' + esc(c.closing.footer) + '</div></div></section>';
  const input = document.getElementById("answer"), button = document.getElementById("check"), feedback = document.getElementById("feedback");
  if (input && button && feedback) {
    const check = () => {
      const value = input.value.trim().toLowerCase();
      if (!value) { feedback.textContent = "Take your time."; return; }
      feedback.textContent = value === String(c.clue.answer).trim().toLowerCase() ? c.clue.success : c.clue.hint;
    };
    button.addEventListener("click", check);
    input.addEventListener("keydown", event => { if (event.key === "Enter") check(); });
  }
}
