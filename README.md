# Expense Tracker Uploader

A containerized React application to parse bank transaction CSVs and upload them directly to an n8n webhook for processing into Google Sheets.

📦 Project Structure
- `src/App.jsx`: Frontend logic & CSV parsing (PapaParse).
- `Dockerfile`: Multi-stage build (Builds React -> Serves via Nginx).
- `compose.yaml`: Production container definition.
