requirejs.config({
    paths: {
        text: 'bower_components/requirejs-text/text',
        ace: 'bower_components/ace/lib/ace/',
        fixmyjs: 'lib/fixmyjs',
        jshint: 'bower_components/jshint/dist/jshint'
    },
    shim: {
        fixmyjs: {
            exports: 'fixMyJS'
        },
        jshint: {
            exports: 'JSHINT'
        }
    }
});

require(['bower_components/ace/lib/ace/ace', 'text!code/jshintrc', 'text!code/oldcode.js', 'fixmyjs', 'jshint'], function (ace, jshintrc, oldCode, fixmyjs, jshint) {

    var theme = 'ace/theme/github';
    var jsHintConfigEditor = ace.edit('editor-jshint-config');
    jsHintConfigEditor.setTheme(theme);
    jsHintConfigEditor.getSession().setMode('ace/mode/javascript');
    jsHintConfigEditor.setValue(jshintrc, -1);


    var oldCodeEditor = ace.edit('editor-old-code');
    oldCodeEditor.setTheme(theme);
    oldCodeEditor.getSession().setMode('ace/mode/json');
    oldCodeEditor.setValue(oldCode, -1);

    var codeResultEditor = ace.edit('editor-new-code');
    codeResultEditor.setTheme(theme);
    codeResultEditor.getSession().setMode('ace/mode/javascript');
    codeResultEditor.setReadOnly(true);
    var editors = [jsHintConfigEditor, oldCodeEditor, codeResultEditor ];

    function parseJSHint() {
        try {
            return JSON.parse(jsHintConfigEditor.getValue());
        } catch (e) {
            throw  'JSHint';
        }
    }

    function fixJS(code, jshintConfig) {
        try {
            if( jshintConfig.legacy ){
                jshint(code, jshintConfig);
                return fixmyjs(jshint.data(), code, jshintConfig).run()
            } else {
                return fixMyJS.fix(code, jshintConfig);
            }

        } catch (e) {
            throw  'JSError';
        }
    }

    function processCodeChange() {
        $(jsHintConfigEditor.container).removeClass('error');
        $(oldCodeEditor.container).removeClass('error');
        try {
            codeResultEditor.setValue(fixJS(oldCodeEditor.getValue(), parseJSHint()), -1);
        } catch (e) {
            if (e === 'JSHint') {
                $(jsHintConfigEditor.container).addClass('error');
            }
            if (e === 'JSError') {
                $(oldCodeEditor.container).addClass('error');
            }

        }


    }

    editors.forEach(function (editor) {
        editor.setShowPrintMargin(false);
        editor.renderer.setShowGutter(false);
        editor.renderer.setPadding(20);
    });
    oldCodeEditor.on('input', processCodeChange);
    jsHintConfigEditor.on('input', processCodeChange);

});
