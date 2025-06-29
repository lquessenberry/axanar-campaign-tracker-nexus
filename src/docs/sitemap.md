# Axanar Campaign Tracker - Sitemap Documentation

This document outlines the complete sitemap of the Axanar Campaign Tracker platform, including navigation paths and access permissions based on user roles.

## User Roles

The platform has three primary user roles:

1. **Unauthorized Users** - Visitors who haven't logged in
2. **Donors** - Authenticated users who can make pledges and access donor features
3. **Administrators** - Users with administrative privileges

## Pages Overview

### Public Pages (All Users)

These pages are accessible to all visitors, regardless of authentication status:

- **Home** (`/`) - Landing page with HeroSection and donor benefits information
- **About** (`/about`) - Information about Axanar and the platform
- **How It Works** (`/how-it-works`) - Explanation of the crowdfunding process
- **Campaigns** (`/campaigns`) - List of all available campaigns
- **Campaign Details** (`/campaign/:id`) - Detailed view of a specific campaign
- **FAQ** (`/faq`) - Frequently asked questions
- **Support** (`/support`) - Contact form and support information
- **Terms of Service** (`/terms`) - Legal terms of use
- **Privacy Policy** (`/privacy`) - Privacy policy information
- **Authentication Pages**:
  - **Auth** (`/auth`) - Combined authentication page
  - **Login** (`/login`) - Login page
  - **Register** (`/register`) - Registration page
- **Not Found** (`*`) - 404 page for any undefined routes

### Donor Pages (Authenticated Users)

In addition to public pages, authenticated donors can access:

- **Dashboard** (`/dashboard`) - Donor's personal dashboard with pledges, rewards, and updates
- **Profile** (`/profile`) - User profile management

### Admin Pages (Admin Users)

In addition to all donor pages, administrators can access:

- **Admin Portal** (`/admin`) - Admin landing page
- **Admin Dashboard** (`/admin/dashboard`) - Administrative dashboard with overview metrics
- **Pledges Management** (`/admin/pledges`) - Manage all pledges
- **Rewards Management** (`/admin/rewards`) - Manage campaign rewards
- **Donors Management** (`/admin/donors`) - Manage donor information
- **Admin Management** (`/admin/admins`) - Manage administrator accounts

## Navigation Structure

### Main Navigation

**Unauthorized Users**:

- Home
- About
- How It Works
- Campaigns
- Login/Register buttons

**Donors**:

- Home
- About
- How It Works
- Campaigns
- Dashboard
- Profile dropdown (contains Profile, Logout)

**Administrators**:

- Home
- About
- How It Works
- Campaigns
- Dashboard
- Admin dropdown (contains Admin Portal, Admin Dashboard, etc.)
- Profile dropdown (contains Profile, Logout)

### Footer Navigation

The footer contains links accessible to all user types:

- FAQ
- Support
- Terms of Service
- Privacy Policy
- Social media links

## Access Control Logic

1. **Public Routes**:
   - No authentication required
   - Redirect authenticated users from login/register to dashboard

2. **Donor Routes**:
   - Require authentication
   - Redirect unauthorized users to login page
   - Available to both donors and administrators

3. **Admin Routes**:
   - Require authentication with admin role
   - Redirect non-admin users to dashboard or home page
   - Check user.isAdmin property

## Typical User Flows

### Unauthorized User Flow

1. Land on Home page
2. Browse Campaigns
3. View individual Campaign details
4. Register/Login to make a pledge

### Donor Flow

1. Login
2. View Dashboard
3. Browse Campaigns
4. Make Pledges
5. View/Update Profile

### Admin Flow

1. Login
2. Access Admin Dashboard
3. Manage Pledges/Donors/Rewards
4. Administrate other aspects of the platform

## Navigation Components

The primary navigation components are:

1. **Navigation.tsx** - Main navigation bar with conditional rendering based on auth status
2. **Footer.tsx** - Footer with supplementary links
3. **ThumbMenu.tsx** - Additional mobile navigation options

Each of these components should check the user's authentication status and role to display appropriate navigation options.
