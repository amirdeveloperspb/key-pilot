const vscode = require('vscode');

/** Показывает активный терминал или создаёт новый. */
function openTerminal() {
    const terminal = vscode.window.activeTerminal
        || vscode.window.createTerminal('KeyPilot');
    terminal.show();
}

module.exports = { openTerminal };
