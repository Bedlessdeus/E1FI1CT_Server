import { getRequestEvent } from "$app/server";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
    const user = requireLogin();
    return { user };
};

const requireLogin = () => {
    const { locals } = getRequestEvent();

    if (!locals.user) {
        return redirect(302, '/login');
    }

    return locals.user;
}
