import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Check, Star } from 'lucide-react'

interface GeneralPassModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (days: number) => void
}

const passPricing = [
  {
    days: 1,
    price: 500,
    title: 'Any 1 Day Pass',
    description: 'Access to all general events on any single day',
    features: ['Choose any 1 day', 'All general events', 'Festival merchandise'],
    popular: false
  },
  {
    days: 2,
    price: 400,
    title: 'Any 2 Days Pass',
    description: 'Access to all general events on any two days',
    features: ['Choose any 2 days', 'All general events', 'Festival merchandise', 'Priority seating'],
    popular: true
  },
  {
    days: 3,
    price: 300,
    title: 'All 3 Days Pass',
    description: 'Complete festival access for all three days',
    features: ['All 3 days access', 'All general events', 'Festival merchandise', 'Priority seating', 'VIP lounge access'],
    popular: false
  }
]

export function GeneralPassModal({ isOpen, onClose, onPurchase }: GeneralPassModalProps) {
  const [selectedPass, setSelectedPass] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!selectedPass) return
    
    setLoading(true)
    try {
      await onPurchase(selectedPass)
      onClose()
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yugam-500" />
            Choose Your General Event Pass
          </DialogTitle>
          <DialogDescription>
            Select a pass to access all general events during Yugam 2025. 
            You can attend multiple general events with a single pass!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-3 py-6">
          {passPricing.map((pass) => (
            <Card 
              key={pass.days}
              className={`relative cursor-pointer transition-all duration-200 ${
                selectedPass === pass.days 
                  ? 'ring-2 ring-yugam-500 shadow-lg' 
                  : 'hover:shadow-md'
              } ${pass.popular ? 'border-yugam-200' : ''}`}
              onClick={() => setSelectedPass(pass.days)}
            >
              {pass.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="yugam" className="px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-yugam-500" />
                </div>
                <CardTitle className="text-xl">{pass.title}</CardTitle>
                <CardDescription>{pass.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-yugam-600">₹{pass.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">per person</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {pass.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {selectedPass === pass.days && (
                  <div className="mt-4 p-3 bg-yugam-50 dark:bg-yugam-950 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yugam-700 dark:text-yugam-300">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Selected</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePurchase}
            disabled={!selectedPass || loading}
            className="min-w-[120px]"
          >
            {loading ? 'Processing...' : `Purchase Pass - ₹${selectedPass ? passPricing.find(p => p.days === selectedPass)?.price : 0}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}