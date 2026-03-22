/**
 * pipeline.ts - Orchestrates the full BuildingTruth data pipeline.
 *
 * Steps:
 *   1. ingest  - Pull raw data from SF Open Data SODA APIs
 *   2. match   - Normalize addresses and link records to landlords
 *   3. score   - Compute composite accountability scores
 *
 * Usage:
 *   npx tsx scripts/pipeline.ts           # run all steps
 *   npx tsx scripts/pipeline.ts ingest    # run only ingest
 *   npx tsx scripts/pipeline.ts match     # run only match
 *   npx tsx scripts/pipeline.ts score     # run only score
 */

import { ingest } from "./ingest.js";
import { match } from "./match.js";
import { score } from "./score.js";

type StepName = "ingest" | "match" | "score";

interface PipelineStep {
  name: StepName;
  fn: () => Promise<void>;
}

const ALL_STEPS: PipelineStep[] = [
  { name: "ingest", fn: ingest },
  { name: "match", fn: match },
  { name: "score", fn: score },
];

async function runPipeline(stepsToRun?: StepName[]): Promise<void> {
  const startTime = Date.now();

  console.log("╔══════════════════════════════════════════╗");
  console.log("║     BuildingTruth Data Pipeline          ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log();
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`Working directory: ${process.cwd()}`);

  const steps = stepsToRun
    ? ALL_STEPS.filter((s) => stepsToRun.includes(s.name))
    : ALL_STEPS;

  if (steps.length === 0) {
    console.error("No valid steps specified.");
    console.error("Available steps: ingest, match, score");
    process.exit(1);
  }

  console.log(
    `Steps to run: ${steps.map((s) => s.name).join(" -> ")}\n`
  );

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepStart = Date.now();

    console.log(
      `\n${"=".repeat(50)}`
    );
    console.log(
      `Step ${i + 1}/${steps.length}: ${step.name.toUpperCase()}`
    );
    console.log("=".repeat(50));

    try {
      await step.fn();
      const elapsed = ((Date.now() - stepStart) / 1000).toFixed(1);
      console.log(`\n[${step.name}] Completed in ${elapsed}s`);
    } catch (err) {
      const elapsed = ((Date.now() - stepStart) / 1000).toFixed(1);
      console.error(
        `\n[${step.name}] FAILED after ${elapsed}s:`,
        err instanceof Error ? err.message : err
      );

      // For ingest failures, continue if some sources succeeded
      if (step.name === "ingest") {
        console.warn(
          "Ingest had errors but continuing pipeline with available data..."
        );
        continue;
      }

      // For other steps, abort
      throw err;
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Pipeline complete in ${totalElapsed}s`);
  console.log(`Finished at: ${new Date().toISOString()}`);
}

// Parse CLI args and run
const args = process.argv.slice(2);
const validSteps: StepName[] = ["ingest", "match", "score"];

const requestedSteps = args.length > 0
  ? args.filter((a): a is StepName => validSteps.includes(a as StepName))
  : undefined;

if (args.length > 0 && (!requestedSteps || requestedSteps.length === 0)) {
  console.error(`Unknown step(s): ${args.join(", ")}`);
  console.error("Available steps: ingest, match, score");
  process.exit(1);
}

runPipeline(requestedSteps).catch((err) => {
  console.error("\nPipeline failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
