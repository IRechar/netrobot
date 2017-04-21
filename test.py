import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)

GPIO.setup(21, GPIO.OUT)

print("Turning on")
GPIO.output(21, GPIO.HIGH)

sleep(10)

print("Turning off")
GPIO.output(21, GPIO.LOW)
GPIO.cleanup()
