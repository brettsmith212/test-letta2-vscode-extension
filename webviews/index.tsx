import React from 'react';
import { createRoot } from 'react-dom/client';
import Chat from './Chat';
import './index.css'; // Import Tailwind CSS and custom styles

// Get the root element from the webview HTML
const rootElement = document.getElementById('root') as HTMLElement;

// Create a React root and render the Chat component
const root = createRoot(rootElement);
root.render(<Chat />);