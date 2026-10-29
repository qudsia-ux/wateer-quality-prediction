import React, { useState } from 'react';
import LoginPage from './LoginPage.jsx';
import {
  Droplets,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  Loader2,
  ChevronRight
} from 'lucide-react';

const PRESET_SAMPLES = {
  clean: {
    label: 'Clean River Sample',
    values: {
      ph: '7.4',
      turbidity: '1.2',
      dissolved_oxygen: '8.2',
      water_temperature: '19.5',
      electrical_conductivity: '220',
      total_dissolved_solids: '140',
      bod: '1.1',
      cod: '4.8'
    }
  },
  agricultural: {
    label: 'Agricultural Runoff',
    values: {
      ph: '7.9',
      turbidity: '7.5',
      dissolved_oxygen: '5.8',
      water_temperature: '24.0',
      electrical_conductivity: '780',
      total_dissolved_solids: '520',
      bod: '3.4',
      cod: '18.0'
    }
  },
  polluted: {
    label: 'Degraded / Industrial Stream',
    values: {
      ph: '5.2',
      turbidity: '42.0',
      dissolved_oxygen: '2.1',
      water_temperature: '28.5',
      electrical_conductivity: '1850',
      total_dissolved_solids: '1420',
      bod: '11.5',
      cod: '68.0'
    }
  }
};

const INITIAL_FORM = {
  ph: '',
  turbidity: '',
  dissolved_oxygen: '',
  water_temperature: '',
  electrical_conductivity: '',
  total_dissolved_solids: '',
  bod: '',
  cod: ''
};

