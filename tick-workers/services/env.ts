import "dotenv/config";

export const ENV_DB_URI: string = process.env.DB_URI ?? "";
export const ENV_DB_NAME: string = process.env.DB_NAME ?? "";
export const ENV_RABBITMQ_URI: string = process.env.RABBITMQ_URI ?? "";
