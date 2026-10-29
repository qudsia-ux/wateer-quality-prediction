"""
Water Quality Assessment Logic based on Documented Environmental & Public Health Standards:
- WHO Guidelines for Drinking-water Quality (4th ed.)
- US EPA National Primary & Secondary Drinking Water Regulations
- US EPA Aquatic Life Criteria & Freshwater Ecology Guidelines
- USDA / National Academy of Sciences (NAS) Livestock Water Quality Criteria
- FAO (Food and Agriculture Organization) Irrigation Water Quality Guidelines (Ayers & Westcot)
- CPCB (Central Pollution Control Board) Water Quality Criteria & Weighted Arithmetic WQI

Crucial Safety Rule:
Water CANNOT be certified safe for human drinking or animal consumption based solely on
physicochemical parameters (pH, turbidity, DO, etc.). Microbiological testing (E. coli, coliforms)
and toxic contaminant screening (heavy metals, arsenic, nitrates, pesticides) are strictly required.
When such required data are missing, status MUST be reported as 'Insufficient Data'.
"""

def assess_human_drinking(params):
    """
    Assesses human drinking suitability based on WHO & EPA standards.
    Requires: pH (6.5 - 8.5), Turbidity (< 1 - 5 NTU), TDS (< 500 - 1000 mg/L),
    BOD (< 2 mg/L), COD (< 10 mg/L), DO (> 4 - 6 mg/L).
    Microbiological (E. coli / fecal coliforms) and toxic chemical data are essential.
    """
    ph = params.get('ph')
    turbidity = params.get('turbidity')
    tds = params.get('total_dissolved_solids')
    bod = params.get('bod')
    cod = params.get('cod')
    do = params.get('dissolved_oxygen')
    
    missing_measurements = [
        "Microbiological assay (E. coli, fecal coliforms, enteroviruses)",
        "Toxic chemical screen (Arsenic, Lead, Fluoride, Nitrates, Pesticides, Disinfection Byproducts)"
    ]

    violations = []
    
    if ph is not None:
        if ph < 6.5 or ph > 8.5:
            violations.append(f"pH {ph:.2f} violates WHO standard range (6.5 – 8.5)")
    else:
        missing_measurements.append("pH")

    if turbidity is not None:
        if turbidity > 5.0:
            violations.append(f"Turbidity {turbidity:.1f} NTU exceeds maximum WHO permissible limit (5.0 NTU; ideal < 1 NTU)")
    else:
        missing_measurements.append("Turbidity (NTU)")

    if tds is not None:
        if tds > 1000.0:
            violations.append(f"TDS {tds:.0f} mg/L exceeds WHO acceptable threshold (1,000 mg/L; ideal < 300 mg/L)")
    else:
        missing_measurements.append("Total Dissolved Solids (TDS)")

    if bod is not None and bod > 3.0:
        violations.append(f"BOD {bod:.1f} mg/L exceeds drinking water threshold (< 2-3 mg/L), indicating organic pollution")
        
    if cod is not None and cod > 10.0:
        violations.append(f"COD {cod:.1f} mg/L indicates chemical pollutant loading")

    if do is not None and do < 4.0:
        violations.append(f"Dissolved oxygen {do:.1f} mg/L is critically depleted (< 4.0 mg/L)")

    # If any measured parameter violates drinking standards, it is definitively NOT SUITABLE
    if len(violations) > 0:
        return {
            "status": "Not Suitable",
            "reason": "Measured parameters fail drinking water limits: " + "; ".join(violations) + ".",
            "missing_measurements": missing_measurements
        }

    # If parameters within physical limits, we CANNOT declare safe without microbiological testing
    return {
        "status": "Insufficient Data",
        "reason": "Available physical-chemical parameters fall within acceptable baseline limits, but water cannot be declared safe for human drinking without laboratory bacteriological verification and toxic chemical testing.",
        "missing_measurements": missing_measurements
    }


