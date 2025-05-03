import React from "react";
import type { Preview } from "@storybook/react";
import "../webviews/index.css";

const vscodeTheme = {
  "--vscode-editor-background": "#1e1e1e",
  "--vscode-editor-foreground": "#d4d4d4",
  "--vscode-button-background": "#0078d4",
  "--vscode-button-foreground": "#ffffff",
  "--vscode-button-hoverBackground": "#0066b5",
  "--vscode-input-background": "#3c3c3c",
  "--vscode-input-foreground": "#cccccc",
  "--vscode-input-border": "#3c3c3c",
  "--vscode-input-placeholderForeground": "#818181",
  "--vscode-focusBorder": "#007fd4",
  "--vscode-panel-border": "#80808059",
  "--vscode-editorWidget-background": "#252526",
  "--vscode-symbolIcon-functionForeground": "#b180d7",
  "--vscode-inputValidation-errorBackground": "#5a1d1d",
  "--vscode-inputValidation-errorForeground": "#ffffff",
  "--vscode-inputValidation-errorBorder": "#be1100",
} as const;

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1e1e1e',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      defaultValue: vscodeTheme,
    },
  },
  decorators: [
    (Story) => {
      const style = {
        ...vscodeTheme,
        padding: '1rem',
      };
      
      return (
        <div style={style}>
          <Story />
        </div>
      );
    },
  ],
}

export default preview;
