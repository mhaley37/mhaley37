#!/bin/bash

export TZ=America/Los_Angeles
today=$(date +%F)
if [[ $(date +%H) < 10 ]] 
then
  echo "before 10!"
  echo "Will move today, $today"
else
  echo "ater 10!"
  echo "Will move tomorrow"
fi