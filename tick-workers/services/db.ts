import { MongoClient } from "mongodb";

import { ENV_DB_NAME, ENV_DB_URI } from "../services/env";

const client = new MongoClient(ENV_DB_URI);
export const db = client.db(ENV_DB_NAME);
