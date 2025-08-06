import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Users, Trophy, Sparkles, Clock, Star, Zap, Award, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    name: 'Technical Excellence',
    description: 'Cutting-edge competitions, hackathons, robotics challenges, and tech talks by industry leaders.',
    icon: Zap,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Cultural Extravaganza',
    description: 'Spectacular performances, dance battles, music concerts, drama, and art exhibitions.',
    icon: Sparkles,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Skill Workshops',
    description: 'Hands-on learning with industry experts on latest technologies and professional skills.',
    icon: Users,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Sports Arena',
    description: 'Thrilling tournaments across cricket, football, basketball, and various indoor sports.',
    icon: Trophy,
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-red-500'
  },
]

const stats = [
  { name: 'Expected Participants', value: '25,000+', icon: Users },
  { name: 'Events & Workshops', value: '200+', icon: Calendar },
  { name: 'Days of Celebration', value: '3', icon: Clock },
  { name: 'Prize Pool', value: '₹10L+', icon: Award },
]

const highlights = [
  {
    title: 'Celebrity Performances',
    description: 'Renowned artists and performers will grace the stage',
    icon: Star,
    color: 'text-yellow-500'
  },
  {
    title: 'Industry Partnerships',
    description: 'Leading tech companies and startups as partners',
    icon: Globe,
    color: 'text-blue-500'
  },
  {
    title: 'Innovation Hub',
    description: 'Showcase your projects and connect with investors',
    icon: Zap,
    color: 'text-purple-500'
  }
]

export function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yugam-50 via-white to-yugam-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-32 sm:py-40">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59532\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yugam-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-40 right-20 w-16 h-16 bg-yugam-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-yugam-400 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="yugam" className="mb-8 animate-fade-in text-lg px-6 py-2">
              🎉 Registration Now Open - Early Bird Offers Available!
            </Badge>
            
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl animate-fade-in">
              Welcome to{' '}
              <span className="yugam-gradient-text block mt-2">Yugam 2025</span>
            </h1>
            
            <p className="mt-8 text-xl leading-8 text-muted-foreground animate-fade-in max-w-3xl mx-auto">
              India's most spectacular college festival returns! Join 25,000+ students for three unforgettable days of 
              innovation, culture, competition, and celebration. Where dreams meet reality and legends are born.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in">
              <Button size="lg" variant="yugam" className="text-lg px-8 py-4 h-auto shadow-2xl hover:shadow-yugam-500/25 transition-all duration-300" asChild>
                <Link to="/events">
                  <Trophy className="mr-2 h-5 w-5" />
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2 hover:bg-yugam-50 dark:hover:bg-yugam-950" asChild>
                <Link to="/workshops">
                  <Users className="mr-2 h-5 w-5" />
                  View Workshops
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.name} className="text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className="h-8 w-8 text-yugam-500" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.name}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-yugam-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              What Makes Yugam Extraordinary
            </h2>
            <p className="mt-6 text-xl leading-8 text-muted-foreground">
              Experience the perfect fusion of technology, culture, sports, and innovation at India's premier college festival
            </p>
          </div>
          
          <div className="mx-auto mt-20 max-w-2xl sm:mt-24 lg:mt-32 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-12 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.name} className="group relative">
                    <div className="card-hover bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 h-full">
                      <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-foreground mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="text-base leading-7 text-muted-foreground">
                        {feature.description}
                      </dd>
                    </div>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-r from-yugam-600 to-yugam-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Festival Highlights
            </h2>
            <p className="mt-6 text-xl leading-8 text-yugam-100">
              Exclusive experiences that make Yugam 2025 unforgettable
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {highlights.map((highlight) => {
              const Icon = highlight.icon
              return (
                <div key={highlight.title} className="glass-effect rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <Icon className={`h-12 w-12 ${highlight.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{highlight.title}</h3>
                  <p className="text-yugam-100">{highlight.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Registration CTA Section */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-yugam-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Ready to Make History?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
              Join 25,000+ participants in India's most spectacular college festival. 
              Register now and be part of something extraordinary!
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" variant="yugam" className="text-lg px-10 py-4 h-auto shadow-2xl" asChild>
                <Link to="/auth/register">
                  <Star className="mr-2 h-5 w-5" />
                  Register Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 h-auto border-2" asChild>
                <Link to="/contact">
                  <Globe className="mr-2 h-5 w-5" />
                  Contact Us
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                <div className="text-2xl font-bold text-yugam-600">₹10L+</div>
                <div className="text-sm text-muted-foreground">Total Prize Money</div>
              </div>
              <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                <div className="text-2xl font-bold text-yugam-600">50+</div>
                <div className="text-sm text-muted-foreground">Industry Partners</div>
              </div>
              <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg">
                <div className="text-2xl font-bold text-yugam-600">100%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}