import type { ParamMatcher } from "@sveltejs/kit";

export const match : ParamMatcher = (param : string) => {
    return param?.toLowerCase() === 'register' || param?.toLowerCase() === 'login';
}