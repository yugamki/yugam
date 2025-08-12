import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

interface WorkshopFormData {
  title: string
  description: string
  domain: string
  category: string
  startDate: string
  endDate: string
  duration: number
  eventType: string
  expectedParticipants: number
  feePerPerson?: number
  venue: string
  maxRegistrations?: number
  rules: string
  prizes: string
  contactInfo: string
}

export function CreateWorkshop() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    description: '',
    domain: '',
    category: '',
    startDate: '',
    endDate: '',
    duration: 1,
    eventType: 'PAID',
    expectedParticipants: 30,
    venue: '',
    rules: '',
    prizes: '',
    contactInfo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          isWorkshop: true,
          mode: 'INDIVIDUAL' // Workshops are always individual
        }),
      })

      if (response.ok) {
        navigate('/admin/workshops/manage')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create workshop')
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
      alert('Failed to create workshop')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Workshop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new workshop for Yugam 2025
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of your workshop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter workshop title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter workshop description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain *</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    placeholder="e.g., Technical, Design"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="e.g., Web Development, AI/ML"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Workshop venue"
                />
              </div>
            </CardContent>
          </Card>

          {/* Workshop Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Workshop Configuration</CardTitle>
              <CardDescription>
                Configure the workshop details and pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventType">Workshop Type *</Label>
                <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select workshop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedParticipants">Expected Participants *</Label>
                  <Input
                    id="expectedParticipants"
                    type="number"
                    value={formData.expectedParticipants}
                    onChange={(e) => handleInputChange('expectedParticipants', parseInt(e.target.value))}
                    placeholder="30"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRegistrations">Max Registrations</Label>
                  <Input
                    id="maxRegistrations"
                    type="number"
                    value={formData.maxRegistrations || ''}
                    onChange={(e) => handleInputChange('maxRegistrations', parseInt(e.target.value))}
                    placeholder="50"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feePerPerson">Workshop Fee (₹) *</Label>
                <Input
                  id="feePerPerson"
                  type="number"
                  value={formData.feePerPerson || ''}
                  onChange={(e) => handleInputChange('feePerPerson', parseFloat(e.target.value))}
                  placeholder="500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date and Time</CardTitle>
            <CardDescription>
              Set the workshop schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="2">2 Days</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>
              Add rules, prizes, and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rules">Rules and Guidelines</Label>
              <Textarea
                id="rules"
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Enter workshop rules and guidelines"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizes">Certificates/Prizes</Label>
              <Textarea
                id="prizes"
                value={formData.prizes}
                onChange={(e) => handleInputChange('prizes', e.target.value)}
                placeholder="Enter certificate and prize details"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Textarea
                id="contactInfo"
                value={formData.contactInfo}
                onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                placeholder="Enter contact details for participants"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Workshop'}
          </Button>
        </div>
      </form>
    </div>
  )
}