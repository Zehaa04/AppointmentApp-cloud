#!/bin/bash

WEB_IMG=appointment-web
DB_IMG=appointment-db

docker build -t $WEB_IMG:latest ./web
docker build -t $DB_IMG:latest ./db

mkdir -p tmp
docker save -o tmp/$WEB_IMG.tar $WEB_IMG:latest
docker save -o tmp/$DB_IMG.tar $DB_IMG:latest

minikube image load tmp/$WEB_IMG.tar
minikube image load tmp/$DB_IMG.tar

rm -r ./tmp