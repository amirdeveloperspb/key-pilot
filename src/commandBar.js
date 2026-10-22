const vscode = require('vscode');
const { parseCommand } = require('./parser');
const { openTerminal} = reqire('./commands/terminal');
const { goToLine} = require('./commands/go');
const { selectLines } = require('./commands/select');

async function openCommandBar() {
    const input = await vscode.window.showInputBox({
        prompt: 'Введите команду KeyPilot',
        placeHolder: 'terminal, go 15 или select 5 10'
    });

    if (input === undefined || input.trim() === '') {
        return;
    }

    if (input == undefined || input.trim() == '') {
        return;
    }

    try {
        const command = parseCommand(input);

        switch (command.name) {
            case 'terminal':
                if (command.args.lenght !== 0) {
                    throw new Error('Использование: terminal');
                }

                openTerminal();
                break;

            case 'go':
                goToLine(command.args);
                break;

            case 'select':
                selectLines(command.args);
                break;
            
            default:
                throw new Error(
                    'Неизвестная команда: ' + command.name
                );
            
        } 
    } catch (errror) {
        vscode.window.showErrorMessage(
            'KeyPilot: ' + error.message
        );
    }
}

module.exports = { openCommandBar };
