import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();

export const ac = actionClient;

export default actionClient;
