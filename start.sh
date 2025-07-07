#!/bin/bash

kubectl delete namespace appointment --ignore-not-found #delete if found, ignore if not
./build.sh
./rollout.sh
minikube tunnel
