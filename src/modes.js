const vscode = require('vscode');

/** Создаёт переключатель режимов и индикатор состояния. */
function createModes(context) {
    const status = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        100
    );

    status.command = 'keyPilot.open';
    context.subscriptions.push(status);

    /** Меняет индикатор и контекст для назначения клавиш. */
    async function set(mode) {
        const navigation = mode === 'navigate';

        await vscode.commands.executeCommand(
            'setContext',
            'keyPilot.navigation',
            navigation
        );

        status.text = navigation
            ? '$(compass) KeyPilot: NAV'
            : '$(edit) KeyPilot: INSERT';

        status.tooltip = navigation
            ? 'h/j/k/l — движение, i — ввод'
            : 'Esc — навигация';

        status.show();
    }

    void set('insert');

    return { set };
}

module.exports = { createModes };
