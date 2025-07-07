import type { Handle } from '@sveltejs/kit';
import { addDevice, exec, readSQL } from '$lib/server/db';
import type { ServerInit } from '@sveltejs/kit';
import { v4 } from 'uuid';

export const handle: Handle = async ({ event, resolve }) => {
	// TODO: Check and set state if user is admin
	event.locals.admin = false;
	return resolve(event);
};

export const init: ServerInit = async () => {
	await exec(readSQL('init'));
	addDevice(v4(), 'test_name', v4(), Math.random() * 10, Math.random() * 10);
};
