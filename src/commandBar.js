const vscode = require('vscode');
const { openTerminal} = reqire('./commands/terminal');

async function openCommandBar() {
    const input = await vscode.window.showInputBox({
        prompt: 'Введите команду KeyPilot',
        placeHolder: 'terminal'
    });

    if (input === undefined || input.trim() === '') {
        return;
    }

    const command = input.trim();

    if (command == 'terminal') {
        openTerminal();
    } else {
        vscode.window.showErrorMessage(
            'Неизвсетная команда' + command
        );
    }
}

module.exports = { openCommandBar };