def assess_household_use(params):
    """
    Household use (bathing, washing, laundry, sanitation).
    Standards: CPCB Class B (Bathing), EPA recreation & domestic guidelines.
    Requires: pH (6.5 - 8.5 for skin contact), Turbidity (< 5 NTU), BOD (< 3 mg/L).
    """
    ph = params.get('ph')
    turbidity = params.get('turbidity')
    tds = params.get('total_dissolved_solids')
    bod = params.get('bod')
    cod = params.get('cod')

    missing_measurements = [
        "Fecal coliforms / pathogen count (for contact bathing)",
        "Water hardness (Ca2+, Mg2+ for laundry & plumbing scaling)"
    ]

    violations = []
    if ph is not None and (ph < 6.0 or ph > 9.0):
        violations.append(f"pH {ph:.2f} is caustic/corrosive (outside 6.0 – 9.0 safe bathing/contact range)")

    if turbidity is not None and turbidity > 15.0:
        violations.append(f"Turbidity {turbidity:.1f} NTU causes visible cloudiness, staining, and sediment deposition")

    if tds is not None and tds > 2000.0:
        violations.append(f"TDS {tds:.0f} mg/L causes severe mineral encrustation and soap precipitation")

    if bod is not None and bod > 5.0:
        violations.append(f"High BOD {bod:.1f} mg/L indicates organic decomposition, odor, and bacterial proliferation")

    if cod is not None and cod > 30.0:
        violations.append(f"Elevated COD {cod:.1f} mg/L indicates synthetic or chemical detergent/industrial runoff")

    if len(violations) > 0:
        return {
            "status": "Not Suitable",
            "reason": "Parameters fail domestic household criteria: " + "; ".join(violations) + ".",
            "missing_measurements": missing_measurements
        }

    # If physical parameters pass but microbiological tests are absent
    return {
        "status": "Insufficient Data",
        "reason": "Physical measurements satisfy basic aesthetic and washing limits, but lack of microbiological safety testing precludes certifying suitability for skin-contact bathing.",
        "missing_measurements": missing_measurements
    }


def assess_animal_drinking(params):
    """
    Animal/Livestock drinking suitability.
    Standards: National Academy of Sciences (NAS) & USDA Livestock Water Quality Guide.
    Requires: TDS (< 3000 mg/L safe, > 5000 mg/L hazardous), pH (6.0 - 8.5), low BOD/COD.
    """
    ph = params.get('ph')
    tds = params.get('total_dissolved_solids')
    conductivity = params.get('electrical_conductivity')
    bod = params.get('bod')
    cod = params.get('cod')

    missing_measurements = [
        "Nitrate-Nitrogen & Nitrite levels (causes livestock methemoglobinemia)",
        "Cyanobacteria / toxic blue-green algae toxins (microcystin)",
        "Sulfate concentration (> 1,000 mg/L causes diarrhea & polioencephalomalacia in cattle)",
        "Toxic heavy metals (Selenium, Lead, Cadmium)"
    ]

    violations = []
    
    # Calculate approximate TDS from conductivity if TDS omitted (standard freshwater ratio ~0.65)
    eff_tds = tds
    if eff_tds is None and conductivity is not None:
        eff_tds = conductivity * 0.65

    if eff_tds is not None and eff_tds > 3000.0:
        violations.append(f"Total Dissolved Solids ({eff_tds:.0f} mg/L) exceeds the 3,000 mg/L threshold, risking severe livestock osmotic diarrhea and dehydration")

    if ph is not None and (ph < 5.5 or ph > 8.8):
        violations.append(f"pH {ph:.2f} is outside tolerable livestock ingestion range (5.5 – 8.8)")

    if bod is not None and bod > 8.0:
        violations.append(f"BOD {bod:.1f} mg/L reflects gross stagnant organic putrefaction")

    if len(violations) > 0:
        return {
            "status": "Not Suitable",
            "reason": "Exceeds veterinary tolerances: " + "; ".join(violations) + ".",
            "missing_measurements": missing_measurements
        }

    if eff_tds is None and ph is None:
        return {
            "status": "Insufficient Data",
            "reason": "Primary livestock determinants (TDS/salinity and pH) were not provided.",
            "missing_measurements": ["TDS or Electrical Conductivity", "pH"] + missing_measurements
        }

    return {
        "status": "Insufficient Data",
        "reason": "Physical salinity and pH are within livestock tolerance, but critical veterinary safety screenings (toxic blue-green algae, nitrates, sulfates, and toxic trace elements) are unmeasured.",
        "missing_measurements": missing_measurements
    }


