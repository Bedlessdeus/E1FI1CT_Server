import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (url.searchParams.get('admin') === 'true' || url.searchParams.get('admin') === 'false') {
		locals.admin = Boolean(url.searchParams.get('admin'));
	} else {
		locals.admin = false;
	}

    console.log(locals.admin ? 'Admin mode enabled' : 'Admin mode disabled');
};
