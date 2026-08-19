# KrishiNayan Dataset Sources

## Maize Disease Image Dataset

### PlantVillage Dataset
Used for maize disease image classification training and validation.

Classes used:
- Healthy
- Common Rust
- Gray Leaf Spot
- Northern Leaf Blight

Source:
- https://github.com/spMohanty/PlantVillage-Dataset

### Field Maize Leaf Images
Used as an external real-world test dataset to check model robustness on farm-like images.

Labels mapped:
- NoFoliarSymptoms → Healthy
- CR → Common Rust
- GLS → Gray Leaf Spot
- NCLB → Northern Leaf Blight

## Maize Soil Intelligence - Bihar

### Soil Health Card Dataset
Used to create Bihar district-wise soil profiles and soil advisory data.

Fields used:
- State
- District
- Block
- Village
- Nutrient name
- Nutrient level
- Nutrient value

Final derived files:
- maize_bihar_district_soil_summary.csv
- maize_bihar_soil_advisory.csv
- maize_bihar_soil_advisory.json

Source:
- https://indiadataportal.com/p/soil-health-card

## Agricultural Advisory References

These sources were used to validate soil and crop recommendation rules. They were not used for ML model training.

- Soil Health Card Portal, NIC: https://www.nic.gov.in/project/soil-health-card-portal/
- ICAR Bihar agricultural profile: https://icar.gov.in/en/node/17260
- ICAR Maize: https://icar.gov.in/en/crop-science/maize
- ICAR-IIMR: https://iimr.res.in/
- TNAU Maize Agritech: https://agritech.tnau.ac.in/agriculture/agri_maize_irrigated_maize.html
