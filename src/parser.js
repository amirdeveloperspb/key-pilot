function parseCommand(text) {
    const parts = text.trim().split(/\s+/);

    return {
        name: parts[0],
        args: parts.slice(1)
    };
}

module.exports = { parseCommand };