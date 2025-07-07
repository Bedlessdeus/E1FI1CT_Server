export const POST = async ({ request, locals }) => {
	//if (!locals.admin) {
	//    return new Response('Unauthorized', { status: 401 });
	//}

	const data = await request.json();
	const { state } = data;
	if (typeof state !== 'boolean' || state === undefined) {
		return new Response('Invalid state', { status: 400 });
	}

	return new Response(JSON.stringify({ success: true, state: state }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
