import React from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { ApiKey } from '../types';

interface ApiKeyManagerProps {
  apiKeys: ApiKey[];
  onApiKeyChange: (id: string, value: string) => void;
  onAddApiKey: () => void;
  onRemoveApiKey: (id: string) => void;
  disabled: boolean;
}

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);


const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, onApiKeyChange, onAddApiKey, onRemoveApiKey, disabled }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Manage API Keys</CardTitle>
        <CardDescription>
            Add one or more Gemini API keys. The system will rotate keys on quota errors and automatically use environment variables like GEMINI_API_KEY, GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiKeys.length > 0 ? (
          <div className="space-y-4">
            {apiKeys.map((key, index) => (
              <div key={key.id} className="flex items-center space-x-2">
                <Input
                  type="password"
                  value={key.value}
                  onChange={(e) => onApiKeyChange(key.id, e.target.value)}
                  placeholder={`API Key ${index + 1}`}
                  disabled={disabled}
                  className="font-mono"
                />
                <Button
                    onClick={() => onRemoveApiKey(key.id)}
                    disabled={disabled || apiKeys.length <= 1}
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove API Key ${index + 1}`}
                >
                    <XIcon className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-6 border-2 border-dashed rounded-lg">
            <p>No API key fields.</p>
            <p className="text-sm">Click below to add one.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button onClick={onAddApiKey} disabled={disabled} variant="outline">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Another API Key
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyManager;
