#!/bin/bash

minikube start --addons=storage-provisioner,default-storageclass,ingress,registry

kubectl delete namespace appointment --ignore-not-found

./build.sh
./rollout.sh

echo
echo "Now run 'minikube tunnel' in a separate terminal."
echo "If needed, add this to your hosts file:"
echo "127.0.0.1 appointment.sample"
