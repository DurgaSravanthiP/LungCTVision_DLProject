import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import bcrypt from "bcrypt";
import cors from "cors";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";

import authMiddleware from "./middleware/authMiddleware.js";
import Analysis from "./models/Analysis.js";
import User from "./models/User.js";
import { runPythonPrediction } from "./services/pythonService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5100;
const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/lungscope_ai";
const JWT_SECRET = process.env.JWT_SECRET || "lungscope-ai-dev-secret";

const app = express();
const uploadDir = path.join(__dirname, "uploads", "temp");
const historyImageDir = path.join(__dirname, "uploads", "history");
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(historyImageDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const extensionByMimeType = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };
      cb(null, `${randomUUID()}${extensionByMimeType[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
    }
    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());

function sanitizeUser(user) {
  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    hospital: user.hospital || "",
    specialization: user.specialization || "",
    doctorId: user.doctorId || "",
  };
}

function signToken(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function toAnalysisRecord(record) {
  return {
    id: record._id.toString(),
    patientId: record.patientId || "",
    scanType: record.scanType,
    diseaseType: record.diseaseType || "",
    prediction: record.prediction,
    confidence: Number(record.confidence),
    imageAvailable: Boolean(record.imageName),
    createdAt: record.createdAt,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "LungScope AI API",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const {
    name,
    email,
    password,
    hospital = "",
    specialization = "",
    doctorId = "",
  } = req.body || {};

  if (!name?.trim() || !email?.trim() || !password) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Name, email, and password are required.",
      });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          message: "An account with this email already exists.",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      hospital: hospital.trim(),
      specialization: specialization.trim(),
      doctorId: doctorId.trim(),
    });

    const token = signToken(user);
    return res
      .status(201)
      .json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email?.trim() || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user);
    return res.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed." });
  }
});

app.post("/api/auth/logout", authMiddleware, (_req, res) => {
  return res.json({ success: true, message: "Logged out successfully." });
});

app.patch("/api/auth/profile", authMiddleware, async (req, res) => {
  const { name, email, hospital = "", specialization = "", doctorId = "" } =
    req.body || {};
  if (!name?.trim() || !email?.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res
      .status(400)
      .json({ success: false, message: "Enter a valid email address." });
  }
  try {
    const duplicate = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    });
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That email address is already in use.",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: normalizedEmail,
        hospital: hospital.trim(),
        specialization: specialization.trim(),
        doctorId: doctorId.trim(),
      },
      { new: true, runValidators: true },
    );
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Unable to update your profile." });
  }
});

app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.json({ success: true, user: sanitizeUser(user) });
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  return res.json({ success: true, user: sanitizeUser(user) });
});

async function handleAnalyze(req, res) {
  const files = req.files || {};
  const uploads = [];
  const retainedImagePaths = [];
  let analysisSaved = false;
  const patientId = req.body?.patientId?.trim?.() || "";

  if (files.lungCtImage?.[0]) {
    uploads.push({
      file: files.lungCtImage[0],
      scanType: "lung_ct",
      diseaseType: "Five-class lung cancer classification",
    });
  }
  if (files.image?.[0]) {
    uploads.push({
      file: files.image[0],
      scanType: req.body?.scanType || "lung_ct",
      diseaseType: "Five-class lung cancer classification",
    });
  }

  try {
    if (uploads.some(({ scanType }) => scanType !== "lung_ct")) {
      return res
        .status(400)
        .json({ success: false, message: "Only lung CT scans are supported." });
    }

    if (uploads.length !== 1) {
      return res
        .status(400)
        .json({ success: false, message: "Please upload one lung CT image." });
    }

    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, message: "Patient ID is required." });
    }

    const predictionResults = await Promise.allSettled(
      uploads.map(async ({ file, scanType, diseaseType }) => ({
        file,
        scanType,
        diseaseType,
        prediction: await runPythonPrediction(file.path, file.originalname),
      })),
    );
    const failedPrediction = predictionResults.find(
      (result) => result.status === "rejected",
    );
    if (failedPrediction) throw failedPrediction.reason;
    const predictions = predictionResults.map((result) => result.value);
    for (const prediction of predictions) {
      prediction.imageName = prediction.file.filename;
      const retainedImagePath = path.join(
        historyImageDir,
        prediction.imageName,
      );
      await fs.promises.rename(prediction.file.path, retainedImagePath);
      retainedImagePaths.push(retainedImagePath);
    }

    const records = await Analysis.insertMany(
      predictions.map(({ scanType, diseaseType, prediction, imageName }) => ({
        userId: req.user.id,
        patientId,
        scanType,
        diseaseType,
        prediction: prediction.prediction,
        confidence: Number(prediction.confidence),
        imageName,
      })),
    );
    analysisSaved = true;
    const analyses = records.map(toAnalysisRecord);
    const primaryAnalysis = analyses[0];

    return res.status(200).json({
      success: true,
      ...primaryAnalysis,
      analyses,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Python prediction failed.",
      });
  } finally {
    if (!analysisSaved) {
      for (const retainedImagePath of retainedImagePaths) {
        if (fs.existsSync(retainedImagePath)) fs.unlinkSync(retainedImagePath);
      }
    }
    Object.values(files).flat().forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
  }
}

const analysisUploads = upload.fields([
  { name: "lungCtImage", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

app.post("/api/analyze", authMiddleware, analysisUploads, handleAnalyze);
app.post(
  "/api/analyses",
  authMiddleware,
  analysisUploads,
  async (req, res) => {
    req.body = {
      ...req.body,
      scanType: req.body.scanType || req.body.modality || req.body.type,
    };
    return handleAnalyze(req, res);
  },
);

app.get("/api/analysis/history", authMiddleware, async (req, res) => {
  const items = await Analysis.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ success: true, history: items.map(toAnalysisRecord) });
});

app.get("/api/analysis", authMiddleware, async (req, res) => {
  const items = await Analysis.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ success: true, history: items.map(toAnalysisRecord) });
});

app.get("/api/analysis/:id", authMiddleware, async (req, res) => {
  const item = await Analysis.findById(req.params.id).lean();
  if (!item) {
    return res
      .status(404)
      .json({ success: false, message: "Analysis record not found." });
  }

  if (item.userId.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized history access." });
  }

  return res.json({ success: true, analysis: toAnalysisRecord(item) });
});

app.get("/api/analysis/:id/image", authMiddleware, async (req, res) => {
  const item = await Analysis.findById(req.params.id).lean();
  if (!item) {
    return res
      .status(404)
      .json({ success: false, message: "Analysis record not found." });
  }

  if (item.userId.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ success: false, message: "Unauthorized history access." });
  }

  if (!item.imageName || path.basename(item.imageName) !== item.imageName) {
    return res
      .status(404)
      .json({ success: false, message: "No image is saved for this analysis." });
  }

  const imagePath = path.join(historyImageDir, item.imageName);
  if (!fs.existsSync(imagePath)) {
    return res
      .status(404)
      .json({ success: false, message: "Saved analysis image was not found." });
  }

  res.set("Cache-Control", "private, no-store");
  res.set("X-Content-Type-Options", "nosniff");
  return res.sendFile(imagePath);
});

app.get("/api/analyses", authMiddleware, async (req, res) => {
  const items = await Analysis.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ success: true, analyses: items.map(toAnalysisRecord) });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res
      .status(400)
      .json({
        success: false,
        message: error.message || "Image upload failed.",
      });
  }

  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.message || "Invalid request." });
  }

  return res
    .status(500)
    .json({ success: false, message: "Unexpected server error." });
});

async function startServer() {
  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
}

startServer().catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
});
