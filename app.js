const replacementDefaults = [
  {
    name: "Functional Communication / Manding for Break",
    data: "8/10 opportunities independent, 80%",
    prompt: "verbal prompt and one model prompt as needed",
    intervention: "FCT, NET, DRA, and prompt fading",
    behavior: "Whining",
    definition: "using a prolonged vocal tone, saying refusal statements, and avoiding eye contact for longer than 3 seconds",
    behaviorData: "1 occurrence lasting approximately 30 seconds",
    antecedent: "RBT withheld access to a preferred item and prompted the client to mand",
    consequence: "RBT prompted an appropriate request and reinforced functional communication",
    behaviorIntervention: "FCT and DRA",
    response: "client requested a break appropriately and waited for the RBT response"
  },
  {
    name: "Following Directions / Listener Responding",
    data: "8/10 trials independent, 80%",
    prompt: "gestural and partial verbal prompts",
    intervention: "NET, DTT, DRA, prompt hierarchy, and behavior-specific praise",
    behavior: "Task refusal",
    definition: "turning away, saying no, pushing materials, or not initiating within 10 seconds of an instruction",
    behaviorData: "2 instances across 10 directions",
    antecedent: "RBT presented a non-preferred direction during structured teaching",
    consequence: "RBT used first/then language, represented the demand, and reinforced compliance with praise and tokens",
    behaviorIntervention: "first/then, DRA, and prompt hierarchy",
    response: "client followed directions, completed assigned tasks, and maintained engagement"
  },
  {
    name: "Waiting and Tolerating Denial",
    data: "6/8 opportunities successful, 75%",
    prompt: "visual timer and verbal prompt",
    intervention: "NET, DRI, DRA, and tolerance training",
    behavior: "Elopement",
    definition: "moving more than 3 feet away from the assigned area without permission",
    behaviorData: "1 occurrence lasting under 1 minute",
    antecedent: "RBT denied immediate access to a preferred item and introduced a waiting interval",
    consequence: "RBT redirected the client back to the area, prompted waiting, and reinforced staying in area",
    behaviorIntervention: "FCT, response blocking, redirection, and DRI",
    response: "client waited up to 2 minutes with no aggression or property destruction"
  }
];

const checks = [
  {
    id: "quantitative",
    label: "Quantitative Data",
    points: 2,
    fail: "No measurable data",
    detail: "Looks for trial counts, percentages, frequency, duration, or timed data.",
    test: note => /(\b\d+\s*\/\s*\d+\b|\b\d+%|\b\d+\s*(occurrences?|instances?|trials?|minutes?|mins?|seconds?|secs?)\b)/i.test(note)
  },
  {
    id: "targets",
    label: "Target Definitions",
    points: 2,
    fail: "Targets are not clearly operationalized",
    detail: "Looks for observable definitions rather than vague behavior labels only.",
    test: note => /(defined as|definition:|operational|lasting|longer than|more than|within \d+|above conversational|moving more than)/i.test(note)
  },
  {
    id: "problemCount",
    label: "3 Target Behaviors Observed",
    points: 2,
    fail: "Insufficient behavioral coverage: fewer than 3 target behavior observations",
    detail: "Looks for at least three target behavior observations embedded within skill programs.",
    test: note => countProblemBehaviors(note) >= 3
  },
  {
    id: "replacementCount",
    label: "3 Replacement Behaviors",
    points: 2,
    fail: "Insufficient behavioral coverage: fewer than 3 replacement behaviors",
    detail: "Looks for at least three replacement skill entries or common skill acquisition targets.",
    test: note => countReplacementBehaviors(note) >= 3
  },
  {
    id: "interventions",
    label: "Interventions Listed",
    points: 2,
    fail: "Named ABA interventions missing",
    detail: "Looks for DRA, DRI, FCT, redirection, extinction, prompt hierarchy, NET, DTT, or prompt fading.",
    test: note => /(DRA|DRI|FCT|NET|DTT|redirection|redirected|extinction|prompt hierarchy|prompt fading|differential reinforcement|response blocking|first-then)/i.test(note)
  },
  {
    id: "response",
    label: "Client Response",
    points: 2,
    fail: "Client response missing",
    detail: "Looks for the outcome after intervention, including compliance, reduction, independence, or prompting needed.",
    test: note => /(client response|client complied|client completed|client returned|behavior decreased|reduced|required .*prompt|responded|independent|partial compliance)/i.test(note)
  },
  {
    id: "abc",
    label: "ABC Data",
    points: 2,
    fail: "ABC data missing for behavior incidents",
    detail: "Looks for antecedent, behavior, and consequence documentation.",
    test: note => /(antecedent|trigger)/i.test(note) && /\bbehavior\b/i.test(note) && /(consequence|redirected|reinforced|prompted)/i.test(note)
  },
  {
    id: "narrative",
    label: "Session Narrative",
    points: 2,
    fail: "Narrative incomplete",
    detail: "Looks for session context, services/program implementation, data/progress language, and safety or environment statement.",
    test: note => hasSessionNarrative(note)
  }
];

