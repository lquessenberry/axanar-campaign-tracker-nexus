import { useState } from "react";
import { useReserveUsers, ReserveUser } from "@/hooks/useReserveUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Users, 
  AlertCircle, 
  SortAsc, 
  SortDesc,
  Mail,
  Database,
  Info
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminReserveUsersSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useReserveUsers({
    searchTerm,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 50
  });

  const stats = data?.stats;
  const users = data?.data || [];
  const pagination = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Reserve Users</h2>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load reserve users: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Reserve Users</h2>
          <p className="text-muted-foreground mt-2">
            Unique subscribers from legacy email lists who are not donors
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Reserve users are unique email subscribers imported from legacy email lists who have never made donations or pledges. 
          These users can be considered for future marketing campaigns or account creation.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reserve Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.totalReserveUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique email addresses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Source Platforms
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.sourcePlatforms?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Different platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Email Sources
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.sources?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find and sort reserve users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="display_name">Name</SelectItem>
                <SelectItem value="source_platform">Platform</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleSortOrder}
              className="w-10 h-10"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reserve Users List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${users.length} users displayed`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading reserve users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reserve users found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: ReserveUser) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.displayName || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.sourceName ? (
                          <Badge variant="outline">{user.sourceName}</Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.sourcePlatform ? (
                          <Badge variant="secondary">{user.sourcePlatform}</Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {user.emailStatus ? (
                          <Badge 
                            variant={user.emailStatus === 'active' ? 'default' : 'destructive'}
                          >
                            {user.emailStatus}
                          </Badge>
                        ) : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.userType}</Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          // Prioritize source contribution date, then imported date, then updated date
                          const dateToShow = user.sourceContributionDate || user.importedAt || user.updatedAt || user.createdAt;
                          if (!dateToShow || dateToShow === '1970-01-01T00:00:00.000Z') {
                            return 'Unknown';
                          }
                          try {
                            const date = new Date(dateToShow);
                            const isOriginalContribution = user.sourceContributionDate;
                            return (
                              <div className="flex flex-col">
                                <span>{date.toLocaleDateString()}</span>
                                {isOriginalContribution && (
                                  <span className="text-xs text-muted-foreground">Original</span>
                                )}
                                {!isOriginalContribution && user.importedAt && (
                                  <span className="text-xs text-muted-foreground">Imported</span>
                                )}
                              </div>
                            );
                          } catch {
                            return 'Invalid Date';
                          }
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.total > 50 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.has_more}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReserveUsersSection;