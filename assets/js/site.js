import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase-config.js";
import { renderArchive } from "./archive-data.js";
const modules = [
  ["hero-module", "content/sections/hero.html"],
  ["fragments-module", "content/sections/fragments.html"],
  ["timeline-module", "content/sections/timeline.html"],
  ["notes-module", "content/sections/notes.html"],
  ["clue-module", "content/sections/clue.html"],
  ["closing-module", "content/sections/closing.html"]
];
async function loadStaticModules() {
  for (const [target, path] of modules) {
    const container = document.getElementById(target);
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Couldn't load " + path);
      container.innerHTML = await response.text();
    } catch (error) {
      container.innerHTML = '<p class="wrap smallprint">This section could not be loaded.</p>';
      console.error(error);
    }
  }
  const input = document.getElementById("answer"), button = document.getElementById("check"), feedback = document.getElementById("feedback");
  if (input && button && feedback) {
    const check = () => {
      const value = input.value.trim().toLowerCase();
      if (!value) { feedback.textContent = "Take your time."; return; }
      feedback.textContent = ["return", "remember", "revisit", "wander"].includes(value)
        ? "That will do. Some places stay with us." : "Not quite. Think of a word about going back in memory.";
    };
    button.addEventListener("click", check);
    input.addEventListener("keydown", event => { if (event.key === "Enter") check(); });
  }
}
async function loadArchive() {
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/+esm");
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    const { data, error } = await supabase.from("archive_content").select("content").eq("id", "main").maybeSingle();
    if (error) throw error;
    if (data?.content && Object.keys(data.content).length) { renderArchive(data.content); return; }
  } catch (error) {
    console.info("Using built-in archive content until the live content service is available.", error);
  }
  await loadStaticModules();
}
loadArchive();
