const common = {
    max_restarts: 3,
    kill_timeout: 3000,
}

module.exports = {
    apps: [
        {
            name: "client",
            cwd: "client",
            script: "pnpm run start",
            ...common,
        },
        {
            name: "server",
            cwd: "server",
            script: "poetry run poe start",
            ...common,
        },
        {
            name: "ticks_processor/publisher",
            cwd: "server",
            script: "python jobs/tick_processor/provider.py",
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
