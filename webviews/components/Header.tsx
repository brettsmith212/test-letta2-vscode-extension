import React from 'react';
import { Button } from '../components/ui/button';
import { Pencil } from 'lucide-react';

interface HeaderProps {
    onNewThread: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewThread }) => (
    <div className="flex justify-end p-2 border-b border-[var(--vscode-panel-border)]">
        <Button 
            onClick={onNewThread} 
            variant="ghost" 
            size="icon"
            className="text-[var(--vscode-symbolIcon-functionForeground)] hover:text-[var(--vscode-symbolIcon-functionForeground)]/80 hover:bg-[var(--vscode-button-hoverBackground)]"
        >
            <Pencil className="h-4 w-4" />
        </Button>
    </div>
);

export default Header;