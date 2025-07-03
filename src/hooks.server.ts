import type { Handle } from "@sveltejs/kit";

export const handle : Handle = async ({ event, resolve }) => {
    // TODO: Check and set state if user is admin
    event.locals.admin = false;
    return resolve(event);
}