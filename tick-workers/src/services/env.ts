import "dotenv/config";

export const ENV_SERVER_PRIVATE_URL: string = process.env.SERVER_PRIVATE_URL ?? "";
export const ENV_MONGODB_URI: string = process.env.MONGODB_URI ?? "";
export const ENV_MONGODB_DB_NAME: string = process.env.MONGODB_DB_NAME ?? "";
export const ENV_KAFKA_URI: string = process.env.KAFKA_URI ?? "";
export const ENV_AUTH_TOKEN: string = process.env.AUTH_TOKEN ?? "";
