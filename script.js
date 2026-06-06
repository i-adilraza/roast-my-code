document.getElementById("modeToggle").addEventListener("change", function () {
  updateToggleActiveState();
  const code = document.getElementById("codeInput").value.trim();
  if (code) analyzeCode();
});

const API_KEY = "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";
let isLoading = false;

// DOM Elements
const labelNormal = document.querySelector(".label-normal");
const labelRoast = document.querySelector(".label-roast");

// Initialize Toggle State styling and body theme class
function updateToggleActiveState() {
  const isRoast = document.getElementById("modeToggle").checked;
  if (isRoast) {
    labelRoast.classList.add("mode-active-roast");
    labelNormal.classList.remove("mode-active-normal");
    document.body.classList.add("roast-active");
  } else {
    labelNormal.classList.add("mode-active-normal");
    labelRoast.classList.remove("mode-active-roast");
    document.body.classList.remove("roast-active");
  }
}

// Startup
updateToggleActiveState();

async function analyzeCode() {
  if (isLoading) return;

  const code = document.getElementById("codeInput").value.trim();
  const isRoastMode = document.getElementById("modeToggle").checked;
  const output = document.getElementById("output");
  const resultText = document.getElementById("resultText");
  const btn = document.getElementById("submitBtn");

  if (!code) {
    alert("Bhai code toh paste kar pehle!");
    return;
  }

  isLoading = true;
  btn.disabled = true;
  btn.innerText = "Analyzing...";
  output.classList.remove("hidden");
  
  // Custom loader
  const loaderText = isRoastMode ? "🔥 Desi Dev is preparing the roast..." : "⏳ Reviewing your code structure...";
  resultText.innerHTML = `
    <div class="loader-container">
      <div class="fire-ring"></div>
      <div class="loader-text">${loaderText}</div>
    </div>
  `;

  // Scroll smoothly to output
  output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const normalPrompt = `You are a helpful senior developer. Review the code below carefully.

Structure your response EXACTLY like this:

🔍 ISSUES FOUND:
- Line X: [What is wrong with the code]
  * Original: \`[original bad code line]\`
  * Fixed: \`[corrected code line]\`
  * Why: [brief explanation of why this change improves the code]
(if no issues, say "No major issues found!")

✅ IMPROVED CODE:
\`\`\`
[Provide the fully corrected and improved code here. Make sure to add inline comments (like '// FIXED: ...' or '# FIXED: ...') directly above the lines you changed to explain the improvement clearly and concisely]
\`\`\`

💡 EXPLANATION:
[2-3 lines explaining what you changed in general and how it helps readability or performance]

Code to review:
${code}`;

  const roastPrompt = `You are a senior developer who roasts code like two best friends roasting each other — savage, funny, personal but still helpful. Use Hinglish. Be like a desi best friend who cant believe what he just read. Use jokes, sarcasm, pop culture references, desi comparisons. Each roast should feel like a punch line. Minimum 4-5 roast points, each 2-3 lines long — don't be too short.

Structure your response EXACTLY like this:

🔥 ROAST:
- Line X: [savage desi roast in Hinglish - roast it like a best friend would]
  * Original: \`[original bad code line]\`
  * Fixed: \`[corrected code line]\`
  * Why: [funny/sarcastic Hinglish explanation of why this fix is better]
(minimum 4-5 points)

✅ IMPROVED CODE:
\`\`\`
[Provide the fully corrected and improved code here. Put friendly inline comments (like '// FIXED: ...' or '# FIXED: ...') directly above the lines you changed to show where the mistake was fixed]
\`\`\`

💡 WHAT CHANGED:
[2-3 lines explaining the fixes — serious tone]

Code to review:
${code}`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "google/gemma-4-31b-it:free",
          messages: [{ role: "user", content: isRoastMode ? roastPrompt : normalPrompt }]
        })
      }
    );

    const data = await response.json();
    console.log("Response:", JSON.stringify(data));
    const reply = data?.choices?.[0]?.message?.content || "Kuch nahi aaya!";
    const badge = document.getElementById("modeBadge");
    
    badge.innerHTML = isRoastMode
      ? '<span class="mode-badge badge-roast">🔥 Roast Mode</span>'
      : '<span class="mode-badge badge-normal">✅ Normal Mode</span>';

    // Format the output nicely with premium style classes
    resultText.innerHTML = reply
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre>$2</pre>')
      .replace(/🔍 ISSUES FOUND:/g, '<div class="issue-tag">🔍 ISSUES FOUND:</div>')
      .replace(/🔥 ROAST:/g, '<div class="roast-tag">🔥 ROAST:</div>')
      .replace(/✅ IMPROVED CODE:/g, '<div class="improved-tag">✅ IMPROVED CODE:</div>')
      .replace(/💡 EXPLANATION:/g, '<div class="explanation-tag">💡 EXPLANATION:</div>')
      .replace(/💡 WHAT CHANGED:/g, '<div class="explanation-tag">💡 WHAT CHANGED:</div>')
      .replace(/\n/g, '<br>');

    // Scroll to results once loaded
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  } catch (error) {
    console.error("Error:", error);
    resultText.innerText = "Error: " + error.message;
  } finally {
    isLoading = false;
    btn.disabled = false;
    btn.innerText = "Analyze →";
  }
}