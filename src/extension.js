const vscode = require('vscode');
const { openCommandBar } = require('./commandBar');
const { createHistory } = require('./history');
const { createModes } = require('./modes');

/** Создаёт общие ресурсы и регистрирует команды расширения. */
function activate(context) {
    const history = createHistory(context);
    const modes = createModes(context);

    const services = { context, history, modes };

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'keyPilot.open',
            () => openCommandBar(services)
        ),
        vscode.commands.registerCommand(
            'keyPilot.insert',
            () => modes.set('insert')
        ),
        vscode.commands.registerCommand(
            'keyPilot.navigate',
            () => modes.set('navigate')
        )
    );
}

module.exports = { activate };
