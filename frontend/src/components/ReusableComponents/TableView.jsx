import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { UserContext } from "../Utils/userContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// import generateQualityFormPDF from "./PdfFormData";
import generateQualityFormExcel from "./generateQualityFormExcel";
import DownLoadAllRecords from "./DownLoadAllRecords";

const TableView = ({ data }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const getStatusLabel = (status, teamFlag) => {
    console.log("Status:", status, "Team Flag:", teamFlag);
    if (status === "approved") return "Approved";
    if (status === "finished") return "View";
    if (status === "pending_prod") {
      return (teamFlag === "QA" || teamFlag === "IT")
        ? "Submitted"
        : "Review";
    }

    if (status === "pending_quality") {
      return teamFlag === "INTERNAL"
        ? "Submitted"
        : "Review";
    }

    return "Review";
  };

  // Base columns
  const baseColumns = [
    {
      header: "Part Name",
      accessorKey: "formData.issuingSection.part.partName",
      cell: ({ row }) => (
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {row.original.formData.issuingSection.part.partName || "Untitled"}
        </span>
      ),
    },
    {
      header: "Supplier/Department Name",
      accessorKey: "formData.defectivenessDetail.supplier.supplierName",
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.formData.defectivenessDetail.supplier.supplierName || "N/A"}
        </span>
      ),
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-400">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue();
        const color =
          status === "approved"
            ? "bg-green-100 text-green-700"
            : status === "pending_prod"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700";
        const label =
          status === "pending_quality"
            ? "AWAITING QUALITY REVIEW"
            : status === "pending_prod"
            ? "AWAITING PRODUCTION REVIEW"
            : status === "approved" ? "Approved"
            : "Finished";

        return (
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: "Action",
      cell: ({ row }) => (
        <div className="text-left">
          {user.team !== row.original.filledBy && (
            <Button
              onClick={() =>
                navigate("/Quality-Form", { state: { data: row.original } })
              }
              className={`${
                row.original.status === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {getStatusLabel(row.original.status, user.team.flag)}

            </Button>
          )}
        </div>
      ),
    },
  ];

  // Add Info column only if user.team === "quality"
  const columns =
    user?.team === "Quality"
      ? [
          ...baseColumns,
          {
            header: "Info",
            cell: ({ row }) => (
              <div className="text-left">
                {
                  row.original.status === "approved" &&
                  <DropdownMenu>
                      <DropdownMenuTrigger className="text-white bg-amber-500 p-2 rounded">Download</DropdownMenuTrigger>
                      <DropdownMenuContent> 
                        <DropdownMenuItem onClick={() => DownLoadAllRecords([row.original.formData])}>export as Pdf</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={()=>{generateQualityFormExcel(row.original)}}>export as excel</DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                }
                
              </div>
            ),
          },
        ]
      : baseColumns;

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-left font-bold cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end items-center gap-4">
        <Button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          variant="outline"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TableView;