const problemTerms = [
  "elopement",
  "tantrum",
  "physical aggression",
  "aggression",
  "task refusal",
  "property destruction",
  "sib",
  "self-injurious",
  "climbing",
  "screaming",
  "dropping to floor",
  "noncompliance"
];

const replacementTerms = [
  "manding",
  "functional communication",
  "following directions",
  "waiting",
  "staying in area",
  "requesting break",
  "tolerating denial",
  "tolerance",
  "appropriate play",
  "compliance",
  "transitioning"
];

const $ = selector => document.querySelector(selector);

function hydrateEntries(containerId, templateId, defaults) {
  const container = $(`#${containerId}`);
  container.innerHTML = "";

  defaults.forEach((entry, index) => {
    container.appendChild(createEntry(templateId, entry, index));
  });

  updateEntryControls(containerId);
}

function createEntry(templateId, entry = {}, index = 0) {
  const template = $(`#${templateId}`);
  const node = template.content.firstElementChild.cloneNode(true);
  node.querySelector("summary span").textContent = index + 1;

  Object.entries(entry).forEach(([field, value]) => {
    const input = node.querySelector(`[data-field="${field}"]`);
    if (input) input.value = value;
  });

  return node;
}

function addReplacementEntry() {
  const container = $("#replacementInputs");
  const index = container.querySelectorAll(".entry").length;
  const node = createEntry("replacementTemplate", {}, index);
  container.appendChild(node);
  updateEntryControls("replacementInputs");
  node.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function updateEntryControls(containerId) {
  const entries = [...$(`#${containerId}`).querySelectorAll(".entry")];
  entries.forEach((entry, index) => {
    const summary = entry.querySelector("summary");
    summary.querySelector("span").textContent = index + 1;

    let removeButton = summary.querySelector(".remove-entry");
    if (entries.length > 3) {
      if (!removeButton) {
        removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-entry";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          entry.remove();
          updateEntryControls(containerId);
          inspectNote();
        });
        summary.appendChild(removeButton);
      }
      removeButton.hidden = false;
    } else if (removeButton) {
      removeButton.hidden = true;
    }
  });
}

function readEntries(containerId) {
  return [...$(`#${containerId}`).querySelectorAll(".entry")].map(entry => {
    const data = {};
    entry.querySelectorAll("[data-field]").forEach(input => {
      data[input.dataset.field] = input.value.trim();
    });
    return data;
  });
}

