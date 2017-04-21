#!/bin/bash

modprobe bcm2835-v4l2
service motion stop
service motion start
