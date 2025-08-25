import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import type { Reference, SessionRecord } from '../types';

interface AttendanceViewProps {
    references: Reference[];
    session: SessionRecord;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ references, session }) => {
    const attendanceMap = new Map(session.attendance.map(entry => [entry.referenceId, entry.timestamp]));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance for: <span className="text-primary">{session.name}</span></CardTitle>
                <CardDescription>
                    {`Live attendance log. ${attendanceMap.size} of ${references.length} members present.`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-4 py-3">Photo</th>
                                <th scope="col" className="px-4 py-3">Name</th>
                                <th scope="col" className="px-4 py-3">Status</th>
                                <th scope="col" className="px-4 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {references.length > 0 ? references.map(ref => {
                                const timestamp = attendanceMap.get(ref.id);
                                const isPresent = !!timestamp;

                                return (
                                    <tr key={ref.id} className="border-b">
                                        <td className="px-4 py-2">
                                            <img src={ref.imageBase64} alt={ref.name} className="h-12 w-12 object-cover rounded-full" />
                                        </td>
                                        <td className="px-4 py-2 font-medium">{ref.name}</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {isPresent ? 'Present' : 'Absent'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-muted-foreground">
                                            {timestamp ? new Date(timestamp).toLocaleTimeString() : '—'}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-muted-foreground">
                                        No references have been added to this class yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default AttendanceView;