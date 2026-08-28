# Expense Tracker Uploader

A containerized React application to parse bank transaction CSVs and upload them directly to an n8n webhook for processing into Google Sheets.

📦 Project Structure
- `src/App.jsx`: Frontend logic & CSV parsing (PapaParse).
- `Dockerfile`: Multi-stage build (Builds React -> Serves via Nginx).
- `compose.yaml`: Production container definition.

## Docker Compose

```bash
docker compose up -d
```
You will access the application at [http://localhost:8080](http://localhost:8080)

## Kubernetes
**Deployment manifest**
expense-tracker-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: expense-tracker
  name: expense-tracker
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expense-tracker
  template:
    metadata:
      labels:
        app: expense-tracker
    spec:
      containers:
      - image: ghcr.io/josel82/expense-tracker:v1.1.0
        name: expense-tracker
        ports:
        - containerPort: 80
        env:
        - name: VITE_N8N_WEBHOOK_URL
          value: "https://<webhook.url>"
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
```

Apply the manifest:

```bash
kubectl apply -f expense-tracker-deployment.yaml
```


