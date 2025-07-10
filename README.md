**Appointment Coordination App**

A simple appointment voting platform built with Node.js (Express) and PostgreSQL.
Containerized with Docker (Amazon Linux 2023 base).
Supports both Docker Compose and Kubernetes deployments.

**Prerequisites**

- Docker Desktop
 
- Minikube (for local Kubernetes)

- kubectl


**Features**

- Propose 1–3 appointment date/time slots

- Invitees respond with “yes” or “no” per slot, entering their name
 
- View live stats for each appointment
 
- Load-balanced, scalable deployment
 
- After creating an appointment, copy the tokenized link and send it to others so they can respond to your invitation

**Running Locally with Docker Compose**

Build all images

`./build.sh`

or manually:
```
docker build -t appointment-app-db ./db
docker build -t appointment-app-app1 ./web
docker build -t appointment-app-app2 ./web
docker build -t appointment-app-haproxy ./haproxy
```


Start the stack:
`docker compose up -d`

Access the app
Open http://localhost in your browser (via HAProxy).

Stop the stack:
`docker compose down`

**Running on Kubernetes (minikube)**

**Optional:** Run `./start.sh` to automate setup.   
**Note:** You still need to run minikube tunnel manually in another terminal.

**Manual setup:**

Run this command to start minikube and enable addons:
```
minikube start --addons=storage-provisioner,default-storageclass,ingress,registry
```


Build images and load into minikube (for local images):
`./build.sh`

Deploy resources and start:
```
kubectl apply -f namespace.yaml
kubectl apply -f config.yaml
kubectl apply -f db.yaml
kubectl apply -f web.yaml
kubectl apply -f ingress.yaml
```

or:
`./rollout.sh`

Start the minikube tunnel
`minikube tunnel`

Get the service IP
`kubectl get svc -n appointment`

(Optional) Port-forward the web service

`kubectl port-forward service/web 8999:8999 -n appointment`

Then open http://localhost:8999 in your browser.

Delete everything and start fresh:

```
kubectl delete namespace appointment
./build.sh
./rollout.sh
minikube tunnel
```


**Useful Commands**

View logs (Docker):
`docker logs <container_name_or_id>`

View logs (Kubernetes):
`kubectl logs <pod-name> -n appointment`

Restart all pods (Kubernetes):
`kubectl delete pods --all -n appointment`

Check all resources:
`kubectl get all -n appointment`

Access PostgreSQL CLI:

Docker:

`docker exec -it <db-container-name> psql -U postgres -d appointmentdb`

Kubernetes:

`kubectl exec -it db-0 -n appointment -- psql -U postgres -d appointmentdb`

**Notes**

All containers use Amazon Linux 2023 as the base image.

Two web servers are deployed and load balanced by HAProxy (Docker Compose).

For Kubernetes, traffic is managed by an Ingress resource—not HAProxy.

Database data persists in Docker volume or Kubernetes PersistentVolume.

After changing init.sql, you may need to drop and recreate the database or remove volumes.

To fully reset all data, delete the Docker volume or Kubernetes PVC.

**Author**

Emrah Zehic

Cloud Computing – Summer Term 2025

