const vscode = require('vscode');

/** Открывает строку ввода и показывает введённый текст. */
async function openCommandBar() {
    const input = await vscode.window.showInputBox({
        prompt: 'Введите команду KeyPilot',
        placeHolder: 'Например: terminal'
    });

    if (input === undefined || input.trim() === '') {
        return;
    }

    vscode.window.showInformationMessage('Вы ввели: ' + input.trim());
}

module.exports = { openCommandBar };
