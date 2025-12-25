import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Medal } from "lucide-react";

export default function Landing_Page() {
  // Dummy prizes data
  const prizes = [
    {
      position: "1st Place",
      icon: Trophy,
      amount: "$5,000",
      description: "Cash prize and certificate",
    },
    {
      position: "2nd Place",
      icon: Award,
      amount: "$3,000",
      description: "Cash prize and certificate",
    },
    {
      position: "3rd Place",
      icon: Medal,
      amount: "$1,500",
      description: "Cash prize and certificate",
    },
  ];

  // Dummy sponsors data
  const sponsors = [
    {
      name: "Tech Corporation",
      logo: "https://via.placeholder.com/200x100/0066CC/FFFFFF?text=Tech+Corp",
      tier: "Gold Sponsor",
    },
    {
      name: "Innovate Labs",
      logo: "https://via.placeholder.com/200x100/FF6B00/FFFFFF?text=Innovate+Labs",
      tier: "Silver Sponsor",
    },
    {
      name: "Code Solutions",
      logo: "https://via.placeholder.com/200x100/00AA44/FFFFFF?text=Code+Solutions",
      tier: "Silver Sponsor",
    },
    {
      name: "Dev Tools Inc",
      logo: "https://via.placeholder.com/200x100/9933CC/FFFFFF?text=Dev+Tools",
      tier: "Bronze Sponsor",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            {/* Hero Header / Badge Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center rounded-full border bg-muted/50 px-4 py-2 text-sm">
                <Trophy className="mr-2 size-4 text-primary" />
                <span className="text-muted-foreground">Competitive Programming Event</span>
              </div>
            </div>

            {/* Hero Title Section */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Test Your
                <br />
                <span className="text-primary">Coding Skills</span>
              </h1>
            </div>

            {/* Hero Description Section */}
            <div className="text-center mb-10">
              <p className="text-lg text-muted-foreground sm:text-xl">
                Join the ultimate competitive programming challenge. Solve problems, compete with peers,
                and climb the leaderboard. Are you ready to code your way to victory?
              </p>
            </div>

            {/* Hero Actions Section */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Prizes Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Prizes
              </h2>
              <p className="text-lg text-muted-foreground">
                Compete for amazing prizes and recognition
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {prizes.map((prize, index) => {
                const Icon = prize.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 mx-auto">
                        <Icon className="size-8 text-primary" />
                      </div>
                      <CardTitle className="text-foreground text-2xl">{prize.position}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-primary mt-2">
                        {prize.amount}
                      </CardDescription>
                      <CardDescription className="mt-2">
                        {prize.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-20 sm:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Sponsors
              </h2>
              <p className="text-lg text-muted-foreground">
                Proudly sponsored by industry leaders
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {sponsors.map((sponsor, index) => (
                <Card key={index} className="flex flex-col items-center justify-center p-6">
                  <div className="h-24 w-full mb-4 flex items-center justify-center">
                    <img
                      src={sponsor.logo}
                      alt={`${sponsor.name} Logo`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <CardTitle className="text-foreground text-lg text-center mb-2">
                    {sponsor.name}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {sponsor.tier}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Organisers Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Organisers
              </h2>
              <p className="text-lg text-muted-foreground">
                Proudly organized by
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-12 sm:flex-row sm:gap-16">
              {/* Microsoft Innovation Club */}
              <div className="flex flex-col items-center">
                <div className="h-24 w-64 mb-4 flex items-center justify-center">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                    alt="Microsoft Innovation Club Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">Microsoft Innovation Club</p>
              </div>

              {/* CodeChef */}
              <div className="flex flex-col items-center">
                <div className="h-24 w-48 mb-4 flex items-center justify-center">
                  <img
                    src="https://cdn.codechef.com/sites/all/themes/abessive/cc-logo.svg"
                    alt="CodeChef Logo"
                    className="h-full w-full object-contain"
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">CodeChef</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
