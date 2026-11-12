# LungScope AI

LungScope AI is a lung CT image-classification application with patient-linked
results, account access, and analysis history. It classifies an uploaded image
into one of the five classes in the local lung cancer dataset:

- Adenocarcinoma
- Benign cases
- Large cell carcinoma
- Normal cases
- Squamous cell carcinoma

This project is for educational and research use. Model output and confidence
are not a medical diagnosis and must not replace review by a qualified
healthcare professional.

## Project structure

```text
backend/
  models/                 MongoDB schemas
  services/               Python model integration
  server.js               Express API, authentication, and analysis routes
frontend/
  src/                    React pages, components, and API services
  vite.config.js          Vite development server and API proxy
python_files/
  datasets/
    Lung Cancer Dataset/  Local images, grouped into five class folders
  prepare_lung_ct_dataset.py
  train_lung_ct_model.py
  lung_ct_predict.py
  lung_cancer_model.ipynb  Training and evaluation notebook
```

The training pipeline makes reproducible, class-stratified 70/15/15
train/validation/test splits under `python_files/processed_data/lung_cancer_ct`.
It trains an ImageNet-pretrained EfficientNetB0 with 224 × 224 RGB images,
evaluates it on the held-out test split, and saves
`lung_cancer_classifier.keras` and `lung_ct_class_names.json` beside the Python
scripts.

## Requirements

- Node.js and npm
- Python with TensorFlow, NumPy, and Pillow
- MongoDB, running locally or available through a MongoDB connection URI

From `python_files/`, install the model dependencies and train the new
five-class model:

```powershell
cd python_files
python -m pip install -r requirements.txt
python prepare_lung_ct_dataset.py
python train_lung_ct_model.py
```

Alternatively, open `python_files/lung_cancer_model.ipynb` and run its cells.
The first training run needs an internet connection to download EfficientNet's
pretrained ImageNet weights. Training creates a new model; it does not reuse
the previous two-class lung model.

## Run locally on Windows

### 1. Configure MongoDB and the backend

Start MongoDB. In PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Set `MONGODB_URI` if needed and replace `JWT_SECRET` with a private random
secret. The default database is `lungscope_ai`.
Keep `.env` private; it is excluded from Git.

Install backend dependencies and start the API:

```powershell
npm install
npm run dev
```

The API listens on `http://localhost:5100` by default.

### 2. Start the frontend

Open another PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite runs at `http://localhost:5174` and forwards `/api` requests to the
backend on port 5100.

### 3. Use the application

1. Sign up, then sign in.
2. Open **Analyze Scan** and enter a patient ID.
3. Upload one lung CT image (JPG, PNG, or WEBP; up to 5 MB).
4. Review the predicted class and confidence.
5. Open **History** to review saved results and timestamps.

The backend runs the Python model from `python_files/`. Train the model before
running an analysis.

## Useful commands

From `frontend/`:

```powershell
npm run build
npm run lint
```

From `backend/`:

```powershell
npm run dev
npm start
```

## Data and privacy

- The original dataset and generated image splits are local and excluded from
  Git.
- Uploaded scan images are kept under `backend/uploads/`.
- Do not upload identifiable patient information or clinical images unless
  you have the necessary authorization and safeguards.
- A model confidence score is not a measure of clinical certainty.