function WaterQualityDashboard() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError(null);
  };

  const loadPreset = (key) => {
    const preset = PRESET_SAMPLES[key];
    if (preset) {
      setFormData(preset.values);
      setValidationErrors({});
      setServerError(null);
      setResults(null);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM);
    setValidationErrors({});
    setServerError(null);
    setResults(null);
  };

  const validateForm = () => {
    const errors = {};
    let hasAnyValue = false;

    // Numerical checks
    Object.entries(formData).forEach(([key, val]) => {
      const trimmed = String(val).trim();
      if (trimmed !== '') {
        hasAnyValue = true;
        const num = Number(trimmed);
        if (isNaN(num)) {
          errors[key] = 'Must be a valid number';
        } else {
          // Domain boundary validation
          if (key === 'ph' && (num < 0 || num > 14)) {
            errors[key] = 'pH must be between 0.0 and 14.0';
          } else if (key === 'water_temperature' && (num < -10 || num > 100)) {
            errors[key] = 'Temperature must be between -10 °C and 100 °C';
          } else if (['turbidity', 'dissolved_oxygen', 'electrical_conductivity', 'total_dissolved_solids', 'bod', 'cod'].includes(key) && num < 0) {
            errors[key] = 'Value cannot be negative';
          } else if (key === 'dissolved_oxygen' && num > 25) {
            errors[key] = 'Concentration exceeds saturation limit (> 25 mg/L)';
          }
        }
      }
    });

    if (!hasAnyValue) {
      errors.general = 'Please enter at least one water quality parameter.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {};
      Object.entries(formData).forEach(([k, v]) => {
        const trimmed = String(v).trim();
        payload[k] = trimmed === '' ? null : Number(trimmed);
      });

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setServerError(data.error || 'Failed to obtain water quality prediction from server.');
        setResults(null);
      } else {
        setResults(data);
        // Scroll smoothly to results
        setTimeout(() => {
          const el = document.getElementById('results-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch (err) {
      setServerError('Unable to communicate with the Flask prediction service. Please ensure the backend is running.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSuitabilityBadge = (status) => {
    if (status === 'Suitable') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          Suitable
        </span>
      );
    }
    if (status === 'Not Suitable') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          Not Suitable
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        Insufficient Data
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-blue-50 text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Main Application Container */}
        <div className="bg-white rounded-2xl border border-sky-200 shadow-md overflow-hidden">
          
          {/* Water Image Header Banner */}
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-sky-200">
            <img
              src="/src/assets/images/water_surface_clean_1792955484968.jpg"
              alt="Clean natural freshwater surface with ripples"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Soft sky-blue gradient contrast overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-sky-950/80 via-sky-900/40 to-sky-800/10 flex flex-col justify-end p-6 sm:p-8 text-white">
              <div className="inline-flex items-center gap-1.5 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <Droplets className="w-4 h-4 text-sky-300" />
                <span>Environmental Water Assessment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
                Water Quality Prediction System
              </h1>
              <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl font-normal">
                Enter the water quality parameters to assess water quality and its possible uses.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Quick Presets for Convenient Testing */}
            <div className="pb-6 border-b border-sky-100 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-1">Sample Presets:</span>
              <button
                type="button"
                onClick={() => loadPreset('clean')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer"
              >
                Clean River
              </button>
              <button
                type="button"
                onClick={() => loadPreset('agricultural')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
              >
                Agricultural
              </button>
              <button
                type="button"
                onClick={() => loadPreset('polluted')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
              >
                Degraded Stream
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                title="Clear all fields"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Validation Notice or Server Error */}
          {serverError && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-800">
                <p className="font-semibold">Prediction Request Failed</p>
                <p className="mt-0.5 text-xs text-rose-700">{serverError}</p>
              </div>
            </div>
          )}

          {validationErrors.general && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">{validationErrors.general}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              {/* Field 1: pH */}
              <div>
                <label htmlFor="ph" className="block text-sm font-semibold text-slate-800 mb-1">
                  pH <span className="text-xs font-normal text-slate-500">(0.0 – 14.0)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="ph"
                  value={formData.ph}
                  onChange={(e) => handleInputChange('ph', e.target.value)}
                  placeholder="e.g. 7.2"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.ph ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.ph && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.ph}</p>
                )}
              </div>

              {/* Field 2: Turbidity */}
              <div>
                <label htmlFor="turbidity" className="block text-sm font-semibold text-slate-800 mb-1">
                  Turbidity <span className="text-xs font-normal text-slate-500">(NTU)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="turbidity"
                  value={formData.turbidity}
                  onChange={(e) => handleInputChange('turbidity', e.target.value)}
                  placeholder="e.g. 2.4"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.turbidity ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.turbidity && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.turbidity}</p>
                )}
              </div>

              {/* Field 3: Dissolved Oxygen */}
              <div>
                <label htmlFor="dissolved_oxygen" className="block text-sm font-semibold text-slate-800 mb-1">
                  Dissolved Oxygen <span className="text-xs font-normal text-slate-500">(mg/L)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="dissolved_oxygen"
                  value={formData.dissolved_oxygen}
                  onChange={(e) => handleInputChange('dissolved_oxygen', e.target.value)}
                  placeholder="e.g. 7.5"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.dissolved_oxygen ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.dissolved_oxygen && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.dissolved_oxygen}</p>
                )}
              </div>

              {/* Field 4: Water Temperature */}
              <div>
                <label htmlFor="water_temperature" className="block text-sm font-semibold text-slate-800 mb-1">
                  Water Temperature <span className="text-xs font-normal text-slate-500">(°C)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="water_temperature"
                  value={formData.water_temperature}
                  onChange={(e) => handleInputChange('water_temperature', e.target.value)}
                  placeholder="e.g. 21.0"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.water_temperature ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.water_temperature && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.water_temperature}</p>
                )}
              </div>

              {/* Field 5: Electrical Conductivity */}
              <div>
                <label htmlFor="electrical_conductivity" className="block text-sm font-semibold text-slate-800 mb-1">
                  Electrical Conductivity <span className="text-xs font-normal text-slate-500">(µS/cm)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="electrical_conductivity"
                  value={formData.electrical_conductivity}
                  onChange={(e) => handleInputChange('electrical_conductivity', e.target.value)}
                  placeholder="e.g. 350.0"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.electrical_conductivity ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.electrical_conductivity && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.electrical_conductivity}</p>
                )}
              </div>

              {/* Field 6: Total Dissolved Solids */}
              <div>
                <label htmlFor="total_dissolved_solids" className="block text-sm font-semibold text-slate-800 mb-1">
                  Total Dissolved Solids <span className="text-xs font-normal text-slate-500">(mg/L)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="total_dissolved_solids"
                  value={formData.total_dissolved_solids}
                  onChange={(e) => handleInputChange('total_dissolved_solids', e.target.value)}
                  placeholder="e.g. 220.0"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.total_dissolved_solids ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.total_dissolved_solids && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.total_dissolved_solids}</p>
                )}
              </div>

              {/* Field 7: BOD */}
              <div>
                <label htmlFor="bod" className="block text-sm font-semibold text-slate-800 mb-1">
                  Biochemical Oxygen Demand <span className="text-xs font-normal text-slate-500">(mg/L)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="bod"
                  value={formData.bod}
                  onChange={(e) => handleInputChange('bod', e.target.value)}
                  placeholder="e.g. 1.5"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.bod ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.bod && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.bod}</p>
                )}
              </div>

              {/* Field 8: COD */}
              <div>
                <label htmlFor="cod" className="block text-sm font-semibold text-slate-800 mb-1">
                  Chemical Oxygen Demand <span className="text-xs font-normal text-slate-500">(mg/L)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="cod"
                  value={formData.cod}
                  onChange={(e) => handleInputChange('cod', e.target.value)}
                  placeholder="e.g. 6.0"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors ${
                    validationErrors.cod ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300'
                  }`}
                />
                {validationErrors.cod && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.cod}</p>
                )}
              </div>
            </div>

            {/* Prominent Prediction Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:scale-[0.99] focus:outline-none focus:ring-3 focus:ring-sky-500/40 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Predicting Water Quality...</span>
                  </>
                ) : (
                  <span>Predict Water Quality</span>
                )}
              </button>
            </div>
          </form>

          {/* Results Section */}
          {results && (
            <div id="results-section" className="mt-12 pt-10 border-t border-slate-200 space-y-6">
              
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-slate-900">
                  Prediction &amp; Suitability Results
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluated using trained Scikit-learn Machine Learning models and documented environmental standards.
                </p>
              </div>

              {/* 1. Water Quality Classification Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100/80">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      1. Water Quality Classification
                    </h3>
                    <p className="text-xs text-slate-500">
                      Machine Learning classification model prediction
                    </p>
                  </div>

                  {results.model_prediction?.available && (
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold shadow-xs ${
                      results.model_prediction.classification.includes('Good')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : results.model_prediction.classification.includes('Moderate')
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : results.model_prediction.classification.includes('Poor') && !results.model_prediction.classification.includes('Very')
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {results.model_prediction.classification}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {results.model_prediction?.available ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700">
                        The trained <span className="font-semibold text-slate-900">{results.model_prediction.model_name}</span> categorized this sample as <span className="font-semibold">{results.model_prediction.classification}</span> with <span className="font-semibold font-mono">{(results.model_prediction.confidence * 100).toFixed(1)}%</span> model confidence.
                      </p>

                      {/* Class probabilities breakdown */}
                      {results.model_prediction.probabilities && (
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-slate-600 mb-1.5">Class Probabilities:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(results.model_prediction.probabilities).map(([cls, prob]) => (
                              <div key={cls} className="p-2 rounded-lg bg-white border border-slate-200 text-xs">
                                <span className="block text-slate-500 truncate" title={cls}>{cls.replace(' Water Quality', '')}</span>
                                <span className="font-mono font-semibold text-slate-800">{(prob * 100).toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.model_prediction.imputed_features?.length > 0 && (
                        <p className="text-xs text-slate-500 italic">
                          Omitted parameters ({results.model_prediction.imputed_features.join(', ')}) were imputed with median reference freshwater values for the ML model.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-1">
                      <p className="font-semibold">Model Not Trained</p>
                      <p className="text-xs">
                        {results.model_prediction?.message || 'A trained machine learning model is currently not available. Please run the backend training pipeline (`python3 backend/train_model.py`) before classification predictions can be made.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards 2 to 6: Suitability Assessments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 2. Suitable for Human Drinking? */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        2. Suitable for Human Drinking?
                      </h3>
                      {renderSuitabilityBadge(results.suitability?.human_drinking?.status)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {results.suitability?.human_drinking?.reason}
                    </p>
                  </div>

                  {results.suitability?.human_drinking?.missing_measurements?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">Missing Required Tests:</span>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {results.suitability.human_drinking.missing_measurements.map((item, idx) => (
                          <li key={idx} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 3. Suitable for Household Use? */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        3. Suitable for Household Use?
                      </h3>
                      {renderSuitabilityBadge(results.suitability?.household_use?.status)}
                    </div>
                    <p className="text-xs text-slate-400 font-normal">Bathing, washing and cleaning</p>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {results.suitability?.household_use?.reason}
                    </p>
                  </div>

                  {results.suitability?.household_use?.missing_measurements?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">Missing Measurements:</span>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {results.suitability.household_use.missing_measurements.map((item, idx) => (
                          <li key={idx} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 4. Suitable for Animal Drinking? */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        4. Suitable for Animal Drinking?
                      </h3>
                      {renderSuitabilityBadge(results.suitability?.animal_drinking?.status)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {results.suitability?.animal_drinking?.reason}
                    </p>
                  </div>

                  {results.suitability?.animal_drinking?.missing_measurements?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">Missing Measurements:</span>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {results.suitability.animal_drinking.missing_measurements.map((item, idx) => (
                          <li key={idx} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 5. Suitable for Aquatic Animals? */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        5. Suitable for Aquatic Animals?
                      </h3>
                      {renderSuitabilityBadge(results.suitability?.aquatic_animals?.status)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {results.suitability?.aquatic_animals?.reason}
                    </p>
                  </div>

                  {results.suitability?.aquatic_animals?.missing_measurements?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">Unchecked Toxins / Measurements:</span>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {results.suitability.aquatic_animals.missing_measurements.map((item, idx) => (
                          <li key={idx} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 6. Suitable for Plants and Irrigation? */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between md:col-span-2">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        6. Suitable for Plants and Irrigation?
                      </h3>
                      {renderSuitabilityBadge(results.suitability?.plants_irrigation?.status)}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      {results.suitability?.plants_irrigation?.reason}
                    </p>
                  </div>

                  {results.suitability?.plants_irrigation?.missing_measurements?.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700 block mb-1">Unchecked Agricultural Variables:</span>
                      <ul className="list-disc list-inside text-slate-500 space-y-0.5">
                        {results.suitability.plants_irrigation.missing_measurements.map((item, idx) => (
                          <li key={idx} className="truncate" title={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

              </div>

              {/* Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800">Educational Screening Notice: </span>
                  {results.disclaimer}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [signedIn, setSignedIn] = useState(false);

  if (!signedIn) {
    return <LoginPage onSignIn={() => setSignedIn(true)} />;
  }

  return <WaterQualityDashboard />;
}
