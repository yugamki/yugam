import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToastContext } from '@/components/ui/toast-provider'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'PARTICIPANT' | 'EVENT_COORDINATOR' | 'WORKSHOP_COORDINATOR' | 'EVENTS_LEAD' | 'WORKSHOPS_LEAD' | 'ADMIN'
  yugamId?: string
  college?: string
  createdAt: string
}

const roleLabels: Record<string, string> = {
  'PARTICIPANT': 'Participant',
  'EVENT_COORDINATOR': 'Event Coordinator',
  'WORKSHOP_COORDINATOR': 'Workshop Coordinator',
  'EVENTS_LEAD': 'Events Lead',
  'WORKSHOPS_LEAD': 'Workshops Lead',
  'ADMIN': 'Admin'
}

const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  'PARTICIPANT': 'outline',
  'EVENT_COORDINATOR': 'secondary',
  'WORKSHOP_COORDINATOR': 'secondary',
  'EVENTS_LEAD': 'default',
  'WORKSHOPS_LEAD': 'default',
  'ADMIN': 'destructive'
}

export default function UserPermissions() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [updateDialog, setUpdateDialog] = useState(false)
  const { toast } = useToastContext()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User role updated to ${roleLabels[newRole]}`
        })
        setUpdateDialog(false)
        setSelectedUser(null)
        setNewRole('')
        fetchUsers()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update user role",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.yugamId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.college?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Permissions Management</h1>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(roleLabels).map(([role, label]) => (
          <Card key={role}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats[role] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage User Roles</CardTitle>
          <CardDescription>Assign and update user permissions and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, Yugam ID, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem key={role} value={role}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>College</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      {user.yugamId && (
                        <div className="text-sm text-gray-500">{user.yugamId}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.college || 'Not specified'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.role)
                          }}
                        >
                          Update Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update User Role</DialogTitle>
                          <DialogDescription>
                            Change the role for {selectedUser?.firstName} {selectedUser?.lastName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Role</Label>
                            <div className="p-2 bg-gray-50 rounded-md">
                              <Badge variant={roleColors[selectedUser?.role || 'PARTICIPANT']}>
                                {roleLabels[selectedUser?.role || 'PARTICIPANT']}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="newRole">New Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select new role" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(roleLabels).map(([role, label]) => (
                                  <SelectItem key={role} value={role}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                                                     <div className="text-sm text-gray-600">
                             <strong>Role Permissions:</strong>
                             <ul className="mt-2 space-y-1">
                               {newRole === 'PARTICIPANT' && (
                                 <>
                                   <li>• Can register for events and workshops</li>
                                 </>
                               )}
                               {newRole === 'EVENT_COORDINATOR' && (
                                 <>
                                   <li>• Can manage assigned events</li>
                                   <li>• Can view event registrations</li>
                                 </>
                               )}
                               {newRole === 'WORKSHOP_COORDINATOR' && (
                                 <>
                                   <li>• Can manage assigned workshops</li>
                                   <li>• Can view workshop registrations</li>
                                 </>
                               )}
                               {newRole === 'EVENTS_LEAD' && (
                                 <>
                                   <li>• Can create and manage all events</li>
                                   <li>• Can send communications for events</li>
                                   <li>• Can view event analytics</li>
                                 </>
                               )}
                               {newRole === 'WORKSHOPS_LEAD' && (
                                 <>
                                   <li>• Can create and manage all workshops</li>
                                   <li>• Can send communications for workshops</li>
                                   <li>• Can view workshop analytics</li>
                                 </>
                               )}
                               {newRole === 'ADMIN' && (
                                 <>
                                   <li>• Full system access</li>
                                   <li>• Can manage all users and content</li>
                                   <li>• Can approve/reject requests</li>
                                   <li>• Can view all analytics and reports</li>
                                 </>
                               )}
                             </ul>
                           </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setUpdateDialog(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={updateUserRole}
                            disabled={!newRole || newRole === selectedUser?.role}
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
        </CardContent>
      </Card>
    </div>
  )
}