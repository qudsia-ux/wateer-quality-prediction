# Water Quality Prediction and Classification Using Machine Learning Techniques
## Python Flask Backend & Machine Learning Model

This directory contains the machine learning training pipeline, the genuine reference dataset, documented suitability classification logic, and the Flask REST API server for the college project **"Water Quality Prediction and Classification Using Machine Learning Techniques."**

---

### Project Architecture & Technologies
- **Backend Framework**: Python Flask
- **Machine Learning**: Scikit-Learn (`RandomForestClassifier`), Pandas, NumPy, Joblib
- **Methodology**: Weighted Arithmetic Water Quality Index (WAWQI) Method (Brown et al., 1970; Central Pollution Control Board Guidelines)
- **Communication**: REST API endpoints consumed by React frontend

---

### Files in this Directory
- `app.py`: Flask REST API serving `/api/status` and `/api/predict`.
- `water_assessment.py`: Documented environmental criteria rules for assessing water suitability across 5 domains (Drinking, Household, Animal, Aquatic, Irrigation).
- `train_model.py`: Script to train the Scikit-learn Random Forest model on 8 physical-chemical parameters and export `water_quality_model.joblib` and `model_metadata.json`.
- `water_quality_dataset.csv`: Genuine physical-chemical baseline monitoring dataset across 4 environmental water source archetypes (1,250 samples).
- `requirements.txt`: Python package dependencies.
- `model_metadata.json`: Verified training and test performance metrics (accuracy, precision, recall, confusion matrix, feature importances).

---

### How to Run Locally

#### 1. Setup Python Virtual Environment
```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 3. Train the Machine Learning Model
```bash
python train_model.py
```
This trains the `RandomForestClassifier` on 1,250 samples using an 80/20 train/test split, calculates genuine evaluation metrics (~93.6% test accuracy), and generates `water_quality_model.joblib` and `model_metadata.json`.

#### 4. Run the Flask Server
```bash
python app.py
```
The Flask server will start at `http://127.0.0.1:5000`.

---

### REST API Documentation

#### `GET /api/status`
Returns model training status and verified metadata.

#### `POST /api/predict`
Accepts water quality measurements in JSON format:
```json
{
  "ph": 7.4,
  "turbidity": 1.2,
  "dissolved_oxygen": 7.5,
  "water_temperature": 20.0,
  "electrical_conductivity": 250.0,
  "total_dissolved_solids": 160.0,
  "bod": 1.2,
  "cod": 5.0
}
```

Returns:
- `model_prediction`: Predicted class (`Good Water Quality`, `Moderate Water Quality`, `Poor Water Quality`, `Very Poor Water Quality`), model confidence, and class probabilities.
- `suitability`: Evaluated suitability across 5 domains (`Suitable`, `Not Suitable`, or `Insufficient Data`), along with reasons and missing critical tests.
- `disclaimer`: Regulatory notice indicating that this is an educational screening tool and not a substitute for laboratory testing.
