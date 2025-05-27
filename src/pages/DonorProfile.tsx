// Donor Profile Page for viewing and managing individual donor information
// cspell:ignore supabase,axanar
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Check, Calendar, ChevronRight, Clock, MapPin, Mail, User, Pencil, Edit, 
  ShoppingBag, Link as LinkIcon, UserPlus, Shield, DollarSign, Package
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Temporary imports until proper components are created
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

// Types
interface DonorProfile {
  id: string;
  full_name?: string;
  username?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  total_donated?: number; // Calculated field
  pledge_count?: number; // Calculated field
}

interface DonorAddress {
  id: string;
  donor_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for raw pledge data from Supabase
interface RawPledgeFromDB {
  id: string;
  amount: number;
  campaign_id: string;
  backer_id?: string;
  message?: string;
  anonymous?: boolean;
  created_at?: string;
  updated_at?: string; // Ensure this field is part of the raw data type
  pledge_status?: string; // Assuming this field might exist
  // Add any other fields that are directly on the pledges table from your DB schema
}

interface Pledge {
  id: string;
  amount: number;
  campaign_id: string;
  donor_id: string;
  backer_id?: string;   // This field is used instead of donor_id in some cases
  message?: string;     // Optional message with the pledge
  anonymous?: boolean;  // Whether the pledge is anonymous
  created_at?: string;
  updated_at?: string;
  pledge_status?: string; // Status of the pledge (completed, pending, etc.)
  // Joined data
  campaign?: {
    id: string;
    name?: string;
    title?: string;     // Some campaigns use title instead of name
  };
  perk?: {
    id: string;
    name?: string;
    title?: string;     // Some perks use title instead of name
    amount?: number;
    price?: number;     // Some perks use price instead of amount
  };
}

// Format currency values
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Format date values
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get initials from name
const getInitials = (fullName?: string) => {
  if (!fullName) return '?';
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return '?';
  
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  const firstInitial = parts[0].charAt(0);
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${firstInitial}${lastInitial}`.toUpperCase();
};

// Main component
const DonorProfile = () => {
  const { donorId } = useParams<{ donorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, donorProfile, refreshUserProfile } = useAuth();
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [addresses, setAddresses] = useState<DonorAddress[]>([]);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingAuthUser, setIsCreatingAuthUser] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<DonorAddress>>({});
  const [editedDonor, setEditedDonor] = useState<DonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!donorId) return;
    
    const fetchDonorData = async () => {
      setLoading(true);
      
      try {
        // Check if this is the user's own profile
        if (donorProfile?.id === donorId) {
          setIsOwnProfile(true);
        } else if (!isAdmin) {
          // If not admin and not viewing own profile, redirect to dashboard
          toast({
            title: "Access Denied",
            description: "You can only view your own donor profile.",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        // 1. Fetch donor profile
        const { data: donorData, error: donorError } = await supabase
          .from('donor_profiles')
          .select('*')
          .eq('id', donorId)
          .single();
          
        if (donorError) {
          console.error('Error fetching donor:', donorError);
          throw new Error('Could not find donor profile');
        }
        
        if (donorData) {
          // 2. Setup address data (placeholder for now)
          console.log('Fetched donor data:', donorData);
          
          // If this is the user's own profile, show a placeholder address
          // In a real system, we would fetch real addresses from a donor_addresses table
          if (donorId === donorProfile?.id) {
            const placeholderAddresses: DonorAddress[] = [
              {
                id: 'placeholder-1',
                donor_id: donorId,
                address_line1: '123 Starfleet HQ',
                address_line2: 'Suite 456',
                city: 'San Francisco',
                state_province: 'CA',
                postal_code: '94123',
                country: 'United States',
                is_primary: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ];
            setAddresses(placeholderAddresses);
          } else {
            // For other donors, just show an empty array of addresses
            setAddresses([]);
          }
          
          // 3. Fetch pledges for this donor
          try {
            // Fetch basic pledge data first - try with backer_id which might match donor_id
            const { data: pledgesData, error: pledgesError } = await supabase
              .from('pledges')
              .select('*')
              .eq('backer_id', donorId)
              .order('created_at', { ascending: false });
              
            console.log('Fetched pledges for donor:', donorId);
              
            if (pledgesError) {
              console.error('Error fetching pledges:', pledgesError);
              setPledges([]);
            } else if (pledgesData) {
              // Create array to hold processed pledges
              const processedPledges: Pledge[] = [];
              
              // Type pledgesData explicitly
              const typedPledgesData: RawPledgeFromDB[] = pledgesData || [];

              // Process each pledge
              for (const rawPledge of typedPledgesData) {
                // Get campaign info for this pledge
                const { data: campaignData } = await supabase
                  .from('campaigns')
                  .select('*')
                  .eq('id', rawPledge.campaign_id)
                  .single();
                
                // Create a processed pledge with all relevant data
                const processedPledge: Pledge = {
                  id: rawPledge.id,
                  // Use optional chaining and default values for safety
                  amount: Number(rawPledge?.amount || 0),
                  campaign_id: rawPledge?.campaign_id || '',
                  donor_id: donorId,
                  backer_id: rawPledge?.backer_id,
                  message: rawPledge?.message,
                  anonymous: Boolean(rawPledge?.anonymous),
                  created_at: rawPledge?.created_at,
                  // These might not exist in all records, so handle them safely
                  updated_at: rawPledge?.updated_at,
                  pledge_status: 'completed', // Default to completed
                  
                  // Add campaign info
                  campaign: campaignData ? {
                    id: campaignData.id,
                    title: campaignData.title,
                    name: campaignData.title || 'Unknown Campaign'
                  } : { id: 'unknown', name: 'Unknown Campaign' }
                };
                
                processedPledges.push(processedPledge);
              }
              
              setPledges(processedPledges);
              
              // 4. Calculate total donated
              const totalDonated = processedPledges.reduce((sum, pledge) => 
                sum + Number(pledge.amount || 0), 0);
              
              // Set donor with calculated fields
              setDonor({
                ...donorData,
                total_donated: totalDonated,
                pledge_count: pledgesData?.length || 0
              });
            }
          } catch (error) {
            console.error('Error in pledge fetch:', error);
            setPledges([]);
            
            // Set donor without calculated pledge data
            setDonor({
              ...donorData,
              total_donated: 0,
              pledge_count: 0
            });
          }
          
          // Split full name for editing if available
          setEditedDonor({
            ...donorData,
            full_name: donorData.full_name,
            username: donorData.username,
            email: donorData.email
          });
        }
      } catch (err) {
        console.error('Error in fetchDonorData:', err);
        toast({
          title: "Error",
          description: "Could not load donor information. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDonorData();
  }, [donorId, isAdmin, donorProfile, navigate, toast, refreshUserProfile]);

  // Function to link the current authenticated user with this donor profile
  const linkAuthUserToDonorProfile = async () => {
    try {
      // First, get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Not logged in',
          description: 'You must be logged in to link your account.',
          variant: 'destructive',
        });
        return;
      }

      // Then update the user's profile with this donor_profile_id
      const { error } = await supabase
        .from('profiles')
        .update({ donor_profile_id: donorId })
        .eq('id', user.id);

      if (error) {
        toast({
          title: 'Error linking accounts',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Accounts linked',
          description: `Your user account is now linked to donor profile: ${donor?.full_name || 'Unknown'}`,
        });
        
        // Refresh the auth context
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while linking accounts.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Handle edit form submission
  const handleSaveDonor = async () => {
    try {
      const { error } = await supabase
        .from('donor_profiles')
        .update(editedDonor)
        .eq('id', donorId);
        
      if (error) {
        console.error('Error updating donor:', error);
        throw new Error('Could not update donor information');
      }
      
      setDonor(editedDonor);
      setIsEditMode(false);
      
      toast({
        title: "Success",
        description: "Donor information updated successfully.",
      });
    } catch (err) {
      console.error('Error in handleSaveDonor:', err);
      toast({
        title: "Error",
        description: "Could not update donor information. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedDonor((prev: DonorProfile | null) => {
      if (!prev) return null; 
      // Ensure 'name' is a key of DonorProfile and handle type compatibility
      if (Object.prototype.hasOwnProperty.call(prev, name)) {
        // This assumes 'value' (string) is assignable to the property prev[name]
        // For more complex types, further casting or type guards might be needed.
        return { ...prev, [name]: value };
      }
      return prev; // If name is not a valid key, return previous state unchanged
    });
  };
  
  // Handle creating auth user
  const handleCreateAuthUser = async () => {
    if (!donor?.email) {
      toast({
        title: "Error",
        description: "Donor must have an email address to create an auth user.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Check if user already exists
      const { data: existingUser, error: existingUserError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', donor.email)
        .maybeSingle();
        
      if (existingUser) {
        toast({
          title: "User Already Exists",
          description: `Auth user already exists for ${donor.email}`,
          variant: "destructive"
        });
        return;
      }
      
      // Create user with a random password - they'll need to use password reset
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + '!1';
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: donor.email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          donor_profile_id: donorId,
          full_name: donor.full_name
        }
      });
      
      if (error) {
        console.error('Error creating auth user:', error);
        throw new Error('Could not create auth user');
      }
      
      // Send password reset email
      await supabase.auth.resetPasswordForEmail(donor.email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      toast({
        title: "Auth User Created",
        description: `User account created for ${donor.email}. A password reset email has been sent.`,
      });
    } catch (err) {
      console.error('Error in handleCreateAuthUser:', err);
      toast({
        title: "Error",
        description: "Could not create auth user. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if donor has an auth account
  const [hasAuthAccount, setHasAuthAccount] = useState(false);
  
  useEffect(() => {
    const checkAuthAccount = async () => {
      if (!donor?.email) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', donor.email)
          .maybeSingle();
          
        if (data) {
          setHasAuthAccount(true);
        }
      } catch (err) {
        console.error('Error checking auth account:', err);
      }
    };
    
    checkAuthAccount();
  }, [donor]);

  if (!donorId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Donor Not Found</CardTitle>
                <CardDescription>
                  No donor ID was provided.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Please return to the donor directory to select a donor profile.</p>
                <Button className="mt-4" asChild>
                  <Link to="/donor-directory">Back to Donor Directory</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link to="/donor-directory" className="text-sm text-muted-foreground hover:underline mb-2 inline-block">
                ← Back to Donor Directory
              </Link>
              <h1 className="text-3xl font-bold">
                {loading ? (
                  <Skeleton className="h-9 w-[250px]" />
                ) : (
                  donor?.full_name || 'Unnamed Donor'
                )}
              </h1>
              <p className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-5 w-[200px] mt-1" />
                ) : (
                  <>Donor ID: {donorId}</>
                )}
              </p>
            </div>
            
            <div className="flex gap-2">
              {(user && !donorProfile) && (
                <Button 
                  variant="outline" 
                  onClick={linkAuthUserToDonorProfile}
                  disabled={loading}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Link to My Account
                </Button>
              )}
              
              {isAdmin && donor?.email && !hasAuthAccount && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={loading}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Auth User
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Create Auth User</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create an authentication account for {donor?.email} and send them a password reset email.
                        Are you sure you want to continue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCreateAuthUser}>
                        Create User
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {isAdmin && donor?.email && hasAuthAccount && (
                <Button variant="outline" disabled>
                  <Shield className="mr-2 h-4 w-4" />
                  Auth User Exists
                </Button>
              )}
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid gap-6 md:grid-cols-12">
            {/* Left column - Profile info */}
            <div className="md:col-span-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Donor Information</CardTitle>
                  {!isEditMode && (
                    <CardDescription>
                      Contact details and basic information
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <div className="flex justify-center mb-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  ) : isEditMode ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input 
                            id="full_name" 
                            name="full_name" 
                            value={editedDonor?.full_name || ''} 
                            onChange={handleInputChange} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username" 
                            name="username" 
                            value={editedDonor?.username || ''} 
                            onChange={handleInputChange} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={editedDonor?.email || ''} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      

                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-6">
                        <Avatar className="h-24 w-24">
                          <AvatarFallback className="text-lg">
                            {getInitials(donor?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="space-y-4">
                        {donor?.full_name && (
                          <div className="flex items-center">
                            <User className="text-muted-foreground mr-3 h-5 w-5" />
                            <div>
                              <div className="font-medium">
                                {donor.full_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Full Name
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {donor?.email && (
                          <div className="flex items-center">
                            <Mail className="text-muted-foreground mr-3 h-5 w-5" />
                            <div>
                              <div className="font-medium">{donor.email}</div>
                              <div className="text-xs text-muted-foreground">
                                Email Address
                              </div>
                            </div>
                          </div>
                        )}

                        {donor?.created_at && (
                          <div className="flex items-center">
                            <Calendar className="text-muted-foreground mr-3 h-5 w-5" />
                            <div>
                              <div className="font-medium">
                                {formatDate(donor.created_at)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Donor Since
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                {isEditMode && (
                  <CardFooter className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
                    <Button variant="outline" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDonor}>
                      Save Changes
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {/* Donation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Donation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Donated</div>
                          <div className="text-2xl font-bold text-primary">{formatCurrency(donor?.total_donated)}</div>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                      </div>
                      
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="text-sm text-muted-foreground">Number of Pledges</div>
                          <div className="text-xl font-semibold">{donor?.pledge_count || 0}</div>
                        </div>
                        <div>
                          {donor?.pledge_count ? (
                            <Badge className="bg-green-500">Active Donor</Badge>
                          ) : (
                            <Badge variant="outline">No Pledges</Badge>
                          )}
                        </div>
                      </div>
                      
                      {donor?.pledge_count > 0 && (
                        <div className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="text-sm text-muted-foreground">Average Donation</div>
                            <div className="text-xl font-semibold">
                              {formatCurrency(donor.total_donated ? donor.total_donated / donor.pledge_count : 0)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Addresses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Addresses</CardTitle>
                    <CardDescription>
                      Shipping and billing addresses
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium">
                              {address.is_primary && (
                                <Badge className="mb-2" variant="outline">Primary</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex">
                            <MapPin className="text-muted-foreground mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                              {address.address_line1 && <div>{address.address_line1}</div>}
                              {address.address_line2 && <div>{address.address_line2}</div>}
                              <div>
                                {[
                                  address.city,
                                  address.state_province,
                                  address.postal_code
                                ].filter(Boolean).join(', ')}
                              </div>
                              {address.country && <div>{address.country}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No addresses found for this donor.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Pledges */}
            <div className="md:col-span-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Pledge History</CardTitle>
                  <CardDescription>
                    {pledges.length} pledge{pledges.length !== 1 ? 's' : ''} made by this donor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : pledges.length > 0 ? (
                    <div className="space-y-4">
                      {pledges.map((pledge) => (
                        <div key={pledge.id} className="p-4 border rounded-md">
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                            <div>
                              <div className="font-semibold">
                                {pledge.campaign?.name || 'Unknown Campaign'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {pledge.created_at ? formatDate(pledge.created_at) : 'Unknown date'}
                              </div>
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {formatCurrency(pledge.amount)}
                            </div>
                          </div>
                          
                          {pledge.perk && (
                            <div className="mt-2 flex items-start">
                              <Package className="text-muted-foreground mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-medium">{pledge.perk.name}</div>
                                {pledge.perk.amount && (
                                  <div className="text-sm text-muted-foreground">
                                    Perk value: {formatCurrency(pledge.perk.amount)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {pledge.pledge_status && (
                            <div className="mt-2">
                              <Badge className={`${
                                pledge.pledge_status === 'completed' ? 'bg-green-500' : 
                                pledge.pledge_status === 'pending' ? 'bg-yellow-500' : 
                                pledge.pledge_status === 'failed' ? 'bg-red-500' : 
                                'bg-gray-500'
                              }`}>
                                {pledge.pledge_status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No pledges found for this donor.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DonorProfile;
