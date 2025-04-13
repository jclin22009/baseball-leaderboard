"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconGripVertical,
  IconLayoutColumns,
  IconInfoCircle,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const schema = z.object({
  id: z.number(),
  student: z.string(),
  player: z.string(),
  predictedHits: z.number(),
  predictedHitsSoFar: z.number().optional(),
  actualHits: z.number().optional(),
  percentageOff: z.number().optional(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "position",
    header: "#",
    cell: ({ row, table }) => {
      // Get current page rows with current sorting applied
      const sortedRows = table.getSortedRowModel().rows;
      
      // Find the index of the current row in the sorted array
      const rowRank = sortedRows.findIndex(r => r.id === row.id) + 1;
      
      return <div className="text-center font-medium">{rowRank}</div>;
    },
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "player",
    header: "Player",
    cell: ({ row }) => (
      <div className="w-32">
        {row.original.player}
      </div>
    ),
  },
  {
    accessorKey: "predictedHits",
    header: () => (
      <div className="flex items-center whitespace-nowrap">
        Predicted Hits <Badge variant="outline" className="ml-2">Full Season</Badge>
      </div>
    ),
    cell: ({ row }) => (
      <div>{row.original.predictedHits}</div>
    ),
  },
  {
    accessorKey: "predictedHitsSoFar",
    header: () => (
      <div className="flex items-center whitespace-nowrap">
        Predicted Hits <Badge variant="outline" className="ml-2">To Date</Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1 h-5 w-5 p-0">
              <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Calculated based on the proportion of MLB games completed so far in the season, not calendar time. This provides a more accurate measure of expected hits at this point in the season.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: ({ row }) => (
      <div>{row.original.predictedHitsSoFar != null ? row.original.predictedHitsSoFar.toFixed(1) : "0.0"}</div>
    ),
  },
  {
    accessorKey: "actualHits",
    header: "Actual Hits",
    cell: ({ row }) => (
      <div>{row.original.actualHits !== null && row.original.actualHits !== undefined ? row.original.actualHits : 0}</div>
    ),
  },
  {
    accessorKey: "percentageOff",
    header: "Prediction Delta",
    cell: ({ row }) => {
      // For cases with 0 actual hits, show infinity symbol
      if (row.original.actualHits === 0 && (row.original.predictedHitsSoFar ?? 0) > 0) {
        return <div>∞</div>;
      }
      // For other cases show the calculated percentage
      return <div>{row.original.percentageOff != null ? row.original.percentageOff.toFixed(2) + "%" : "0.00%"}</div>;
    },
    sortingFn: (rowA, rowB) => {
      const valueA = rowA.original.percentageOff;
      const valueB = rowB.original.percentageOff;
      
      // Handle infinity cases (when actual hits is 0)
      if (rowA.original.actualHits === 0 && (rowA.original.predictedHitsSoFar ?? 0) > 0) {
        // If both have 0 actual hits, compare by predicted hits
        if (rowB.original.actualHits === 0 && (rowB.original.predictedHitsSoFar ?? 0) > 0) {
          return (rowB.original.predictedHitsSoFar ?? 0) - (rowA.original.predictedHitsSoFar ?? 0);
        }
        // Infinity is always greater than any percentage
        return 1;
      }
      
      if (rowB.original.actualHits === 0 && (rowB.original.predictedHitsSoFar ?? 0) > 0) {
        return -1; // B is infinity, so B is greater
      }
      
      // If neither has percentage data, maintain original order
      if (valueA == null && valueB == null) return 0;
      // If A doesn't have percentage data, B comes first
      if (valueA == null) return 1;
      // If B doesn't have percentage data, A comes first
      if (valueB == null) return -1;
      // Otherwise sort by absolute value of percentage (ascending)
      return Math.abs(valueA) - Math.abs(valueB);
    }
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeTab, setActiveTab] = React.useState("top-by-percent");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      drag: false, // Hide drag handle by default
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "percentageOff",
      desc: false
    }
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 30, // Set default to 30 rows per page
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta: {
      activeTab,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="top-by-percent"
      className="w-full flex-col justify-start gap-6"
      onValueChange={(value) => setActiveTab(value)}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent
        value="top-by-percent"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="top-by-number" className="flex flex-col px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page-number" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page-number">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  // Extract first word from student name
  const firstName = item.student.split(' ')[0];

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {firstName}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.student}</DrawerTitle>
          <DrawerDescription>
            {item.player} - {item.predictedHits} Predicted Hits (Season)
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Student prediction details
                </div>
                <div className="text-muted-foreground">
                  {item.student} predicted {item.predictedHits} hits for {item.player} over the entire season.
                  {item.predictedHitsSoFar != null ? ` Predicted hits so far: ${item.predictedHitsSoFar.toFixed(1)}` : ''}
                  {item.actualHits ? ` Actual hits so far: ${item.actualHits}` : ''}
                  {item.percentageOff != null ? ` Prediction Delta: ${item.percentageOff.toFixed(2)}%` : ''}
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="student">Student</Label>
              <Input id="student" defaultValue={item.student} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="player">Player</Label>
                <Input id="player" defaultValue={item.player} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="predictedHits">Predicted Hits (Season)</Label>
                <Input id="predictedHits" defaultValue={item.predictedHits} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="predictedHitsSoFar">Predicted Hits (So Far)</Label>
                <Input id="predictedHitsSoFar" defaultValue={item.predictedHitsSoFar != null ? item.predictedHitsSoFar.toFixed(1) : "0.0"} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="actualHits">Actual Hits</Label>
                <Input id="actualHits" defaultValue={item.actualHits !== null && item.actualHits !== undefined ? item.actualHits : 0} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="percentageOff">Prediction Delta</Label>
              <Input id="percentageOff" defaultValue={
                item.actualHits === 0 && (item.predictedHitsSoFar ?? 0) > 0 
                  ? "∞" 
                  : (item.percentageOff != null ? item.percentageOff.toFixed(2) + "%" : "0.00%")
              } />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// Function to load data from predictions.csv
export async function loadPredictionsData() {
  try {
    console.log("Loading predictions data...");
    // Since we're in a client component, we need to fetch the data
    const response = await fetch('/predictions.csv');
    const csvText = await response.text();
    
    // Simple CSV parsing logic since we can't use csv-parse in client components
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const records = lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {} as Record<string, string>);
    });
    
    // Calculate the proportion of the season that has elapsed (OLD METHOD)
    const today = new Date();
    console.log(`Current date: ${today.toISOString()}`);
    const seasonStart = new Date('2025-03-27');
    const seasonEnd = new Date('2025-09-28');
    
    // Handle the case if we're viewing this before the season starts
    const elapsedTime = Math.max(0, today.getTime() - seasonStart.getTime());
    const totalSeasonTime = seasonEnd.getTime() - seasonStart.getTime();
    const seasonProportion = elapsedTime / totalSeasonTime;
    console.log(`OLD METHOD - Time-based proportion: ${(seasonProportion * 100).toFixed(2)}%`);
    
    // NEW METHOD: Get MLB schedule data to calculate games completed proportion
    let gamesProportion = 0;
    try {
      console.log("Fetching MLB schedule data...");
      const scheduleUrl = 'https://statsapi.mlb.com/api/v1/schedule?hydrate=team,lineups&sportId=1&startDate=2025-03-27&endDate=2025-05-31&teamId=137';
      console.log(`Schedule URL: ${scheduleUrl}`);
      
      const scheduleResponse = await fetch(scheduleUrl);
      console.log(`Schedule API response status: ${scheduleResponse.status}`);
      
      const scheduleData = await scheduleResponse.json();
      
      // Get total games in the season
      const totalGames = scheduleData.totalGames;
      console.log(`Total games in season: ${totalGames}`);
      
      // Calculate games completed so far
      let gamesCompleted = 0;
      
      // Count games that have already been played (before today)
      if (scheduleData.dates) {
        console.log(`Found ${scheduleData.dates.length} date entries in schedule`);
        
        for (const dateEntry of scheduleData.dates) {
          const gameDate = new Date(dateEntry.date);
          console.log(`Checking date: ${dateEntry.date}, games on this date: ${dateEntry.totalGames}`);
          
          if (gameDate < today) {
            // Add the games for this date
            gamesCompleted += dateEntry.totalGames;
            console.log(`Date ${dateEntry.date} is in the past, adding ${dateEntry.totalGames} games`);
          } else {
            console.log(`Date ${dateEntry.date} is in the future, skipping`);
          }
        }
      } else {
        console.log("No dates found in schedule data");
      }
      
      // Calculate proportion of games completed
      gamesProportion = totalGames > 0 ? gamesCompleted / totalGames : 0;
      console.log(`NEW METHOD - Games completed: ${gamesCompleted}/${totalGames}`);
      console.log(`NEW METHOD - Games-based proportion: ${(gamesProportion * 100).toFixed(2)}%`);
      
      // Use the games-based proportion for calculations
      // But if we're testing and it's 0, use the time-based approach
      if (gamesProportion === 0 && seasonProportion > 0) {
        console.log("Using time-based proportion for testing since games proportion is 0");
        gamesProportion = seasonProportion;
      }
    } catch (error) {
      console.error('Error fetching MLB schedule data:', error);
      // Fall back to the old calculation method if API fails
      gamesProportion = seasonProportion;
      console.log(`Falling back to time-based proportion: ${(gamesProportion * 100).toFixed(2)}%`);
    }
    
    // Process each record with player IDs and hit data
    const recordsWithStats = await Promise.all(
      records.map(async (record, index) => {
        // Step 1: Get player ID from player name
        const playerName = record.baseball_player;
        let playerId: string | null = null;
        let actualHits = 0; // Default to 0 instead of null
        let percentageOff = 0; // Default to 0 instead of null
        const predictedHits = parseInt(record.predicted_hits, 10);
        
        // Calculate predicted hits so far based on games proportion (not time proportion)
        const predictedHitsSoFar = gamesProportion > 0 ? Number((predictedHits * gamesProportion).toFixed(1)) : 0;
        
        if (index === 0) {
          console.log(`Example calculation for ${playerName}:`);
          console.log(`- Predicted hits (season): ${predictedHits}`);
          console.log(`- Games proportion: ${gamesProportion.toFixed(4)}`);
          console.log(`- Predicted hits so far: ${predictedHitsSoFar}`);
        }
        
        try {
          const playerIdResponse = await fetch(`/api/get-player-id?fullname=${encodeURIComponent(playerName)}`);
          if (playerIdResponse.ok) {
            const playerData = await playerIdResponse.json();
            playerId = playerData.id;
            
            // Step 2: Get actual hits for this player
            if (playerId) {
              const hitsResponse = await fetch(`/api/get-hits-so-far?playerId=${playerId}&season=2025`);
              if (hitsResponse.ok) {
                const hitsData = await hitsResponse.json();
                actualHits = hitsData.hits;
                
                // Step 3: Calculate percentage off
                if (actualHits === 0) {
                  // For 0 actual hits, we'll display infinity in the UI
                  // We'll set a very high percentage (Infinity would cause issues in JSON)
                  percentageOff = predictedHitsSoFar > 0 ? 999999 : 0;
                } else {
                  // Calculate absolute difference as a percentage of actual hits
                  const diff = Math.abs(predictedHitsSoFar - actualHits);
                  percentageOff = Number(((diff / actualHits) * 100).toFixed(2));
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error processing player data for ${playerName}:`, error);
        }
        
        return {
          id: index + 1,
          student: record.student,
          player: record.baseball_player,
          predictedHits: predictedHits,
          predictedHitsSoFar: predictedHitsSoFar,
          actualHits: actualHits,
          percentageOff: percentageOff,
        };
      })
    );
    
    return recordsWithStats;
  } catch (error) {
    console.error('Error loading predictions data:', error);
    return [];
  }
}
