# Water Quality Prediction and Classification Using Machine Learning Techniques

An educational web application for the college project **"Water Quality Prediction and Classification Using Machine Learning Techniques."**

---

## 1. System Overview

- **Frontend**: React.js (JavaScript JSX), Tailwind CSS, Lucide icons
- **Backend**: Python Flask REST API
- **Machine Learning**: Scikit-Learn (`RandomForestClassifier`), Pandas, NumPy, Joblib
- **Methodology**: Weighted Arithmetic Water Quality Index (WAWQI) based on Brown et al. (1970) and Central Pollution Control Board (CPCB) criteria
- **Communication**: JSON REST API (`/api/predict` and `/api/status`)

---

## 2. Water Quality Assessment Parameters

1. **pH**: Standard range 6.5 – 8.5
2. **Turbidity (NTU)**: Ideal < 1 NTU, acceptable drinking limit < 5 NTU
3. **Dissolved Oxygen (mg/L)**: Essential for aquatic life (>= 5.0 mg/L minimum)
4. **Water Temperature (°C)**: Thermal balance and oxygen solubility
5. **Electrical Conductivity (µS/cm)**: Dissolved ionic concentration and salinity
6. **Total Dissolved Solids (mg/L)**: Mineral content (drinking ideal < 300 mg/L, max 1,000 mg/L)
7. **Biochemical Oxygen Demand (mg/L)**: Organic pollution load (clean water < 2 mg/L)
8. **Chemical Oxygen Demand (mg/L)**: Total chemical oxidizable pollutants (clean water < 10 mg/L)

---

## 3. Suitability Assessment Domains & Criteria

The application evaluates 5 distinct suitability domains based on documented public health and environmental guidelines (WHO, US EPA, USDA/NAS, FAO):

1. **Suitable for Human Drinking?**
   - *Evaluated against*: WHO Guidelines for Drinking-water Quality (4th ed.) and US EPA National Primary Drinking Water Regulations.
   - *Documented Safety Rule*: Water cannot be declared "Suitable" for human drinking based solely on physical-chemical parameters. Even if all measured parameters pass, bacteriological testing (*E. coli*, fecal coliforms) and toxic contaminant screening (arsenic, lead, nitrates, pesticides) are required. In the absence of these tests, the tool returns **"Insufficient Data"**. If any measured parameter exceeds permissible limits, it returns **"Not Suitable"**.
2. **Suitable for Household Use?**
   - *Evaluated against*: CPCB Class B (Outdoor Bathing) and domestic washing guidelines. Evaluates skin-irritating pH extremes, staining turbidity, and organic odor/bacterial potential.
3. **Suitable for Animal Drinking?**
   - *Evaluated against*: National Academy of Sciences (NAS) and USDA Livestock Water Quality Standards (salinity/TDS limits, pH range, organic putrefaction).
4. **Suitable for Aquatic Animals?**
   - *Evaluated against*: US EPA Aquatic Life Ambient Water Quality Criteria (DO hypoxia thresholds >= 4–5 mg/L, pH buffering, low BOD).
5. **Suitable for Plants and Irrigation?**
   - *Evaluated against*: FAO Irrigation and Drainage Paper 29 (Ayers & Westcot). Evaluates salinity hazard (EC and TDS) and soil alkalinity/acidity restrictions.

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18 or higher) & npm
- Python 3.9+ with pip

### Running the Python Flask Backend
```bash
# 1. Open a terminal and enter the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Train the Random Forest ML model on the genuine WAWQI dataset
python train_model.py

# 5. Start the Flask REST API server
python app.py
# Server runs on http://127.0.0.1:5000
```

### Running the React Frontend
```bash
# 1. Open a second terminal in the project root
npm install

# 2. Start the Vite React development server
npm run dev
# React app runs on http://localhost:3000
```

The Vite dev server is pre-configured with a reverse proxy in `vite.config.ts` and `server.ts` that forwards all `/api/*` calls from the React frontend (`http://localhost:3000/api/*`) directly to the Flask backend on port 5000 (`http://127.0.0.1:5000/api/*`).

---

## 5. Educational Disclaimer

This application is designed as an educational screening and classification tool. It is not a substitute for accredited laboratory analysis, official bacteriological testing, or regulatory water safety certification.
