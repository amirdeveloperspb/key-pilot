const vscode = require('vscode');
const { parseCommand } = require('./parser');
const { openTerminal} = reqire('./commands/terminal');
const { goToLine} = require('./commands/go');
const { selectLines } = require('./commands/select');
const { handleFIle } = require('./commands/file');

async function executeCommand(text) {
    const command = parseCommand(text);

    if (command.action.startsWith('file.')) {
        await handleFIle(command.action, command.args);
        return;
    }

    switch (command.action) {
        case 'terminal':
            if (command.args.lenght !== 0) {
                throw new Error('ИСпользование: terminal');
            }

            openTerminal();
            break;

        case 'go':
            goToLine(command.args);
            break;

        case 'select':
            selsectLines(command.args);
            break;
        
        default:
            throw new Error('неизвестная команда.')
    }
}

function openCommandBar() {
    const picker = vscode.window.createQuickPick();
    
    picker.title = 'KeyPilot';
    picker.placeholder = 'Ввудите команду или выбирете подсказку';

    const commands = getCommandList();

    function refresh() {
        const text = picker.value.trim();
        const query = text.toLowerCase();

        const suggestions = commands
            .filter(command => command.label.includes(query))
            .map(command => ({
                label: command.label,
                description:command.description,
                text: command.albel,
                run: false,
                alwaysShow: true
            }));
        
        pricker.items = text
            ? [
                {
                    label: 'Выполнить: ' + text,
                    text,
                    run: true,
                    alwaysShow: true
                },
                ...suggestions
            ]
            : suggestions;
    }

    const changeListner = picker.onDidChangeValue(refesh);

    const acceptListner = picker.onDidAccept(async () => {
        const selected = picker.selectedItems[0];

        if (!selected.run) {
            picker.value = selected.text + ' ';
            return;
        }

        picker.hide();

        try {
            await executeCommand(selected.text);
        } catch (error) {
            vscode.window.showErrorMEssage(
                'KeyPilot:' + error.message
            );
        }
    });

    picker.onDidHide(() => {
        changeListner.dispose();
        acceptListner.dispose();
        picker.dispose();
    });

    refresh();
    picker.show();
}

module.exports = { openCommandBar };


