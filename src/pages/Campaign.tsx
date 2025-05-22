import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import PerkCard from "@/components/PerkCard";
import { cn } from "@/lib/utils";

// Mock campaign data
const campaignData = {
  "axanar-film": {
    title: "Axanar: The Feature Film",
    description: "Axanar takes place 21 years before the events of \"Where no man has gone before\", the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War, the war with the Klingon Empire that almost tore the Federation apart.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    creator: "Axanar Productions",
    creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    category: "Film & Video",
    current: 750000,
    goal: 1000000,
    backers: 8423,
    daysLeft: 18,
    city: "Los Angeles",
    country: "United States",
    campaignStart: "2025-04-01",
    campaignEnd: "2025-06-10",
    longDescription: `
      <p class="mb-4">
        Axanar takes place 21 years before the events of "Where no man has gone before", the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War, the war with the Klingon Empire that almost tore the Federation apart. Garth was a legendary Starfleet captain, who was the hero of the Battle of Axanar, which is briefly mentioned in the original Star Trek episode "Whom Gods Destroy".
      </p>
      <p class="mb-4">
        The feature film will be preceded by the short film Prelude to Axanar, which premiered at San Diego Comic-Con on July 26, 2014. The short film chronicles the efforts of the historian John Gill to document the story of the Four Years War through interviews with key participants, including Garth of Izar, Federation Admiral Samuel Travis, Klingon D6 commander Kharn, and Starfleet Chief of Staff Admiral Marcus Ramirez. The feature film will also include these interviews, as well as dramatized sequences of the Battle of Axanar.
      </p>
      <p class="mb-4">
        The Battle of Axanar was a decisive Starfleet victory that changed the direction of the Four Years War. Garth's innovative tactics at Axanar were credited with saving the Federation and later added to the curriculum at Starfleet Academy. The film will also explore the political and military decisions that led to the war, as well as the personal cost of the conflict on the participants.
      </p>
      <p class="mb-4">
        Axanar is a groundbreaking independent film that proves the idea that a studio doesn't need to spend millions of dollars to produce a feature quality production. Axanar will be the first non-CBS/Paramount produced Star Trek to look and feel like a true Star Trek movie.
      </p>
    `,
    updates: [
      {
        id: 1,
        title: "Production Update: Filming Schedule Confirmed",
        content: "We're excited to announce that our filming schedule has been confirmed for August 2025. We've secured all the necessary locations and are now in the final stages of set design.",
        date: "2025-05-15"
      },
      {
        id: 2,
        title: "Cast Announcement: Lead Roles Filled",
        content: "After an extensive casting process, we're thrilled to reveal our lead cast members. Richard Hatch will play Garth of Izar, Kate Vernon as Captain Sonya Alexander, and Tony Todd as Admiral Marcus Ramirez.",
        date: "2025-05-01"
      },
      {
        id: 3,
        title: "Milestone: 75% Funded!",
        content: "We've reached 75% of our funding goal! Thank you to all our backers for your incredible support. With just over two weeks left, we're pushing hard to reach our full goal.",
        date: "2025-04-28"
      },
    ],
    perks: [
      {
        title: "Digital Supporter",
        price: 25,
        description: "Get digital access to the film upon release and your name in the credits.",
        features: [
          "Digital download of the finished film",
          "Your name in the digital credits",
          "Exclusive backer updates",
        ],
        claimed: 3240,
        estimatedDelivery: "October 2025",
      },
      {
        title: "Collector's Edition",
        price: 75,
        description: "Get the physical collector's edition plus digital perks.",
        features: [
          "Physical Blu-ray with exclusive cover art",
          "Digital download of the finished film",
          "Your name in the film credits",
          "Behind-the-scenes digital photobook",
          "Access to exclusive backer updates",
        ],
        claimed: 2150,
        limit: 3000,
        estimatedDelivery: "November 2025",
        isPopular: true,
      },
      {
        title: "VIP Package",
        price: 250,
        description: "Get the ultimate fan experience with exclusive VIP perks.",
        features: [
          "Signed collector's edition Blu-ray",
          "Limited edition Axanar poster (18x24\")",
          "Behind-the-scenes digital photobook",
          "Special thanks credit in the film",
          "Exclusive Axanar t-shirt",
          "Digital download of the soundtrack",
          "Access to virtual cast Q&A session",
        ],
        claimed: 864,
        limit: 1000,
        estimatedDelivery: "December 2025",
      },
      {
        title: "Set Visit Experience",
        price: 1000,
        description: "Visit the set during filming and meet the cast and crew.",
        features: [
          "Full day set visit in Los Angeles",
          "Meet & greet with cast and crew",
          "Photo opportunities on set",
          "All VIP Package perks included",
          "Exclusive signed prop replica",
          "Executive Producer credit",
        ],
        claimed: 50,
        limit: 50,
        estimatedDelivery: "August 2025",
      },
    ],
    faqs: [
      {
        question: "When will the film be released?",
        answer: "We're targeting a premiere in late 2025, with distribution to backers shortly thereafter. The exact release date will depend on post-production timelines."
      },
      {
        question: "Will backers get early access to the film?",
        answer: "Yes! All backers will receive digital access to the film before it's released to the general public."
      },
      {
        question: "Are international shipping costs included in the perk prices?",
        answer: "Shipping costs for physical perks are included for US backers. International backers may need to pay additional shipping fees, which will be calculated at the end of the campaign."
      },
      {
        question: "Can I upgrade my pledge later?",
        answer: "Yes, you can upgrade your pledge at any time during the active campaign. After the campaign ends, you'll have an opportunity to adjust your pledge during the backer survey phase."
      },
      {
        question: "How will you communicate project updates?",
        answer: "We send regular updates through our campaign page, and all backers will receive email notifications. For more frequent updates, follow us on social media."
      }
    ]
  }
};

