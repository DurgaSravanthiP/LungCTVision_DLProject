import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: { type: String, default: "" },
    scanType: {
      type: String,
      enum: ["lung_ct"],
      required: true,
    },
    diseaseType: { type: String, required: true },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    imageName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Analysis", analysisSchema);
