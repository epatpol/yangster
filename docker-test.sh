#!/bin/bash

n=0
until [ $n -ge 15 ]
do
    # curl --output /dev/null localhost:3000
    nc -zv localhost 3000
    if [ $? -eq 0 ]
    then
        echo "Successfully accessed Yangster inside docker"
        break
    fi
    n=$[$n+1]
    sleep 1
done