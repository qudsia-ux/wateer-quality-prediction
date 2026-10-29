"""
Water Quality Prediction & Classification REST API
Backend: Python Flask, Scikit-learn, Pandas, NumPy, Joblib
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from water_assessment import perform_all_suitability_assessments

app = Flask(__name__)

MODEL_PATH = os.path.join(BASE_DIR, 'water_quality_model.joblib')
METADATA_PATH = os.path.join(BASE_DIR, 'model_metadata.json')
DATASET_PATH = os.path.join(BASE_DIR, 'water_quality_dataset.csv')

# Feature definitions and typical reference medians for imputing optional blank fields
FEATURE_DEFAULTS = {
    'ph': 7.2,
    'turbidity': 4.0,
    'dissolved_oxygen': 6.5,
    'water_temperature': 22.0,
    'electrical_conductivity': 400.0,
    'total_dissolved_solids': 260.0,
    'bod': 2.5,
    'cod': 12.0
}

FEATURE_LABELS = {
    'ph': 'pH',
    'turbidity': 'Turbidity (NTU)',
    'dissolved_oxygen': 'Dissolved Oxygen (mg/L)',
    'water_temperature': 'Water Temperature (°C)',
    'electrical_conductivity': 'Electrical Conductivity (µS/cm)',
    'total_dissolved_solids': 'Total Dissolved Solids (mg/L)',
    'bod': 'Biochemical Oxygen Demand (mg/L)',
    'cod': 'Chemical Oxygen Demand (mg/L)'
}

def load_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(METADATA_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            with open(METADATA_PATH, 'r') as f:
                metadata = json.load(f)
            return model, metadata
        except Exception as e:
            print("Error loading model:", e)
            return None, None
    return None, None

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/api/status', methods=['GET'])
def get_status():
    model, metadata = load_model()
    if model is None:
        return jsonify({
            "status": "uninitialized",
            "model_available": False,
            "message": "The machine learning model has not been trained yet. Please run backend/train_model.py before making predictions."
        })
    return jsonify({
        "status": "ready",
        "model_available": True,
        "metadata": metadata
    })

@app.route('/api/predict', methods=['POST'])
def predict_water_quality():
    try:
        data = request.get_json(silent=True) or {}
    except Exception as e:
        return jsonify({"success": False, "error": "Invalid JSON payload"}), 400

    parsed_params = {}
    validation_errors = []
    provided_count = 0

    # Validate parameters
    for key in FEATURE_DEFAULTS.keys():
        raw_val = data.get(key)
        
        # Check if empty string or None
        if raw_val is None or str(raw_val).strip() == '':
            parsed_params[key] = None
            continue

        try:
            val = float(raw_val)
        except (ValueError, TypeError):
            validation_errors.append(f"'{FEATURE_LABELS[key]}' must be a valid numerical value.")
            continue

        # Physical domain checks
        if key == 'ph' and (val < 0.0 or val > 14.0):
            validation_errors.append("pH must be between 0.0 and 14.0.")
        elif key == 'water_temperature' and (val < -10.0 or val > 100.0):
            validation_errors.append("Water Temperature must be between -10.0 °C and 100.0 °C.")
        elif key in ['turbidity', 'dissolved_oxygen', 'electrical_conductivity', 'total_dissolved_solids', 'bod', 'cod']:
            if val < 0.0:
                validation_errors.append(f"'{FEATURE_LABELS[key]}' cannot be negative.")
            elif key == 'dissolved_oxygen' and val > 25.0:
                validation_errors.append("Dissolved Oxygen concentration exceeds normal water saturation limits (> 25 mg/L).")

        parsed_params[key] = val
        provided_count += 1

    if validation_errors:
        return jsonify({
            "success": False,
            "error": "Validation failed: " + " ".join(validation_errors),
            "validation_errors": validation_errors
        }), 422

    if provided_count == 0:
        return jsonify({
            "success": False,
            "error": "Please enter at least one water quality parameter to assess.",
            "validation_errors": ["No parameters provided."]
        }), 400

    # 1. Machine Learning Classification
    model, metadata = load_model()
    ml_result = {}
    
    if model is None:
        ml_result = {
            "available": False,
            "message": "The Machine Learning model is not currently trained. Train the model using backend/train_model.py to enable automated classification."
        }
    else:
        # Build feature vector: use provided values, and use dataset median defaults for missing optional features
        feature_order = metadata.get('features', list(FEATURE_DEFAULTS.keys()))
        feature_values = []
        imputed_features = []

        for feat in feature_order:
            if parsed_params.get(feat) is not None:
                feature_values.append(parsed_params[feat])
            else:
                feature_values.append(FEATURE_DEFAULTS[feat])
                imputed_features.append(FEATURE_LABELS[feat])

        features_df = pd.DataFrame([feature_values], columns=feature_order)
        
        try:
            pred_class = model.predict(features_df)[0]
            probabilities = {}
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(features_df)[0]
                for cls_name, prob in zip(model.classes_, probs):
                    probabilities[cls_name] = round(float(prob), 4)

            confidence = probabilities.get(pred_class, 1.0)
            
            ml_result = {
                "available": True,
                "classification": str(pred_class),
                "confidence": confidence,
                "probabilities": probabilities,
                "model_name": metadata.get("model_name", "Random Forest Classifier"),
                "imputed_features": imputed_features,
                "metrics_accuracy": metadata.get("metrics", {}).get("accuracy")
            }
        except Exception as err:
            ml_result = {
                "available": False,
                "message": f"Error running ML inference: {str(err)}"
            }

    # 2. Documented Suitability Assessments
    suitability = perform_all_suitability_assessments(parsed_params)

    return jsonify({
        "success": True,
        "parameters": parsed_params,
        "provided_count": provided_count,
        "model_prediction": ml_result,
        "suitability": suitability,
        "disclaimer": "This system is an academic screening tool for educational and preliminary analysis. It is NOT a substitute for accredited laboratory testing, certified bacteriological analysis, or official regulatory drinking water certification."
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Flask Water Quality REST API on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
