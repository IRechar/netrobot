from flask import Flask, current_app, request, render_template, Response
import time
import json
import subprocess
import os

enable_port = 4
motors_left = [17, 18]

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

	speed = float(speed) / 100
	rotation = float(rotation)

	if(rotation > 0):
	  speed_a = speed;
	  speed_b = speed * ((100 - abs(rotation)) / 100)
	else:
	  speed_b = speed;
	  speed_a = speed * ((100 - abs(rotation)) / 100)

	on_pin = (18, 23) if speed > 0 else (17, 22)
	off_pin = (17, 22) if on_pin[0] == 18 else (18, 23)
	
	print((on_pin, off_pin))
	os.system('echo "4=1" > /dev/pi-blaster')
	os.system(f'echo "{on_pin[0]}={abs(speed_a)}" > /dev/pi-blaster')
	os.system(f'echo "{off_pin[0]}=0" > /dev/pi-blaster')
	
	os.system(f'echo "{on_pin[1]}={abs(speed_b)}" > /dev/pi-blaster')
	os.system(f'echo "{off_pin[1]}=0" > /dev/pi-blaster')

	return Response(json.dumps((speed_a, speed_b)), status=200, mimetype="application/json")

@app.route('/stop')
def stop():
	GPIO.output(18, GPIO.LOW)

if(__name__ == '__main__'):
	app.run(debug=True, host='0.0.0.0')
