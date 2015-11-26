import sys
import argparse
from collections import namedtuple

import zmq
import yaml

DeviceTypes = namedtuple('DeviceTypes', 'type input output')

device_map = {
	'queue': DeviceTypes(zmq.QUEUE, zmq.XREP, zmq.XREQ),
	'forwarder': DeviceTypes(zmq.FORWARDER, zmq.SUB, zmq.PUB),
	'streamer': DeviceTypes(zmq.STREAMER, zmq.PULL, zmq.PUSH)
}

parser = argparse.ArgumentParser(description='Generic zeromq device');
parser.add_argument('config', type=file)


def main():
	args = parser.parse_args()
	config = yaml.load(args.config)
	for k in ('in', 'out', 'type'):
		if k not in config:
			print >>sys.stderr, 'Configuration invalid. "{0}" is missing.'.format(k)
			return 1
	type_ = config['type']
	if type_ not in device_map:
		print >>sys.stderr, 'Incorrect device type: {0}'.format(type_)
		return 1
	context = zmq.Context()
	device_type = device_map[type_]
	input_ = context.socket(device_type.input)
	input_.bind(config['in'])
	if type_ == 'forwarder':
		input_.setsockopt(zmq.SUBSCRIBE, '')
	output = context.socket(device_type.output)
	output.bind(config['out'])
	zmq.device(device_type.type, input_, output)

if __name__ == '__main__':
	main()