function buildNote() {
  const client = $("#clientName").value.trim() || "[CLIENT NAME]";
  const setting = $("#setting").value.trim() || "[LOCATION/SETTING]";
  const caregiver = $("#caregiver").value.trim() || "[CAREGIVER/STAFF]";
  const date = $("#sessionDate").value ? formatDate($("#sessionDate").value) : "[SESSION DATE]";
  const nextDate = $("#nextDate").value ? formatDate($("#nextDate").value) : "[NEXT SESSION DATE]";
  const services = $("#services").value.trim() || "DTT, NET, FCT, DRA, and prompt fading";
  const safety = $("#safetyNotes").value.trim() || "No environmental changes, medical concerns, or safety concerns were reported or observed during the session.";
  const arrival = $("#arrivalNote").value.trim() || "When the RBT arrived, the learner greeted the RBT, smiled, and transitioned into the session area.";
  const supervisor = $("#supervisor").value.trim();
  const pairing = $("#pairingNote").value.trim() || "RBT performed pairing by involving the learner in preferred activities. The learner appeared alert, motivated, and compliant, evidenced by smiles, play, and appropriate interaction with the RBT.";
  const reinforcers = $("#reinforcers").value.trim() || "verbal praise, tokens, access to preferred items, short play breaks, and social interaction";
  const progress = $("#progressSummary").value.trim() || `${client} demonstrated moderate engagement and made measurable progress with functional communication, following directions, and waiting/tolerance goals as evidenced by program data.`;
  const nextFocus = $("#nextFocus").value.trim() || "increasing independence in communication and reducing maladaptive behaviors";
  const replacementEntries = readEntries("replacementInputs");

  const supervisionSentence = supervisor && !/^none$/i.test(supervisor)
    ? ` Today, the ${supervisor} was present for supervision. Throughout the session, the ${supervisor} observed program implementation, reviewed data collection procedures, and provided immediate performance feedback.`
    : "";

  const programs = replacementEntries.map(item => {
    const name = item.name || "[Skill / replacement program]";
    const data = item.data || "[Trials and percentage]";
    const prompt = item.prompt || "[Prompt level]";
    const intervention = item.intervention || "[Named ABA intervention]";
    const behavior = item.behavior || "[Target behavior observed or none]";
    const definition = item.definition || "[Operational definition or no behavior observed]";
    const behaviorData = item.behaviorData || "[Frequency/duration or 0 occurrences]";
    const antecedent = item.antecedent || "[Antecedent]";
    const consequence = item.consequence || "[Consequence]";
    const behaviorIntervention = item.behaviorIntervention || "[Named ABA behavior intervention]";
    const response = item.response || "[Client response/outcome]";
    return `The ${name} program was implemented using ${intervention}. The RBT presented opportunities in NET and/or structured trials, and ${client} responded with ${data}. When support was needed, the RBT used ${prompt}. Correct and independent responses were reinforced with behavior-specific praise and tokens.

Target behavior observed during this program: ${behavior} (${behaviorData})
Definition: ${definition}.
ABC data collection:
A: ${antecedent}.
B: ${client} engaged in ${behavior}, defined as ${definition}.
C: The RBT implemented ${behaviorIntervention}. ${consequence}.
How client responded: ${response}.`;
  }).join("\n\n");

  return `The session occurred at ${setting} on ${date}. The RBT met with ${client} and ${caregiver} as scheduled. ${arrival} ${caregiver} was present during the session and remained nearby while services were provided. The environment during therapy was quiet and learning-friendly with no interruptions to record. ${safety}${supervisionSentence}

During the first portion of the session, ${pairing} After the pairing period, ${client} transitioned to the learning environment. RBT implemented evidence-based ABA services including ${services} in accordance with the current behavior intervention plan and skill acquisition programs.

${programs}

Reinforcers used were ${reinforcers}. ${client} demonstrated moderate participation, with stronger performance during visually supported tasks and activities paired with reinforcement. ${progress} Pairing at the beginning of the session and antecedent strategies were effective in increasing engagement and reducing avoidance behaviors. Data was collected for all targeted programs and behaviors. The next session, scheduled for ${nextDate}, will continue to focus on ${nextFocus}.`;
}

function inspectNote() {
  const note = $("#noteText").value.trim();
  const results = checks.map(check => {
    const passed = note.length > 0 && check.test(note);
    return { ...check, passed };
  });
  const score = results.reduce((total, item) => total + (item.passed ? item.points : 0), 0);
  renderScore(score);
  renderChecklist(results);
  renderCoach(results, note);
}

function renderScore(score) {
  const value = $("#scoreValue");
  const status = $("#scoreStatus");
  value.textContent = `${score}/16`;
  status.className = "status-pill";

  if (score >= 14) {
    status.textContent = "Audit Ready";
    status.classList.add("audit-ready");
  } else if (score >= 10) {
    status.textContent = "Needs Revision";
    status.classList.add("needs-revision");
  } else {
    status.textContent = "Non-Compliant";
    status.classList.add("non-compliant");
  }
}

function renderChecklist(results) {
  const list = $("#checklist");
  list.innerHTML = "";
  results.forEach(item => {
    const li = document.createElement("li");
    li.className = item.passed ? "pass" : "fail";
    li.innerHTML = `
      <span aria-hidden="true">${item.passed ? "✓" : "!"}</span>
      <strong>${item.label}</strong>
      <span class="points">${item.passed ? item.points : 0}/${item.points}</span>
      <small>${item.passed ? item.detail : item.fail}</small>
    `;
    list.appendChild(li);
  });
}

