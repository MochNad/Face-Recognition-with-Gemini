import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { ClassRecord } from '../types';

interface ClassManagerProps {
  classes: ClassRecord[];
  onAddClass: (name: string) => void;
  onSelectClass: (classId: string) => void;
  onDeleteClass: (classId: string) => void;
}

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.966-.784-1.75-1.75-1.75h-1.5c-.966 0-1.75.784-1.75 1.75v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
    </svg>
);


const ClassManager: React.FC<ClassManagerProps> = ({ classes, onAddClass, onSelectClass, onDeleteClass }) => {
  const [newClassName, setNewClassName] = useState('');

  const handleAddClick = () => {
    onAddClass(newClassName);
    setNewClassName('');
  };
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Manage Classes</CardTitle>
        <CardDescription>Create new classes or select an existing one to manage attendance sessions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {classes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 border rounded-lg bg-card flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold text-card-foreground">{cls.name}</h3>
                    <p className="text-sm text-muted-foreground">{cls.references.length} reference(s)</p>
                    <p className="text-sm text-muted-foreground">{cls.sessions.length} session(s)</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => onSelectClass(cls.id)} className="flex-1">Manage</Button>
                  <Button variant="destructive" size="icon" onClick={() => onDeleteClass(cls.id)} aria-label={`Delete class ${cls.name}`}>
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
            <p>No classes found.</p>
            <p className="text-sm">Create your first class below.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 border-t px-6 py-4">
        <Input
          placeholder="New Class Name (e.g., Morning Session)"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
          className="flex-1"
        />
        <Button onClick={handleAddClick} disabled={!newClassName.trim()} className="w-full sm:w-auto">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Class
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassManager;