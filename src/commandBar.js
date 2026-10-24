const vscode = require('vscode');
const { parseCommand, getCommandList } = require('./parser');
const { openTerminal } = require('./commands/terminal');
const { goToLine } = require('./commands/go');
const { selectLines } = require('./commands/select');
const { handleFile } = require('./commands/file');
const { showStats } = require('./commands/stats');

/** Выполняет разобранную команду через соответствующий обработчик. */
async function executeCommand(text, services) {
    const { action, args } = parseCommand(text);

    const withoutArguments = [
        'terminal',
        'mode.insert',
        'mode.navigate',
        'stats',
        'history'
    ];

    if (withoutArguments.includes(action) && args.length !== 0) {
        throw new Error('Эта команда не принимает аргументы.');
    }

    if (action.startsWith('file.')) {
        await handleFile(action, args);
        return;
    }

    switch (action) {
        case 'terminal':
            openTerminal();
            break;

        case 'go':
            goToLine(args);
            break;

        case 'select':
            selectLines(args);
            break;

        case 'mode.insert':
            await services.modes.set('insert');
            break;

        case 'mode.navigate':
            await services.modes.set('navigate');
            break;

        case 'stats':
            await showStats(services.context);
            break;

        case 'history': {
            const items = services.history.list();

            if (items.length === 0) {
                vscode.window.showInformationMessage('История пуста.');
                return;
            }

            const selected = await vscode.window.showQuickPick(
                items,
                { placeHolder: 'Выбери команду для повторения' }
            );

            if (selected) {
                await executeCommand(selected, services);
                await services.history.add(selected);
            }

            break;
        }

        default:
            throw new Error('Неизвестное действие: ' + action);
    }
}

/** Формирует подсказки и подходящие записи истории. */
function makeSuggestions(value, history) {
    const text = value.trim();
    const query = text.toLowerCase();

    const commands = getCommandList()
        .filter(item => item.label.includes(query))
        .map(item => ({
            label: item.label,
            description: item.description,
            text: item.label,
            run: false,
            alwaysShow: true
        }));

    const recent = history.list()
        .filter(item => item.toLowerCase().includes(query))
        .slice(0, 5)
        .map(item => ({
            label: item,
            description: 'Повторить из истории',
            text: item,
            run: true,
            alwaysShow: true
        }));

    if (!text) {
        return [...commands, ...recent];
    }

    return [
        {
            label: 'Выполнить: ' + text,
            text,
            run: true,
            alwaysShow: true
        },
        ...commands,
        ...recent
    ];
}

/** Открывает командную строку с подсказками и обработкой ошибок. */
function openCommandBar(services) {
    const picker = vscode.window.createQuickPick();

    picker.title = 'KeyPilot';
    picker.placeholder = 'file, terminal, go, select, mode, stats, history';

    /** Перестраивает список при изменении ввода. */
    function refresh() {
        picker.items = makeSuggestions(
            picker.value,
            services.history
        );
    }

    const changeListener = picker.onDidChangeValue(refresh);

    const acceptListener = picker.onDidAccept(async () => {
        const selected = picker.selectedItems[0];

        if (!selected) {
            return;
        }

        if (!selected.run) {
            picker.value = selected.text + ' ';
            return;
        }

        const text = selected.text.trim();

        if (!text) {
            return;
        }

        picker.hide();

        try {
            await executeCommand(text, services);

            if (parseCommand(text).action !== 'history') {
                await services.history.add(text);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                'KeyPilot: ' + error.message
            );
        }
    });

    picker.onDidHide(() => {
        changeListener.dispose();
        acceptListener.dispose();
        picker.dispose();
    });

    refresh();
    picker.show();
}

module.exports = { openCommandBar };
