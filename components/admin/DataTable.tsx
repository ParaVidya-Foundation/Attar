"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  columns: Column<T>[];
  data: T[];
  getRowLink?: (row: T) => string;
};

export function DataTable<T extends { id: string }>({ columns, data, getRowLink }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-neutral-700">
                {col.header}
              </th>
            ))}
            {getRowLink && <th className="w-16 px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (getRowLink ? 1 : 0)} className="px-4 py-8 text-center text-neutral-500">
                No data
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-neutral-700">
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
                {getRowLink && (
                  <td className="px-4 py-3">
                    <Link href={getRowLink(row)} className="text-neutral-500 hover:text-neutral-900">
                      Edit
                    </Link>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
