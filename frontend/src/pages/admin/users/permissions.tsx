import { useState, useEffect } from 'react'
import { Search, UserCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  college?: string
  createdAt: string
}

const userRoles = [
  { value: 'PARTICIPANT', label: 'Participant' },
  { value: 'EVENT_COORDINATOR', label: 'Event Coordinator' },
  { value: 'WORKSHOP_COORDINATOR', label: 'Workshop Coordinator' },
  { value: 'EVENTS_LEAD', label: 'Events Lead' },
  { value: 'WORKSHOPS_LEAD', label: 'Workshops Lead' },
  { value: 'ADMIN', label: 'Admin' },
]

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'destructive'
    case 'EVENTS_LEAD':
    case 'WORKSHOPS_LEAD':
      return 'yugam'
    case 'EVENT_COORDINATOR':
    case 'WORKSHOP_COORDINATOR':
      return 'secondary'
    default:
      return 'outline'
  }
}

const getRoleDashboard = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'EVENTS_LEAD':
      return '/admin/events'
    case 'WORKSHOPS_LEAD':
      return '/admin/workshops'
    case 'EVENT_COORDINATOR':
      return '/admin/events/my-events'
    case 'WORKSHOP_COORDINATOR':
      return '/admin/workshops/my-workshops'
    default:
      return '/dashboard'
  }
}

export function UserPermissions() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        await fetchUsers()
        setIsAssignRoleOpen(false)
        setSelectedUser(null)
        setNewRole('')
        
        // Show success message with dashboard info
        const dashboard = getRoleDashboard(newRole)
        alert(`Role updated successfully! User will be redirected to ${dashboard} on next login.`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Assign roles and permissions to users
          </p>
        </div>
      </div>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>
            Understanding different user roles and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userRoles.map((role) => (
              <div key={role.value} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={getRoleBadgeVariant(role.value)}>
                    {role.label}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Dashboard: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                    {getRoleDashboard(role.value)}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>
            Select users and assign appropriate roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {userRoles.find(r => r.value === user.role)?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.college || 'N/A'}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {getRoleDashboard(user.role)}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isAssignRoleOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                        setIsAssignRoleOpen(open)
                        if (!open) {
                          setSelectedUser(null)
                          setNewRole('')
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setNewRole(user.role)
                            }}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Role</DialogTitle>
                            <DialogDescription>
                              Change the role for {user.firstName} {user.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-sm">
                                <div><strong>User:</strong> {user.firstName} {user.lastName}</div>
                                <div><strong>Email:</strong> {user.email}</div>
                                <div><strong>Current Role:</strong> {userRoles.find(r => r.value === user.role)?.label}</div>
                                <div><strong>Current Dashboard:</strong> <code>{getRoleDashboard(user.role)}</code></div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newRole">New Role</Label>
                              <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {userRoles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {newRole && newRole !== user.role && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong>New Dashboard:</strong> <code>{getRoleDashboard(newRole)}</code>
                                </div>
                                <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                  User will be redirected to this dashboard on next login
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleAssignRole}
                              disabled={!newRole || newRole === user.role}
                            >
                              Update Role
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}