#!/bin/bash

minikube delete
minikube start --addons=storage-provisioner,default-storageclass,ingress,registry

kubectl delete namespace appointment --ignore-not-found #delete if found, ignore if not

./build.sh
./rollout.sh

echo
echo "Now run 'minikube tunnel' in a separate terminal."
echo "If needed, add this to your hosts file:"
echo "127.0.0.1 appointment.sample"
sleep 2
