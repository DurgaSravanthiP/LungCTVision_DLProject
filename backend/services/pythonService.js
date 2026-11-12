import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PYTHON_DIR = path.resolve(__dirname, "../../python_files");

export function runPythonPrediction(filePath) {
  const scriptPath = path.join(PYTHON_DIR, "lung_ct_predict.py");

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python model script not found: ${scriptPath}`));
    }

    const child = spawn("python", [scriptPath, filePath], {
      cwd: PYTHON_DIR,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(new Error(`Unable to start Python prediction: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr.trim() || "Python prediction failed."));
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (parsed.success === false) {
          return reject(new Error(parsed.message || "Prediction failed."));
        }
        if (!parsed.prediction || parsed.confidence === undefined) {
          return reject(new Error("Prediction output was incomplete."));
        }
        resolve(parsed);
      } catch (error) {
        reject(
          new Error(
            `Invalid JSON returned by Python model: ${stdout.trim() || error.message}`,
          ),
        );
      }
    });
  });
}