def assess_aquatic_animals(params):
    """
    Aquatic Life (Fish, Macroinvertebrates, Freshwater Ecology).
    Standards: US EPA National Ambient Water Quality Criteria for Aquatic Life.
    Critical factors: Dissolved Oxygen (>= 5.0 mg/L), pH (6.5 - 9.0), Temperature (< 28°C), BOD (< 3-4 mg/L).
    """
    do = params.get('dissolved_oxygen')
    ph = params.get('ph')
    temp = params.get('water_temperature')
    bod = params.get('bod')
    cod = params.get('cod')
    turbidity = params.get('turbidity')

    missing_measurements = []
    if do is None:
        missing_measurements.append("Dissolved Oxygen (DO is essential for aquatic respiration)")
    if ph is None:
        missing_measurements.append("pH")
    if temp is None:
        missing_measurements.append("Water Temperature")
    
    missing_measurements.extend([
        "Unionized Ammonia (NH3 toxicity)",
        "Toxic heavy metals (dissolved Copper, Zinc, Cadmium)",
        "Dissolved Nutrients (Total Phosphorus and Total Nitrogen)"
    ])

    # If Dissolved Oxygen is missing, aquatic assessment is impossible
    if do is None:
        return {
            "status": "Insufficient Data",
            "reason": "Dissolved Oxygen (DO) is the single most critical parameter for aquatic respiration and was not provided.",
            "missing_measurements": missing_measurements
        }

    violations = []
    if do < 4.0:
        violations.append(f"Dissolved Oxygen ({do:.1f} mg/L) is below the 4.0 mg/L minimum threshold, inducing acute hypoxia and fish kill risks")

    if ph is not None and (ph < 6.5 or ph > 9.0):
        violations.append(f"pH {ph:.2f} is outside the 6.5 – 9.0 buffer range, impairing fish gill function and osmoregulation")

    if temp is not None and temp > 30.0:
        violations.append(f"Water temperature ({temp:.1f} °C) induces thermal shock, lowers oxygen solubility, and elevates fish metabolic stress")

    if bod is not None and bod > 5.0:
        violations.append(f"BOD ({bod:.1f} mg/L) indicates active biological oxygen consumption that rapidly starves aquatic organisms")

    if turbidity is not None and turbidity > 50.0:
        violations.append(f"Turbidity ({turbidity:.1f} NTU) smothers benthic fish habitats, suffocates fish gills, and blocks photosynthetic sunlight")

    if len(violations) > 0:
        return {
            "status": "Not Suitable",
            "reason": "Ecological thresholds breached: " + "; ".join(violations) + ".",
            "missing_measurements": missing_measurements
        }

    # If physical parameters pass comfortably (e.g. DO >= 6.0, pH 6.8-8.2, low BOD, normal temp)
    if do >= 5.5 and (ph is None or (6.8 <= ph <= 8.5)) and (bod is None or bod <= 3.0):
        return {
            "status": "Suitable",
            "reason": f"DO ({do:.1f} mg/L), neutral pH, and low oxygen demand meet baseline freshwater ecological requirements for fish and macroinvertebrate survival. (Note: Ammonia and pesticide runoff not tested).",
            "missing_measurements": ["Unionized ammonia (NH3)", "Pesticides / herbicide runoff", "Heavy metals"]
        }

    return {
        "status": "Insufficient Data",
        "reason": "Physical parameters fall near boundary thresholds; definitive suitability requires checking unionized ammonia, pesticide runoff, and nutrient levels.",
        "missing_measurements": missing_measurements
    }


