# Expense Tracker Uploader

A containerized React application to parse bank transaction CSVs and upload them directly to an n8n webhook for processing into Google Sheets.

## 🚀 Production Deployment (VM to Raspberry Pi)

Follow these steps to build the app on your development VM and move it to your Raspberry Pi.

### 1. Pre-Deployment Check
Ensure the `n8n_webhook_url` in `src/App.jsx` uses **HTTPS** and the **Production** path:
```javascript
const n8n_webhook_url = "[https://hooks.kernelcloud.work/webhook/upload-transactions](https://hooks.kernelcloud.work/webhook/upload-transactions)";
```
---
### 2. Build the Image (on Ubuntu VM)
Since your VM is aarch64, the build will be natively compatible with the Raspberry Pi.

```Bash
# Build the production image
docker build -t expense-tracker-prod:latest .

# Save the image to a tarball
docker save expense-tracker-prod:latest > expense-tracker.tar
```
---
### 3. Transfer to Raspberry Pi
Use scp to move the image to your Pi. Use the -i flag if you have a specific SSH key.

```Bash
scp -i ~/.ssh/pi_server expense-tracker.tar josel82@192.168.2.154:/opt/expense_tracker/
```
---
### 4. Load and Run (on Raspberry Pi)
SSH into your Pi and load the image into the local Docker daemon.

```Bash
# Load the image
docker load < ~/expense-tracker.tar

# Start the container
# (Ensure your compose.yaml points to 'image: expense-tracker-prod:latest')
docker compose up -d
```
---
## 🛠 Troubleshooting
### Mixed Content Error
If the browser blocks the upload, ensure you are calling the `https://` version of your n8n webhook. Browsers do not allow `https` sites (your UI) to talk to `http` APIs.

### CORS Errors
In n8n, ensure the Webhook node has the following HTTP Response Headers configured:

- `Access-Control-Allow-Origin`: `*`
- `Access-Control-Allow-Methods`: `POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type`

### Cloudflare Tunnel Configuration
Point your Cloudflare Tunnel hostname (`uploader.kernelcloud.work`) to the internal Docker IP or container name:

Service: `http://expense-tracker-ui:80` (If on the same Docker network)

Service: `http://localhost:8080` (If using port mapping)

📦 Project Structure
- `src/App.jsx`: Frontend logic & CSV parsing (PapaParse).
- `Dockerfile`: Multi-stage build (Builds React -> Serves via Nginx).
- `compose.yaml`: Production container definition.

### Quick Recap of the Pipeline:
1. **Develop** in your Ubuntu VM sandbox.
2. **Build** the production image on the VM.
3. **Transport** the `.tar` image to the Pi.
4. **Deploy** via Docker Compose on the Pi.
5. **Secure** via Cloudflare Access.