const Campaign = () => {
  const { id } = useParams();
  const campaign = campaignData[id as keyof typeof campaignData];
  const [activeTab, setActiveTab] = useState("story");

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
            <Button className="bg-axanar-teal hover:bg-axanar-teal/90" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        {/* Campaign Hero */}
        <section className="bg-axanar-dark text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              
              <div className="lg:col-span-2">
                <span className="badge-primary bg-axanar-teal">{campaign.category}</span>
                <h1 className="text-3xl font-bold mt-4 mb-2">{campaign.title}</h1>
                <p className="text-axanar-silver/80 mb-6">{campaign.description}</p>
                
                <div className="flex items-center space-x-3 mb-6">
                  <img 
                    src={campaign.creatorImage} 
                    alt={campaign.creator}
                    className="w-10 h-10 rounded-full" 
                  />
                  <div>
                    <p className="text-sm">By <span className="font-semibold">{campaign.creator}</span></p>
                    <p className="text-xs text-axanar-silver/60">{campaign.city}, {campaign.country}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <ProgressBar current={campaign.current} goal={campaign.goal} className="mb-4" />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-2xl font-bold">${campaign.current.toLocaleString()}</p>
                      <p className="text-xs text-axanar-silver/60">of ${campaign.goal.toLocaleString()} goal</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaign.backers.toLocaleString()}</p>
                      <p className="text-xs text-axanar-silver/60">backers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaign.daysLeft}</p>
                      <p className="text-xs text-axanar-silver/60">days left</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-axanar-teal hover:bg-axanar-teal/90 text-lg py-6">
                    Back this Project
                  </Button>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/10">
                      Follow Campaign
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/10">
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Campaign Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full border-b flex bg-transparent">
                    <TabsTrigger 
                      value="story" 
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal"
                    >
                      Story
                    </TabsTrigger>
                    <TabsTrigger 
                      value="updates" 
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal"
                    >
                      Updates ({campaign.updates.length})
                    </TabsTrigger>
                    <TabsTrigger 
                      value="faq" 
                      className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-axanar-teal"
                    >
                      FAQ
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="story" className="pt-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: campaign.longDescription }} />
                  </TabsContent>
                  
                  <TabsContent value="updates" className="pt-6 space-y-8">
                    {campaign.updates.map((update) => (
                      <div key={update.id} className="border-b pb-6">
                        <h3 className="text-xl font-bold mb-2">{update.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Posted on {new Date(update.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-foreground">{update.content}</p>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="faq" className="pt-6 space-y-6">
                    {campaign.faqs.map((faq, index) => (
                      <div key={index} className="border-b pb-4">
                        <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="space-y-6">
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Campaign Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Campaign Start</p>
                      <p className="font-medium">
                        {new Date(campaign.campaignStart).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Campaign End</p>
                      <p className="font-medium">
                        {new Date(campaign.campaignEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{campaign.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Creator</p>
                      <p className="font-medium">{campaign.creator}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-lg font-bold mb-4">Report Campaign</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    See something that violates our terms of service? Let us know.
                  </p>
                  <Button variant="outline" className="w-full">
                    Report This Campaign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Perks Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Back this Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {campaign.perks.map((perk, index) => (
                <PerkCard key={index} {...perk} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Campaign;
