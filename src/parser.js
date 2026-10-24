/** Иерархия команд и описания для подсказок. */
const commandTree = {
    file: {
        new: {
            action: 'file.new',
            description: 'Создать файл: file new "my notes.txt"'
        },
        open: {
            action: 'file.open',
            description: 'Открыть файл через диалог'
        },
        save: {
            action: 'file.save',
            description: 'Сохранить текущий файл'
        }
    },
    terminal: {
        action: 'terminal',
        description: 'Показать терминал'
    },
    go: {
        action: 'go',
        description: 'Перейти к строке: go 15'
    },
    select: {
        action: 'select',
        description: 'Выделить строки: select 5 10'
    },
    mode: {
        insert: {
            action: 'mode.insert',
            description: 'Включить обычный ввод'
        },
        navigate: {
            action: 'mode.navigate',
            description: 'Включить навигацию h/j/k/l'
        }
    },
    stats: {
        action: 'stats',
        description: 'Статистика файла через программу C++'
    },
    history: {
        action: 'history',
        description: 'Повторить команду из истории'
    }
};

/** Разбивает строку на слова, учитывая двойные кавычки. */
function tokenize(text) {
    const parts = [];
    let current = '';
    let quoted = false;
    let started = false;

    for (const character of text) {
        if (character === '"') {
            quoted = !quoted;
            started = true;
        } else if (/\s/.test(character) && !quoted) {
            if (started) {
                parts.push(current);
                current = '';
                started = false;
            }
        } else {
            current += character;
            started = true;
        }
    }

    if (quoted) {
        throw new Error('Закрой двойные кавычки.');
    }

    if (started) {
        parts.push(current);
    }

    return parts;
}

/** Находит команду в дереве и возвращает оставшиеся аргументы. */
function parseCommand(text) {
    const parts = tokenize(text);
    let node = commandTree;
    let index = 0;

    while (!node.action) {
        const name = parts[index];

        if (!name || !Object.hasOwn(node, name)) {
            throw new Error(
                'Ожидается: ' + Object.keys(node).join(', ')
            );
        }

        node = node[name];
        index++;
    }

    return {
        action: node.action,
        args: parts.slice(index)
    };
}

/** Преобразует дерево в список подсказок рекурсивным обходом. */
function getCommandList(node = commandTree, prefix = '') {
    const result = [];

    for (const [name, child] of Object.entries(node)) {
        const path = prefix ? prefix + ' ' + name : name;

        if (child.action) {
            result.push({
                label: path,
                description: child.description
            });
        } else {
            result.push(...getCommandList(child, path));
        }
    }

    return result;
}

module.exports = { parseCommand, getCommandList };
