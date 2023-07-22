import { SafeFactory } from "@safe-global/protocol-kit";

export async function createSafe() {
    const safeFactory = await SafeFactory.create()
}