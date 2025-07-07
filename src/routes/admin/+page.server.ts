import { listDevices } from '$lib/server/db';

export const load = async () => {
	const devices = (await listDevices()).flatMap((device) => {
		return {
			device_id: device['device_id'],
			device_name: device['device_name'],
			last_temp: device['last_temp'].toFixed(2),
			last_humid: device['last_humid'].toFixed(2)
		};
	});

	return {
		devices
	};
};
