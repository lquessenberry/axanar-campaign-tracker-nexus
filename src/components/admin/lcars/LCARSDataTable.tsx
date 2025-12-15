import { useState, useMemo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'default' | 'destructive';
}

export interface RowAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
}

export interface LCARSDataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  bulkActions?: BulkAction<T>[];
  rowActions?: RowAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  selectable?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  compact?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

function LCARSDataTable<T extends { id: string }>({
  data,
  columns,
  bulkActions = [],
  rowActions = [],
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  selectable = true,
  emptyMessage = 'No data found',
  className,
  onRowClick,
  stickyHeader = false,
  compact = false,
}: LCARSDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(row => {
      const keysToSearch = searchKeys.length > 0 ? searchKeys : Object.keys(row) as (keyof T)[];
      return keysToSearch.some(key => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortColumn];
      const bVal = (b as Record<string, unknown>)[sortColumn];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(sortedData.map(row => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const selectedRowsData = sortedData.filter(row => selectedRows.has(row.id));
  const isAllSelected = sortedData.length > 0 && selectedRows.size === sortedData.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < sortedData.length;

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3" />;
    }
    return <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-[200px] bg-muted/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Selection count */}
          {selectable && selectedRows.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedRows.size} selected
            </Badge>
          )}
        </div>

        {/* Bulk actions */}
        {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={action.variant === 'destructive' ? 'destructive' : 'secondary'}
                onClick={() => action.onClick(selectedRowsData)}
                className="h-8 gap-1"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={cn(
              'bg-muted/50',
              stickyHeader && 'sticky top-0 z-10'
            )}>
              <tr>
                {selectable && (
                  <th className="w-10 px-3 py-2 border-b border-border">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className={isSomeSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={cn(
                      'px-3 py-2 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer hover:text-foreground select-none'
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-1',
                      col.align === 'center' && 'justify-center',
                      col.align === 'right' && 'justify-end'
                    )}>
                      {col.header}
                      {col.sortable && <SortIcon columnKey={col.key} />}
                    </div>
                  </th>
                ))}
                {rowActions.length > 0 && (
                  <th className="w-10 px-3 py-2 border-b border-border" />
                )}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIndex) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      'hover:bg-muted/30',
                      selectedRows.has(row.id) && 'bg-primary/5',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={(e) => {
                      // Don't trigger row click if clicking on checkbox or action button
                      const target = e.target as HTMLElement;
                      if (target.closest('button') || target.closest('[role="checkbox"]')) return;
                      onRowClick?.(row);
                    }}
                  >
                    {selectable && (
                      <td className={cn('px-3', compact ? 'py-1.5' : 'py-2.5')}>
                        <Checkbox
                          checked={selectedRows.has(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, !!checked)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-3 text-sm',
                          compact ? 'py-1.5' : 'py-2.5',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render 
                          ? col.render(row, rowIndex)
                          : (row as Record<string, unknown>)[col.key] as ReactNode
                        }
                      </td>
                    ))}
                    {rowActions.length > 0 && (
                      <td className={cn('px-2', compact ? 'py-1.5' : 'py-2.5')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action, idx) => (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => action.onClick(row)}
                                className={action.variant === 'destructive' ? 'text-destructive' : ''}
                              >
                                {action.icon}
                                <span className="ml-2">{action.label}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing {sortedData.length} of {data.length} entries
          {searchQuery && ` (filtered)`}
        </span>
        {sortColumn && sortDirection && (
          <span>
            Sorted by {columns.find(c => c.key === sortColumn)?.header} ({sortDirection})
          </span>
        )}
      </div>
    </div>
  );
}

export default LCARSDataTable;
