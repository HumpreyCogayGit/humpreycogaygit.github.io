export function calculatorMarkup() {
  const keys = [
    ["C", "clear", "utility"], ["±", "sign", "utility"], ["%", "percent", "utility"], ["÷", "/", "operator"],
    ["7", "7", ""], ["8", "8", ""], ["9", "9", ""], ["×", "*", "operator"],
    ["4", "4", ""], ["5", "5", ""], ["6", "6", ""], ["−", "-", "operator"],
    ["1", "1", ""], ["2", "2", ""], ["3", "3", ""], ["+", "+", "operator"],
    ["0", "0", "zero"], [".", ".", ""], ["=", "equals", "equals"]
  ];
  return `<div class="calculator" aria-label="Calculator">
    <div class="calc-display" aria-live="polite">
      <div class="calc-expression"></div><div class="calc-value">0</div>
    </div>
    <div class="calc-keys">${keys.map(([label, value, cls]) => `<button class="calc-key ${cls}" type="button" data-calc="${value}">${label}</button>`).join("")}</div>
  </div>`;
}

export function initCalculator(root) {
  const display = root.querySelector(".calc-value");
  const expression = root.querySelector(".calc-expression");
  let current = "0";
  let previous = null;
  let operator = null;
  let resetNext = false;

  const format = (value) => {
    if (!Number.isFinite(value)) return "Error";
    return Number.parseFloat(value.toPrecision(12)).toString();
  };
  const render = () => {
    display.textContent = current;
    expression.textContent = previous !== null && operator ? `${previous} ${operator === "*" ? "×" : operator === "/" ? "÷" : operator}` : "";
  };
  const calculate = () => {
    if (previous === null || !operator) return Number(current);
    const a = Number(previous); const b = Number(current);
    if (operator === "+") return a + b;
    if (operator === "-") return a - b;
    if (operator === "*") return a * b;
    if (operator === "/") return b === 0 ? NaN : a / b;
    return b;
  };
  const input = (key) => {
    if (/^\d$/.test(key)) {
      if (resetNext || current === "0" || current === "Error") { current = key; resetNext = false; }
      else if (current.replace("-", "").replace(".", "").length < 12) current += key;
    } else if (key === ".") {
      if (resetNext || current === "Error") { current = "0."; resetNext = false; }
      else if (!current.includes(".")) current += ".";
    } else if (["+", "-", "*", "/"].includes(key)) {
      if (operator && !resetNext) {
        const result = calculate(); current = format(result);
        previous = Number.isFinite(result) ? current : null;
      } else previous = current;
      operator = current === "Error" ? null : key; resetNext = true;
    } else if (key === "equals") {
      const result = calculate(); current = format(result); previous = null; operator = null; resetNext = true;
    } else if (key === "clear") { current = "0"; previous = null; operator = null; resetNext = false;
    } else if (key === "sign" && current !== "0" && current !== "Error") current = current.startsWith("-") ? current.slice(1) : `-${current}`;
    else if (key === "percent" && current !== "Error") current = format(Number(current) / 100);
    else if (key === "backspace" && !resetNext) current = current.length > 1 ? current.slice(0, -1) : "0";
    render();
  };
  root.addEventListener("click", (event) => { const button = event.target.closest("[data-calc]"); if (button) input(button.dataset.calc); });
  root.closest(".app-window").addEventListener("keydown", (event) => {
    const map = { Enter: "equals", "=": "equals", Escape: "clear", Backspace: "backspace", ",": "." };
    const key = map[event.key] || event.key;
    if (/^\d$/.test(key) || ["+", "-", "*", "/", ".", "equals", "clear", "backspace"].includes(key)) { event.preventDefault(); input(key); }
  });
}