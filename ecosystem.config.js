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
            script: "poe dev",
            env: {
                PYTHONUNBUFFERED: "1",
                PATH: `${process.env.PATH}:${__dirname}/.venv/bin`,
            },
            ...common,
        },
        {
            name: "ticks_processor/publisher",
            cwd: "server",
            script: "python jobs/tick_processor/provider.py",
            env: {
                PYTHONUNBUFFERED: "1",
                PATH: `${process.env.PATH}:${__dirname}/.venv/bin`,
            },
            ...common,
        },
        {
            name: "ticks_processor/recorder",
            cwd: "server",
            script: "python jobs/tick_processor/recorder.py",
            env: {
                PYTHONUNBUFFERED: "1",
                PATH: `${process.env.PATH}:${__dirname}/.venv/bin`,
            },
            ...common,
        }
    ],
};