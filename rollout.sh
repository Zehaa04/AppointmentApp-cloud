#!/bin/bash
kubectl apply -f namespace.yaml
kubectl apply -f config.yaml
kubectl apply -f db.yaml
kubectl apply -f web.yaml
kubectl apply -f ingress.yaml