def assess_plants_and_irrigation(params):
    """
    Plants and Agricultural Irrigation.
    Standards: FAO Irrigation and Drainage Guidelines (Ayers & Westcot, 1985).
    Key factors: Electrical Conductivity (EC < 750 µS/cm no restriction; > 3000 severe),
    TDS (< 450 mg/L ideal, > 2000 severe), pH (6.0 - 8.5).
    """
    ec = params.get('electrical_conductivity')
    tds = params.get('total_dissolved_solids')
    ph = params.get('ph')
    bod = params.get('bod')
    cod = params.get('cod')

    missing_measurements = [
        "Sodium Adsorption Ratio (SAR: Na / sqrt((Ca + Mg)/2)) for soil permeability hazard",
        "Specific ion toxicity (Chloride, Boron, Sodium)",
        "Residual Sodium Carbonate (RSC)"
    ]

    # Compute effective salinity
    effective_ec = ec
    if effective_ec is None and tds is not None:
        effective_ec = tds / 0.65  # standard conversion

    if effective_ec is None and ph is None:
        return {
            "status": "Insufficient Data",
            "reason": "Salinity indicators (Electrical Conductivity or TDS) and pH were not provided.",
            "missing_measurements": ["Electrical Conductivity or TDS", "pH"] + missing_measurements
        }

    violations = []
    if effective_ec is not None and effective_ec > 3000.0:
        violations.append(f"Salinity hazard: Electrical Conductivity ({effective_ec:.0f} µS/cm) creates severe osmotic root barriers preventing plant water uptake")

    if tds is not None and tds > 2000.0:
        violations.append(f"TDS {tds:.0f} mg/L exceeds severe agricultural threshold (> 2,000 mg/L)")

    if ph is not None and (ph < 5.5 or ph > 8.5):
        violations.append(f"pH {ph:.2f} is outside the standard 5.5 – 8.5 irrigation range (causes nutrient lockout and soil alkalinity/acidity)")

    if bod is not None and bod > 15.0:
        violations.append(f"BOD {bod:.1f} mg/L risks clogging drip irrigation emitters and causing soil anaerobic conditions")

    if len(violations) > 0:
        return {
            "status": "Not Suitable",
            "reason": "Fails agricultural irrigation criteria: " + "; ".join(violations) + ".",
            "missing_measurements": missing_measurements
        }

    # If salinity is comfortably low and pH is neutral
    if effective_ec is not None and effective_ec <= 1000.0 and (ph is None or (6.0 <= ph <= 8.2)):
        return {
            "status": "Suitable",
            "reason": f"Salinity ({effective_ec:.0f} µS/cm) and pH are well within FAO standard guidelines for non-saline irrigation with no severe yield restrictions. (Note: Sodium Adsorption Ratio SAR unmeasured).",
            "missing_measurements": missing_measurements
        }

    return {
        "status": "Insufficient Data",
        "reason": f"Salinity ({effective_ec:.0f} µS/cm) falls in the moderate restriction zone (750 – 2,000 µS/cm); evaluation requires Sodium Adsorption Ratio (SAR), Boron, and Chloride analysis to rule out soil infiltration damage.",
        "missing_measurements": missing_measurements
    }


def perform_all_suitability_assessments(params):
    return {
        "human_drinking": assess_human_drinking(params),
        "household_use": assess_household_use(params),
        "animal_drinking": assess_animal_drinking(params),
        "aquatic_animals": assess_aquatic_animals(params),
        "plants_irrigation": assess_plants_and_irrigation(params)
    }