function renderCoach(results, note) {
  const coach = $("#revisionCoach");
  const failed = results.filter(item => !item.passed);

  if (!note) {
    coach.innerHTML = `<div class="coach-item">Paste a note or generate one, then run the inspector.</div>`;
    return;
  }

  if (failed.length === 0) {
    coach.innerHTML = `<div class="coach-item">This note meets the full 16-point rubric. Supervisor review is still required before billing or submission.</div>`;
    return;
  }

  const guidance = failed.map(item => {
    const fix = {
      quantitative: "Add measurable data such as 8/10 correct, 80% independence, 4 instances, or 3-minute duration.",
      targets: "Define each target using observable language with clear onset and offset criteria.",
      problemCount: "Add at least three problem behaviors, such as tantrum, elopement, and task refusal, when clinically accurate.",
      replacementCount: "Add at least three replacement behaviors, such as manding, following directions, and waiting/tolerance.",
      interventions: "Attach a named ABA intervention to each behavior: DRA, DRI, FCT, redirection, extinction, prompt hierarchy, or prompt fading.",
      response: "Document the outcome after intervention, including compliance, reduction in behavior, independence, or prompting needed.",
      abc: "For each behavior incident, add Antecedent, Behavior, and Consequence.",
      narrative: "Add setting, services provided, progress summary, and medical/safety statement."
    }[item.id];
    return `<div class="coach-item"><strong>${item.fail}.</strong> ${fix}</div>`;
  });

  coach.innerHTML = guidance.join("");
}

function countProblemBehaviors(note) {
  return countEntries(note, "Target behavior observed during this program:") || countEntries(note, "Behavior:") || countObservedBehaviorBlocks(note) || countTerms(note, problemTerms);
}

function countReplacementBehaviors(note) {
  return countEntries(note, "Skill:") || countEntries(note, "program was implemented") || countTerms(note, replacementTerms);
}

function hasSessionNarrative(note) {
  const hasSessionContext = /(session occurred|RBT met with|met with|house|home|clinic|school|location|setting)/i.test(note);
  const hasServiceDelivery = /(services provided|implemented|program was implemented|DTT|NET|FCT|skill acquisition|behavior intervention plan)/i.test(note);
  const hasProgressOrData = /(progress|data was collected|data were collected|responded with|demonstrated|participation|independent|trials|opportunities|reinforcers used)/i.test(note);
  const hasSafetyOrEnvironment = /(medical|safety|environmental|environment|interruptions|concerns|learning-friendly)/i.test(note);

  return hasSessionContext && hasServiceDelivery && hasProgressOrData && hasSafetyOrEnvironment;
}

function countObservedBehaviorBlocks(note) {
  const targetSection = note.split(/Target Behaviors Observed/i)[1] || "";
  const matches = targetSection.match(/^[A-Z][^\n]+?\([^)]+\)\s*$/gim);
  return matches ? matches.length : 0;
}

function countEntries(note, marker) {
  const regex = new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return [...note.matchAll(regex)].length;
}

function countTerms(note, terms) {
  const lower = note.toLowerCase();
  return terms.reduce((total, term) => total + (lower.includes(term) ? 1 : 0), 0);
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

async function copyText(text) {
  if (!text.trim()) return;
  await navigator.clipboard.writeText(text);
}

function resetForm() {
  $("#clientName").value = "";
  $("#setting").value = "";
  $("#caregiver").value = "";
  $("#sessionDate").value = "";
  $("#arrivalNote").value = "";
  $("#supervisor").value = "";
  $("#services").value = "DTT, NET, FCT, DRA, prompt fading";
  $("#safetyNotes").value = "No environmental changes, medical concerns, or safety concerns were reported or observed during the session.";
  $("#pairingNote").value = "RBT performed pairing by involving the learner in preferred activities. The learner appeared alert, motivated, and compliant, evidenced by smiles, play, and appropriate interaction with the RBT.";
  $("#reinforcers").value = "verbal praise, tokens, access to blocks, drawing materials, short play breaks, and social interaction";
  $("#progressSummary").value = "";
  $("#nextDate").value = "";
  $("#nextFocus").value = "";
  hydrateEntries("replacementInputs", "replacementTemplate", replacementDefaults);
}

document.addEventListener("DOMContentLoaded", () => {
  resetForm();
  renderChecklist(checks.map(check => ({ ...check, passed: false })));
  renderCoach([], "");

  $("#generateNote").addEventListener("click", () => {
    $("#noteText").value = buildNote();
    inspectNote();
  });

  $("#inspectNote").addEventListener("click", inspectNote);
  $("#noteText").addEventListener("input", inspectNote);
  $("#resetForm").addEventListener("click", resetForm);
  $("#addReplacement").addEventListener("click", addReplacementEntry);
  $("#copyGenerated").addEventListener("click", () => copyText(buildNote()));
  $("#copyFinal").addEventListener("click", () => copyText($("#noteText").value));
});
