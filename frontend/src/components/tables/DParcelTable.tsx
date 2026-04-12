import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Meta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface DParcelTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  /** Pass rowsPerPage ONLY if you want client-side pagination (no API meta) */
  rowsPerPage?: number;
  /** API pagination meta — if provided, server-side pagination is used */
  meta?: Meta | null;
  /** Called with new page number when user clicks prev/next */
  onPageChange?: (newPage: number) => void;
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <TableRow key={ri}>
          {Array.from({ length: cols }).map((_, ci) => (
            <TableCell key={ci} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-gray-400 dark:text-gray-500 text-sm"
      >
        No records found
      </td>
    </TableRow>
  );
}

function PaginationBar({
  currentPage,
  lastPage,
  total,
  perPage,
  onPrev,
  onNext,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/[0.05]">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium text-gray-700 dark:text-gray-200">{from}–{to}</span> of{" "}
        <span className="font-medium text-gray-700 dark:text-gray-200">{total}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/[0.05] dark:text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 px-1">
          {currentPage} / {lastPage}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === lastPage}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === lastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-white/[0.05] dark:text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DParcelTable<T extends { id: number }>({
  columns,
  data,
  loading = false,
  rowsPerPage,
  meta,
  onPageChange,
}: DParcelTableProps<T>) {

  // ── Client-side pagination state (only used when meta is NOT provided) ──────
  const [clientPage, setClientPage] = useState(1);

  // ─── Determine which pagination mode to use ───────────────────────────────
  const isServerPaginated = !!meta && !!onPageChange;
  const isClientPaginated = !isServerPaginated && !!rowsPerPage;

  // ─── Data slice for client-side pagination ────────────────────────────────
  const displayData = isClientPaginated
    ? data.slice((clientPage - 1) * rowsPerPage, clientPage * rowsPerPage)
    : data;

  const clientTotalPages = isClientPaginated
    ? Math.ceil(data.length / rowsPerPage)
    : 1;

  // ─── Pagination handlers ──────────────────────────────────────────────────
  const handlePrev = () => {
    if (isServerPaginated) {
      if (meta!.current_page > 1) onPageChange!(meta!.current_page - 1);
    } else {
      setClientPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNext = () => {
    if (isServerPaginated) {
      if (meta!.current_page < meta!.last_page) onPageChange!(meta!.current_page + 1);
    } else {
      setClientPage((p) => Math.min(clientTotalPages, p + 1));
    }
  };

  // ─── Pagination bar values ────────────────────────────────────────────────
  const currentPage = isServerPaginated ? meta!.current_page : clientPage;
  const lastPage    = isServerPaginated ? meta!.last_page    : clientTotalPages;
  const total       = isServerPaginated ? meta!.total        : data.length;
  const perPage     = isServerPaginated ? meta!.per_page     : (rowsPerPage ?? data.length);
  const showPagination = isServerPaginated
    ? meta!.last_page > 1
    : isClientPaginated && data.length > rowsPerPage;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full">

          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  isHeader
                  className={`px-4 py-3 font-medium text-gray-500 text-start text-xs whitespace-nowrap dark:text-gray-400 ${col.className ?? ""}`}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableSkeleton rows={5} cols={columns.length} />
            ) : displayData.length === 0 ? (
              <EmptyRow colSpan={columns.length} />
            ) : (
              displayData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`px-4 py-3 text-gray-700 text-start text-sm align-top dark:text-gray-400 ${col.className ?? ""}`}
                    >
                      <div className="max-w-xs break-words">
                        {col.render
                          ? col.render(row)
                          : (row as any)[col.key]}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <PaginationBar
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
}