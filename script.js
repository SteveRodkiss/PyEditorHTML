let editor;

// Initialize Monaco editor
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    editor = monaco.editor.create(document.getElementById('editor-container'), {
        value: 'print("Hello from Python!")',
        language: 'python',
        theme: 'vs-dark',
        automaticLayout: true
    });
});

async function runPython() {
    let code = editor.getValue();
    let outputElement = document.getElementById("output");
    
    // Show running indicator
    outputElement.innerText = "Running...";
    
    try {
        // Initialize Pyodide if not already loaded
        if (!window.pyodide) {
            outputElement.innerText = "Loading Python environment...";
            window.pyodide = await loadPyodide();
        }
        
        // Redirect Python stdout to capture print statements
        window.pyodide.runPython(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
        `);
        
        // Run the user's code
        window.pyodide.runPython(code);
        
        // Get the captured output
        let stdout = window.pyodide.runPython("sys.stdout.getvalue()");
        outputElement.innerText = stdout || "Code executed successfully (no output)";
    } catch (error) {
        outputElement.innerHTML = `<span style="color: #ff5f56;">Error: ${error}</span>`;
    }
}
