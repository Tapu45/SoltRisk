import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary p-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white"
              >
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Nexus</h1>
          </div>
          
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Manage Your Evidence with Confidence</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Streamline evidence collection, processing, and validation for vendors, clients, and staff.
            </p>
            <div className="flex gap-4">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="pb-0">
              <CardTitle className="text-2xl">Key Features</CardTitle>
              <CardDescription>
                Everything you need to manage evidence
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {[
                  "Secure Evidence Storage",
                  "Role-based Access Control",
                  "Vendor Management",
                  "Approval Workflows",
                  "Client Branch Management"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="text-primary mt-1"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>

        <footer className="mt-24 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}