import { useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";

interface VSCodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  onCursorChange?: (line: number, column: number) => void;
}

export function VSCodeEditor({ value, language, onChange, onCursorChange }: VSCodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Define custom purple theme
    monaco.editor.defineTheme("purple-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#E0E0E0",
        "editor.lineHighlightBackground": "#252526",
        "editorCursor.foreground": "#A855F7",
        "editor.selectionBackground": "#A855F744",
        "editor.inactiveSelectionBackground": "#A855F722",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#C586C0",
        "editor.findMatchBackground": "#A855F755",
        "editor.findMatchHighlightBackground": "#A855F733",
        "minimap.background": "#181818",
        "scrollbarSlider.background": "#79797966",
        "scrollbarSlider.hoverBackground": "#646464B3",
        "scrollbarSlider.activeBackground": "#BFBFBF66",
      },
    });

    monaco.editor.setTheme("purple-dark");

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange?.(e.position.lineNumber, e.position.column);
    });

    // Focus editor
    editor.focus();
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
      options={{
        // Editor appearance
        fontSize: 14,
        fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', 'Monaco', monospace",
        fontLigatures: true,
        lineHeight: 21,
        letterSpacing: 0.5,
        
        // Line numbers and gutters
        lineNumbers: "on",
        lineNumbersMinChars: 4,
        glyphMargin: true,
        folding: true,
        
        // Minimap
        minimap: {
          enabled: true,
          side: "right",
          showSlider: "always",
          renderCharacters: true,
          maxColumn: 120,
        },
        
        // Scrolling
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        mouseWheelZoom: true,
        
        // Cursor
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        cursorWidth: 2,
        
        // Selections
        selectionHighlight: true,
        occurrencesHighlight: "multiFile",
        renderLineHighlight: "all",
        
        // Auto-features
        automaticLayout: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        autoIndent: "full",
        formatOnPaste: true,
        formatOnType: true,
        
        // IntelliSense
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true,
        },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: "on",
        tabCompletion: "on",
        wordBasedSuggestions: "matchingDocuments",
        parameterHints: { enabled: true },
        
        // Find/Replace
        find: {
          seedSearchStringFromSelection: "selection",
          autoFindInSelection: "multiline",
          addExtraSpaceOnTop: true,
        },
        
        // Code actions
        lightbulb: { enabled: "on" },
        codeActionsOnSave: {},
        
        // Bracket features
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        matchBrackets: "always",
        
        // Editor features
        dragAndDrop: true,
        copyWithSyntaxHighlighting: true,
        multiCursorModifier: "ctrlCmd",
        wordWrap: "off",
        wrappingIndent: "indent",
        
        // Performance
        renderWhitespace: "selection",
        renderControlCharacters: false,
        renderFinalNewline: "on",
        
        // Snippets
        snippetSuggestions: "top",
        tabSize: 2,
        insertSpaces: true,
        detectIndentation: true,
        trimAutoWhitespace: true,
        
        // Advanced
        codeLens: true,
        colorDecorators: true,
        contextmenu: true,
        links: true,
        showFoldingControls: "always",
        showUnused: true,
        useTabStops: true,
        
        // Experimental
        stickyScroll: { enabled: true },
      }}
    />
  );
}
