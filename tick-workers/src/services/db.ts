import { MongoClient } from "mongodb";

import { ENV_MONGODB_NAME, ENV_MONGODB_URI } from "../services/env";

const client = new MongoClient(ENV_MONGODB_URI);
export const db = client.db(ENV_MONGODB_NAME);
