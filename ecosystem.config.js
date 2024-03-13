const common = {
    max_restarts: 3,
    kill_timeout: 3000,
}

module.exports = {
    apps: [
        {
            name: "caddy",
            script: "caddy run",
            ...common,
        },
        {
            name: "client",
            cwd: "client",
            script: "pnpm run dev",
            env: {
                FORCE_COLOR: "1"
            },
            ...common,
        },
        {
            name: "server",
            cwd: "server",
            script: "poetry run poe dev",
            env: {
                PYTHONUNBUFFERED: "1",
                PATH: `${process.env.PATH}:${__dirname}/.venv/bin`,
            },
            ...common,
        }
    ],
};