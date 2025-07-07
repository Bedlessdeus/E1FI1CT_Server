import { getDevice, listDevices } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const id = url.searchParams.get('id') ?? '*';

	const devices = id == '*' ? await listDevices() : await getDevice(id);

	return new Response(JSON.stringify(devices), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
