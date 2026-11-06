const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../package.json');

// Условия KeyPilot состоят из имён контекстов, отрицаний и логического И.
function matches(expression, context) {
    return expression.split(' && ').every(term =>
        term.startsWith('!') ? !context[term.slice(1)] : Boolean(context[term])
    );
}

test('navigation keys work inside the editor even when inputFocus is true', () => {
    const expected = {
        h: 'cursorLeft', j: 'cursorDown', k: 'cursorUp',
        l: 'cursorRight', i: 'keyPilot.insert'
    };
    for (const [key, command] of Object.entries(expected)) {
        const binding = manifest.contributes.keybindings.find(item => item.key === key);
        assert.equal(binding.command, command);
        const context = { editorTextFocus: true, inputFocus: true, 'keyPilot.navigation': true };
        assert.equal(matches(binding.when, context), true);
        assert.equal(matches(binding.when, { ...context, 'keyPilot.navigation': false }), false);
        assert.equal(matches(binding.when, { ...context, editorTextFocus: false }), false);
    }
});

test('Escape enters navigation in text but does not intercept search or selection', () => {
    const binding = manifest.contributes.keybindings.find(item => item.key === 'escape');
    const context = { editorTextFocus: true, inputFocus: true };
    assert.equal(matches(binding.when, context), true);
    for (const key of ['editorReadonly', 'suggestWidgetVisible', 'findWidgetVisible', 'inSnippetMode', 'editorHasSelection']) {
        assert.equal(matches(binding.when, { ...context, [key]: true }), false);
    }
});
