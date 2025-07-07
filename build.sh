#!/bin/bash

WEB_IMG=appointment-web
DB_IMG=appointment-db

#builds docker images
docker build -t $WEB_IMG:latest ./web
docker build -t $DB_IMG:latest ./db

#makes a temp directory in which the images are stored
mkdir -p tmp
docker save -o tmp/$WEB_IMG.tar $WEB_IMG:latest
docker save -o tmp/$DB_IMG.tar $DB_IMG:latest

#minikube loads the images
minikube image load tmp/$WEB_IMG.tar
minikube image load tmp/$DB_IMG.tar

#removes the temp directory
rm -r ./tmp