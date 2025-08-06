import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Users, Trophy, Sparkles, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    name: 'Technical Events',
    description: 'Coding competitions, hackathons, robotics, and tech talks by industry experts.',
    icon: Trophy,
    color: 'text-blue-500',
  },
  {
    name: 'Cultural Programs',
    description: 'Dance, music, drama, fashion shows, and art exhibitions showcasing talent.',
    icon: Sparkles,
    color: 'text-purple-500',
  },
  {
    name: 'Workshops',
    description: 'Hands-on learning sessions on latest technologies and skill development.',
    icon: Users,
    color: 'text-green-500',
  },
  {
    name: 'Sports Events',
    description: 'Cricket, football, basketball, and various indoor and outdoor sports.',
    icon: Calendar,
    color: 'text-orange-500',
  },
]

const stats = [
  { name: 'Expected Participants', value: '10,000+' },
  { name: 'Events & Workshops', value: '200+' },
  { name: 'Days of Celebration', value: '3' },
  { name: 'Prize Money', value: '₹5L+' },
]

const upcomingEvents = [
  {
    id: 1,
    title: 'Web Development Workshop',
    category: 'Technical',
    date: '2025-02-15',
    time: '10:00 AM',
    location: 'Computer Lab A',
    price: 500,
    registrations: 45,
    maxRegistrations: 50,
  },
  {
    id: 2,
    title: 'Cultural Night',
    category: 'Cultural',
    date: '2025-02-16',
    time: '6:00 PM',
    location: 'Main Auditorium',
    price: 0,
    registrations: 234,
    maxRegistrations: 500,
  },
  {
    id: 3,
    title: 'Robotics Competition',
    category: 'Technical',
    date: '2025-02-17',
    time: '9:00 AM',
    location: 'Engineering Block',
    price: 1000,
    registrations: 28,
    maxRegistrations: 30,
  },
]

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yugam-50 via-white to-yugam-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f59532" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="yugam" className="mb-6 animate-fade-in">
              Registration Now Open
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl animate-fade-in">
              Welcome to{' '}
              <span className="yugam-gradient-text">Yugam 2025</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in">
              The ultimate college festival experience. Join thousands of students for three days of 
              technical competitions, cultural programs, workshops, and unforgettable memories.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in">
              <Button size="lg" variant="yugam" asChild>
                <Link to="/events">
                  Explore Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/workshops">View Workshops</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Yugam 2025 by the Numbers
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Join the biggest college festival in the region
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col bg-muted/50 p-8">
                  <dt className="text-sm font-semibold leading-6 text-muted-foreground">{stat.name}</dt>
                  <dd className="order-first text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Makes Yugam Special
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Experience the perfect blend of technology, culture, sports, and learning
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.name} className="flex flex-col card-hover">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                      <Icon className={`h-5 w-5 flex-none ${feature.color}`} aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Don't miss out on these exciting events and workshops
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={event.category === 'Technical' ? 'default' : 'secondary'}>
                      {event.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {event.registrations}/{event.maxRegistrations} registered
                    </span>
                  </div>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-lg font-semibold text-foreground">
                      {event.price === 0 ? 'Free' : `₹${event.price}`}
                    </span>
                    <Button variant="yugam" size="sm" asChild>
                      <Link to={`/events/${event.id}`}>Register Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative isolate overflow-hidden bg-yugam-600 px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.yugam.100),white)] opacity-20" />
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Join Yugam 2025?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-yugam-100">
            Register now and be part of the most exciting college festival. Early bird discounts available!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}