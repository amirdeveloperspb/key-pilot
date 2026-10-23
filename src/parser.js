const commandTree = {
    file: {
        new: {
            action: 'file.new',
            description: 'Создать файл: file new notes.txt'
        },
        open: {
            action: 'file.open',
            description: 'Открыть файл через диалог'
        },
        save: {
            action: 'file.save',
            description: 'Сохрани текущий файл'
        }
    },
    terminal: {
        action: 'terminal',
        description: 'Открыть терминал'
    },
    go: {
        action: 'go',
        description: 'Перейти к строке: go 15'
    },
    select: {
        action: 'select',
        description: 'Выделить строки: select 5 10'
    }
};

function tokenize(text) {
    const parts = [];
    let current = '';
    let quoted = false;
    let started = false;

    for (const character of text) {
        if (character == '"') {
            quoted = !quoted;
            started = true;
        } else if (/\s./test(charachter) && !quoted) {
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

function parseCommand(text) {
    const parts = tokensize(text);
    let node = commandTree;
    let index = 0;

    while (!node.action) {
        const name = parts[index];

        if (!name || !Object.hasOwn(node, name)) {
            throw new Error(
                'Ожидается:' + Object.keys(node).join(', ')
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