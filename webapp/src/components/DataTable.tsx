import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Eye, 
  Edit, 
  Flag, 
  Download, 
  Settings2, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import EventDetailsModal from './EventDetailsModal';

export interface EventData {
  id: string;
  energy: number;
  s1: number;
  s2: number;
  s2s1Ratio: number;
  type: string;
  confidence: number;
  timestamp?: string;
  position?: { x: number; y: number; z: number };
}

interface DataTableProps {
  data: EventData[];
  title?: string;
  onViewDetails?: (event: EventData) => void;
  onEdit?: (event: EventData) => void;
  onFlag?: (event: EventData) => void;
  onExport?: (events: EventData[]) => void;
  isLoading?: boolean;
}

type SortField = keyof EventData | 's2s1Ratio';
type SortDirection = 'asc' | 'desc';
type Density = 'comfortable' | 'compact' | 'dense';

const typeColors = {
  'WIMP': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  'Background': 'bg-green-500/20 text-green-400 border-green-500/50',
  'Axion': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  'Neutrino': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  'Anomaly': 'bg-red-500/20 text-red-400 border-red-500/50',
};

const densityClasses = {
  comfortable: 'py-4',
  compact: 'py-2',
  dense: 'py-1'
};

export const DataTable = ({ 
  data, 
  title = "Event Data", 
  onViewDetails, 
  onEdit, 
  onFlag, 
  onExport,
  isLoading = false
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [density, setDensity] = useState<Density>('comfortable');
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    energy: true,
    s1: true,
    s2: true,
    s2s1Ratio: true,
    type: true,
    confidence: true,
    actions: true
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const columns = [
    { key: 'id', label: 'Event ID', sortable: true },
    { key: 'energy', label: 'Energy (keV)', sortable: true },
    { key: 's1', label: 'S1 (PE)', sortable: true },
    { key: 's2', label: 'S2 (PE)', sortable: true },
    { key: 's2s1Ratio', label: 'S2/S1', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'confidence', label: 'Confidence (%)', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(event => 
      event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.energy.toString().includes(searchTerm) ||
      event.confidence.toString().includes(searchTerm)
    );

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 's2s1Ratio') {
        aValue = a.s2s1Ratio;
        bValue = b.s2s1Ratio;
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(paginatedData.map(event => event.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (eventId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(eventId);
    } else {
      newSelected.delete(eventId);
    }
    setSelectedRows(newSelected);
  };

  const handleExport = () => {
    const selectedEvents = data.filter(event => selectedRows.has(event.id));
    onExport?.(selectedEvents);
  };

  // Modal handlers
  const handleViewEvent = (event: EventData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    onViewDetails?.(event);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleExportEvent = (event: EventData) => {
    onExport?.([event]);
  };

  const handleCompareEvent = (event: EventData) => {
    // Placeholder for compare functionality
    console.log('Compare event:', event.id);
  };

  const handleReClassifyEvent = (event: EventData) => {
    // Placeholder for re-classification functionality
    console.log('Re-classify event:', event.id);
  };

  const toggleColumnVisibility = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column as keyof typeof prev]
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  return (
    <>
    <Card className="data-table-container">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="section-heading">
            <Search className="icon" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedRows.size > 0 && (
              <Button size="sm" onClick={handleExport} className="bg-green-600 hover:bg-green-700 transition-all duration-200">
                <Download className="w-4 h-4 mr-2" />
                Export Selected ({selectedRows.size})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-600 hover:bg-slate-700">
                  <Settings2 className="w-4 h-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
                {columns.slice(0, -1).map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns[column.key as keyof typeof visibleColumns]}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                    className="text-slate-300"
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-600 bg-slate-800 text-white placeholder:text-slate-400"
              />
            </div>
            <Select value={density} onValueChange={(value: Density) => setDensity(value)}>
              <SelectTrigger className="w-32 border-slate-600 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="dense">Dense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20 border-slate-600 bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-600 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="data-table-header border-slate-600 hover:bg-slate-800/30">
                <TableHead className="w-12 data-table-header">
                  <Checkbox
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="border-slate-500"
                  />
                </TableHead>
                {columns.map(column => 
                  visibleColumns[column.key as keyof typeof visibleColumns] && (
                    <TableHead 
                      key={column.key} 
                      className={`data-table-header ${column.sortable ? 'cursor-pointer hover:bg-slate-700/30 transition-colors' : ''} select-none`}
                      onClick={() => column.sortable && handleSort(column.key as SortField)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && getSortIcon(column.key as SortField)}
                      </div>
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="border-white/10">
                    <TableCell className={densityClasses[density]}>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    {visibleColumns.id && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    )}
                    {visibleColumns.energy && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    )}
                    {visibleColumns.s1 && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    )}
                    {visibleColumns.s2 && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    )}
                    {visibleColumns.s2s1Ratio && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    )}
                    {visibleColumns.type && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                    )}
                    {visibleColumns.confidence && (
                      <TableCell className={densityClasses[density]}>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    )}
                    <TableCell className={densityClasses[density]}>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                paginatedData.map((event, index) => (
                <TableRow 
                  key={event.id} 
                  className={`data-table-row ${
                    index % 2 === 1 ? 'bg-slate-800/20' : ''
                  } ${selectedRows.has(event.id) ? 'bg-blue-600/20' : ''}`}
                >
                  <TableCell className={densityClasses[density]}>
                    <Checkbox
                      checked={selectedRows.has(event.id)}
                      onCheckedChange={(checked) => handleSelectRow(event.id, checked as boolean)}
                      className="border-slate-500"
                    />
                  </TableCell>
                  
                  {visibleColumns.id && (
                    <TableCell className={`font-mono text-sm font-medium text-white ${densityClasses[density]}`}>
                      {event.id}
                    </TableCell>
                  )}
                  
                  {visibleColumns.energy && (
                    <TableCell className={`font-mono text-sm ${densityClasses[density]}`}>
                      {formatNumber(event.energy)}
                    </TableCell>
                  )}
                  
                  {visibleColumns.s1 && (
                    <TableCell className={`font-mono text-sm ${densityClasses[density]}`}>
                      {event.s1}
                    </TableCell>
                  )}
                  
                  {visibleColumns.s2 && (
                    <TableCell className={`font-mono text-sm ${densityClasses[density]}`}>
                      {event.s2}
                    </TableCell>
                  )}
                  
                  {visibleColumns.s2s1Ratio && (
                    <TableCell className={`font-mono text-sm ${densityClasses[density]}`}>
                      {formatNumber(event.s2s1Ratio, 2)}
                    </TableCell>
                  )}
                  
                  {visibleColumns.type && (
                    <TableCell className={densityClasses[density]}>
                      <Badge 
                        className={`confidence-tag ${event.type.toLowerCase()}`}
                      >
                        {event.type}
                      </Badge>
                    </TableCell>
                  )}
                  
                  {visibleColumns.confidence && (
                    <TableCell className={densityClasses[density]}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white">{event.confidence}%</span>
                        <div className="confidence-progress w-16">
                          <div 
                            className="confidence-progress-fill bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                            style={{ width: `${event.confidence}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  )}
                  
                  {visibleColumns.actions && (
                    <TableCell className={densityClasses[density]}>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewEvent(event)}
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                        >
                          <Eye className="action-icon" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit?.(event)}
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                        >
                          <Edit className="action-icon" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onFlag?.(event)}
                          className="h-8 w-8 p-0 hover:bg-slate-700"
                        >
                          <Flag className="action-icon" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-600">
          <div className="text-sm text-slate-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} entries
            {searchTerm && ` (filtered from ${data.length} total)`}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-slate-300 px-3 py-1 bg-slate-800 rounded font-mono">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Event Details Modal */}
    <EventDetailsModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      event={selectedEvent}
      onExport={handleExportEvent}
      onCompare={handleCompareEvent}
      onReClassify={handleReClassifyEvent}
    />
  </>
  );
};

export default DataTable;