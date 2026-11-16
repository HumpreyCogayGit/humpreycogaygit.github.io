export const projects = {
  "ai-engineering": {
    title: "AI Engineering: Building with LLMs",
    className: "project-ai",
    accent: "#087f6a",
    name: "AI Engineering: Building with LLMs",
    subtitle: "A hands-on course for building and running real LLM applications.",
    screenshot: new URL("../images/projects/ai-engineering.png", import.meta.url).href,
    tags: ["49 lectures", "10 modules", "Hands-on"],
    url: "https://humpreycogay.github.io/AiEngineering101/",
    action: "Start the course"
  },
  precis: {
    title: "Precis — Daily Tech Brief",
    className: "project-precis",
    accent: "#8a5d0a",
    name: "Precis",
    subtitle: "A daily roundup of important AI and cybersecurity news.",
    screenshot: new URL("../images/projects/precis.png", import.meta.url).href,
    tags: ["Daily news", "AI", "Cybersecurity"],
    url: "https://precisnews.vercel.app/",
    action: "Read today’s brief"
  },
  speculo: {
    title: "Speculo — Text Workbench",
    className: "project-speculo",
    accent: "#6d4bc3",
    name: "Speculo",
    subtitle: "A private Markdown editor with useful text and developer tools.",
    screenshot: new URL("../images/projects/speculo.png", import.meta.url).href,
    tags: ["Markdown", "250+ tools", "Private"],
    url: "https://speculo.vercel.app/",
    action: "Open Speculo"
  },
  scapesaur: {
    title: "Scapesaur — Dino Runner",
    className: "project-scapesaur",
    accent: "#397a35",
    name: "Scapesaur",
    subtitle: "A colorful dinosaur runner with bosses, costumes, and multiplayer.",
    screenshot: new URL("../images/projects/scapesaur.png", import.meta.url).href,
    tags: ["Web game", "Multiplayer", "Accessible"],
    url: "https://scapesaur.vercel.app/",
    action: "Play Scapesaur"
  },
  numero: {
    title: "Numero — Instant Analytics",
    className: "project-numero",
    accent: "#2a78d6",
    name: "Numero",
    subtitle: "A private browser tool that turns your files into dashboards.",
    screenshot: new URL("../images/projects/numero.png?v=3", import.meta.url).href,
    tags: ["Data analysis", "15 chart types", "Private"],
    url: "https://humpreycogay.github.io/numero/",
    action: "Open Numero"
  }
};

export function projectMarkup(project) {
  const tags = project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
  const domain = new URL(project.url).hostname.replace(/^www\./, "");
  return `
    <article class="project ${project.className}" style="--project-accent:${project.accent}">
      <div class="project-copy">
        <header class="project-heading">
          <h3>${project.name}</h3>
          <p>${project.subtitle}</p>
        </header>
        <a class="button button-primary" href="${project.url}" target="_blank" rel="noopener noreferrer">${project.action} <span aria-hidden="true">↗</span></a>
      </div>
      <a class="project-screenshot" href="${project.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${project.name}">
        <span class="project-browser-bar" aria-hidden="true">
          <span class="project-browser-controls"><i></i><i></i><i></i></span>
          <span class="project-browser-address">${domain}</span>
        </span>
        <span class="project-image-wrap">
          <img src="${project.screenshot}" alt="Screenshot of ${project.name}" width="1440" height="900">
        </span>
      </a>
      <footer class="project-footer">
        <div class="project-stats" aria-label="Project highlights">${tags}</div>
      </footer>
    </article>`;
}
