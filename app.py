from flask import Flask, current_app, request, render_template, Response
import RPi.GPIO as GPIO
import subprocess
import time
import json

GPIO.setmode(GPIO.BCM)

enable_port = 4
GPIO.setup(enable_port, GPIO.OUT)
GPIO.output(enable_port, GPIO.HIGH)

motors_left = [17, 18]
for i in range(len(motors_left)):
    GPIO.setup(motors_left[i], GPIO.OUT)
    motors_left[i] = GPIO.PWM(motors_left[i], 50)
    motors_left[i].start(0)


app = Flask(__name__)
subprocess.call(['sudo', 'bash', './stream.sh'])
host_ip = subprocess.check_output(['hostname', '-I']).strip().decode('utf-8')
print("IP: " + str(host_ip))

@app.route('/')
def index():
	return render_template('index.html', stream_ip="http://" + host_ip + ":8081")

@app.route('/move')
def move():
	speed = request.args.get('speed')
	rotation = request.args.get('rotation')

	speed = float(speed)
	rotation = float(rotation)

	if(rotation > 0):
	  speed_a = speed;
	  speed_b = speed * ((100 - abs(rotation)) / 100)
	else:
	  speed_b = speed;
	  speed_a = speed * ((100 - abs(rotation)) / 100)

    motors_left[0].ChangeDutyCycle(50)
    return Response(json.dumps((speed_a, speed_b)), status=200, mimetype="application/json")
# #
# @app.route('/stop')
# def stop():
# 	GPIO.output(18, GPIO.LOW)

if(__name__ == '__main__'):
	app.run(debug=True, host='0.0.0.0')
