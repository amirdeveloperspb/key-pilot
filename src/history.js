/** Создаёт историю, сохраняемую в состоянии текущего проекта. */
function createHistory(context) {
    const saved = context.workspaceState.get('keyPilot.history', []);

    let items = Array.isArray(saved)
        ? saved.filter(item => typeof item === 'string').slice(0, 30)
        : [];

    return {
        /** Возвращает копию массива команд. */
        list() {
            return [...items];
        },

        /** Переносит команду в начало и сохраняет до 30 записей. */
        async add(text) {
            items = items.filter(item => item !== text);
            items.unshift(text);
            items = items.slice(0, 30);

            await context.workspaceState.update(
                'keyPilot.history',
                items
            );
        }
    };
}

module.exports = { createHistory };
