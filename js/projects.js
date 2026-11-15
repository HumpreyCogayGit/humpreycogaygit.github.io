export const projects = {
  "ai-engineering": {
    title: "AI Engineering: Building with LLMs",
    className: "project-ai",
    accent: "#087f6a",
    kicker: "FROM API CALL TO PRODUCTION",
    headline: "Build beyond the prompt.",
    visualDetail: "httpx → RAG → agents → MCP → production",
    name: "AI Engineering: Building with LLMs",
    description: "A practical, hands-on course that progresses from raw LLM APIs to RAG, tool calling, LangGraph agents, MCP, evaluation, deployment, and production operations.",
    tags: ["49 lectures", "10 modules", "≈55 hours", "Runnable exercises", "Automated checks"],
    url: "https://humpreycogaygit.github.io/AiEngineering101/",
    action: "Start the course"
  },
  precis: {
    title: "Precis — Daily Tech Brief",
    className: "project-precis",
    accent: "#8a5d0a",
    kicker: "FROM NOISE TO SIGNAL",
    headline: "One clear briefing.",
    visualDetail: "AI + cybersecurity · ranked · summarized · sourced",
    name: "Precis",
    description: "A focused daily briefing that organizes thousands of AI and cybersecurity stories into summaries, trends, searchable topics, and direct links to original reporting.",
    tags: ["Daily briefing", "Trend tracking", "Topic discovery", "Original sources"],
    url: "https://precisnews.vercel.app/",
    action: "Read today’s brief"
  },
  speculo: {
    title: "Speculo — Text Workbench",
    className: "project-speculo",
    accent: "#6d4bc3",
    kicker: "WRITE · TRANSFORM · KEEP IT PRIVATE",
    headline: "Your text stays yours.",
    visualDetail: "Markdown + 250 local developer operations",
    name: "Speculo",
    description: "A privacy-focused Markdown editor with live preview and more than 250 local text and developer operations for formatting, conversion, encoding, and transformation.",
    tags: ["Markdown", "Live preview", "250+ operations", "Local processing", "Export"],
    url: "https://speculo.vercel.app/",
    action: "Open Speculo"
  },
  scapesaur: {
    title: "Scapesaur — Dino Runner",
    className: "project-scapesaur",
    accent: "#397a35",
    kicker: "JUMP · DUCK · DON’T LOOK BACK",
    headline: "Small dino. Big adventure.",
    visualDetail: "Adventure · Endless Run · Boss Rush",
    name: "Scapesaur",
    description: "A colorful dinosaur runner with adventure worlds, boss encounters, multiplayer modes, collectible costumes, and accessible play settings.",
    tags: ["Boss encounters", "3 game modes", "Multiplayer", "Customization", "Accessible play"],
    url: "https://scapesaur.vercel.app/",
    action: "Play Scapesaur"
  },
  numero: {
    title: "Numero — Instant Analytics",
    className: "project-numero",
    accent: "#2a78d6",
    kicker: "DROP IN DATA · GET A DASHBOARD",
    headline: "Answers at a glance.",
    visualDetail: "CSV + JSON + Excel → instant analytics",
    name: "Numero",
    description: "A private, browser-based analytics workspace that turns CSV, JSON, and Excel files into interactive dashboards. Imported data stays on your device while Numero handles profiling, visualization, filtering, formulas, and data preparation.",
    tags: ["Instant dashboards", "15 chart types", "Local processing", "Data preparation", "Ask a question"],
    url: "https://humpreycogaygit.github.io/numero/",
    action: "Open Numero"
  }
};

export function projectMarkup(project) {
  const tags = project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  return `
    <article class="project ${project.className}" style="--project-accent:${project.accent}">
      <div class="project-visual">
        <div class="visual-grid" aria-hidden="true"></div>
        <div class="visual-copy">
          <div class="visual-kicker">${project.kicker}</div>
          <h3>${project.headline}</h3>
          <span class="code-line">${project.visualDetail}</span>
        </div>
      </div>
      <div class="project-body">
        <div>
          <h3>${project.name}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-stats">${tags}</div>
        </div>
        <div class="project-actions">
          <a class="button button-primary" href="${project.url}" target="_blank" rel="noopener noreferrer">${project.action} ↗</a>
        </div>
      </div>
    </article>`;
}