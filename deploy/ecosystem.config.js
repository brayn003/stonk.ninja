const common = {
    max_restarts: 3,
    kill_timeout: 3000,
}

module.exports = {
    apps: [
        {
            name: "client",
            cwd: "client",
            script: "pnpm run dev",
            ...common,
        },
        {
            name: "server",
            cwd: "server",
            script: "poetry run poe start",
        }
    ],
};
