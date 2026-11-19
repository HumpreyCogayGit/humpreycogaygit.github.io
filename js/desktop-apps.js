export function aboutMarkup() {
  return `
    <article class="about-file">
      <header>
        <span>about.txt</span>
        <span>Plain Text — UTF-8</span>
      </header>
      <div class="about-copy">
        <p class="about-kicker">HELLO, I’M HUMPREY COGAY.</p>
        <h3>AI engineering, useful tools, thoughtful information, and playful experiments.</h3>
        <p><strong>Data Engineering Manager. Technology Explorer. Independent Builder.</strong></p>
        <p>Currently working as a Data Engineering Manager, leading a team responsible for delivering enterprise data platform management and data engineering services across cloud, database, and analytics technologies.</p>
        <p>On the side, I build tools, experiment with ideas, and explore things that spark my curiosity. My interests include AI engineering, LLM applications, cybersecurity, web development, creative coding, games, and understanding how things like animations, graphics, and interactive experiences work under the hood.</p>
        <p>Some projects solve practical problems, others are experiments or learning exercises. Sometimes the fun is simply understanding how something works and seeing what I can create with it.</p>
        <p>Explore the projects through the Start menu, or open Command Line for a quick map of what you’ll find here.</p>
        <footer>Humprey Cogay · MangHumps · Portfolio / 2026</footer>
      </div>
    </article>`;
}

export function commandLineMarkup() {
  return `
    <div class="terminal-app" aria-label="Command Prompt">
      <div class="terminal-output">
        <div class="terminal-banner" aria-hidden="true">
          <p>Microsoft Windows [Version 10.0.26100.2314]</p>
          <p>(c) Microsoft Corporation. All rights reserved.</p>
        </div>
        <div class="terminal-history" aria-live="polite"></div>
        <form class="terminal-prompt">
          <label for="terminal-input">C:\Users\Humprey\Portfolio&gt;</label>
          <input id="terminal-input" name="command" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Enter a command">
        </form>
      </div>
    </div>`;
}

export function initCommandLine(root) {
  const history = root.querySelector(".terminal-history");
  const form = root.querySelector(".terminal-prompt");
  const input = root.querySelector("input");
  const output = root.querySelector(".terminal-output");
  const prompt = "C:\\Users\\Humprey\\Portfolio>";
  const commands = {
    help: "Displays this list of available commands.",
    projects: "Lists featured projects. Select one to open it.",
    about: "Opens about.txt in Notepad.",
    contact: "Displays contact details.",
    clear: "Clears the Command Prompt screen."
  };
  const projects = [
    ["ai-engineering", "AI Engineering", "Hands-on LLM course"],
    ["precis", "Precis", "Daily tech brief"],
    ["speculo", "Speculo", "Private text workbench"],
    ["scapesaur", "Scapesaur", "Dinosaur runner"],
    ["numero", "Numero", "Instant analytics"]
  ];

  function commandBlock(value) {
    const block = document.createElement("section");
    block.className = "terminal-result";
    const command = document.createElement("p");
    command.className = "terminal-command";
    command.textContent = `${prompt}${value}`;
    block.append(command);
    return block;
  }

  function addHelp(block) {
    const intro = document.createElement("p");
    intro.textContent = "For more information, type one of the following commands:";
    const list = document.createElement("dl");
    list.className = "terminal-help-list";
    Object.entries(commands).forEach(([name, description]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = name.toUpperCase();
      detail.textContent = description;
      list.append(term, detail);
    });
    block.append(intro, list);
  }

  function addProjects(block) {
    const intro = document.createElement("p");
    intro.textContent = "Featured projects — click a project to open it:";
    const list = document.createElement("div");
    list.className = "terminal-projects";
    projects.forEach(([id, name, description]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.open = id;
      button.innerHTML = `<strong>${name}</strong><span>${description}</span>`;
      list.append(button);
    });
    block.append(intro, list);
  }

  function scrollToPrompt() {
    requestAnimationFrame(() => {
      output.scrollTop = output.scrollHeight;
    });
  }

  function run(command) {
    const value = command.trim().toLowerCase();
    if (!value) return;
    if (value === "clear") {
      history.replaceChildren();
      root.querySelector(".terminal-banner").hidden = true;
      scrollToPrompt();
      return;
    }

    const block = commandBlock(value);
    if (value === "help") addHelp(block);
    else if (value === "projects") addProjects(block);
    else if (value === "contact") {
      const response = document.createElement("p");
      response.textContent = "LinkedIn: linkedin.com/in/manghumps  |  Instagram: @humpreycogay";
      block.append(response);
    } else if (value === "about") {
      const response = document.createElement("p");
      response.textContent = "Opening about.txt...";
      block.append(response);
      root.closest(".app-window").dispatchEvent(new CustomEvent("terminal-open-about", { bubbles: true }));
    } else {
      const response = document.createElement("p");
      response.textContent = `'${value}' is not recognized as an internal or external command, operable program or batch file. Type 'help' to see available commands.`;
      block.append(response);
    }
    history.append(block);
    scrollToPrompt();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
    input.focus();
  });
  const terminalWindow = root.closest(".app-window");
  terminalWindow.addEventListener("click", (event) => {
    if (!event.target.closest("button, input, a")) input.focus({ preventScroll: true });
  });
  terminalWindow.addEventListener("focus", () => input.focus({ preventScroll: true }));
  requestAnimationFrame(() => requestAnimationFrame(() => input.focus({ preventScroll: true })));
}