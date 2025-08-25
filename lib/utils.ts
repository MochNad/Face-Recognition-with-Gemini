import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Reference, SessionRecord } from "../types";

// This tells TypeScript that the XLSX global variable exists,
// as it's loaded from a CDN script in index.html.
declare var XLSX: any;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exportToExcel = (
    className: string, 
    session: SessionRecord, 
    references: Reference[]
) => {
    const attendanceMap = new Map(session.attendance.map(entry => [entry.referenceId, entry.timestamp]));

    const data = references.map(ref => {
        const timestamp = attendanceMap.get(ref.id);
        return {
            Name: ref.name,
            Status: timestamp ? 'Present' : 'Absent',
            'Attendance Time': timestamp ? new Date(timestamp).toLocaleString() : 'N/A',
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Set column widths
    worksheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }];

    const fileName = `${className} - ${session.name} - Attendance.xlsx`;
    XLSX.writeFile(workbook, fileName);
};