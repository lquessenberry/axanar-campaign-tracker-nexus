/**
 * 📌 Official Forum Threads
 * Pre-seeded threads for FAQ topics and official announcements
 * These threads should be created as pinned/official when setting up the forum
 */

export interface OfficialThread {
  id: string;
  category: string;
  title: string;
  emoji: string;
  isPinned: boolean;
  isOfficial: boolean;
  isLocked?: boolean;
  author: {
    username: string;
    rank: { name: string; min_points: number };
    badges: Array<{ label: string; icon: string }>;
    signatureText?: string;
  };
  initialPost: {
    content: string;
    timestamp: string;
  };
  expectedReplies?: string[]; // FAQ answers as follow-up posts
}

export const OFFICIAL_THREADS: OfficialThread[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANNOUNCEMENTS CATEGORY
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'official-welcome',
    category: 'announcements',
    title: '🖖 Welcome to the Axanar Forum!',
    emoji: '🖖',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Official', icon: '⭐' },
        { label: 'Production Team', icon: '🎬' },
        { label: 'Administrator', icon: '🛡️' }
      ],
      signatureText: '🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"'
    },
    initialPost: {
      content: `Welcome to the Axanar Community Forum! 🚀

This is your official community space to discuss all things Axanar, connect with fellow fans, and get the latest updates from the production team.

**What you'll find here:**
📢 Official announcements and production updates
💬 Fan discussions and theories about the Axanar universe
🎨 Fan art, creative works, and community projects
🖖 Star Trek universe conversations
💖 Supporter discussions and reward information
🎮 Off-topic fun and general chatter

**Forum Guidelines:**
✅ Be respectful and kind to fellow fleet members
✅ Use emojis to add personality (we have 90+ Trek-themed ones! :vulcan: :rocket:)
✅ Search before posting to avoid duplicates
✅ Keep discussions constructive and on-topic per category
✅ Contact moderators if you see issues

**Looking for Help?**
Check our pinned FAQ threads in each category! We've created official threads answering common questions about:
- Platform migration and account recovery
- Technical support
- Rewards and shipping
- General Axanar information

**Let's Build a Great Community!** 💫
This isn't just a forum—it's Starfleet Academy for Axanar fans. Let's make it the best fan community in the Alpha Quadrant!

🖖 Live Long and Prosper!
- Lee Quessenberry, Axanar Productions`,
      timestamp: new Date('2025-01-01T00:00:00Z').toISOString()
    }
  },

  {
    id: 'official-platform-migration',
    category: 'announcements',
    title: '📢 Platform Migration - What You Need to Know',
    emoji: '📢',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Official', icon: '⭐' },
        { label: 'Production Team', icon: '🎬' }
      ]
    },
    initialPost: {
      content: `**Important: Platform Migration Information** 🚀

We've migrated from our previous Laravel/Artisan platform to this new system. Here's what you need to know:

**Why We Migrated:**
Our old system had stability, security, and performance issues. This new platform provides:
- 🛡️ Better security and data protection
- ⚡ Improved performance and reliability
- 📱 Mobile-optimized experience
- 🔧 Modern features and better support

**For Existing Donors:**
✅ All your pledge history has been preserved
✅ Your reward entitlements are intact
✅ Shipping details were migrated
✅ You can recover your account using your original email

**Account Recovery Steps:**
1. Click "Login" → "Recover Account"
2. Enter your original donation email
3. Follow verification instructions
4. Set your new password
5. Verify your information is correct

**Need Help?**
- 📚 Full guide: Visit our [How It Works page](/how-it-works)
- ❓ Questions: Check the FAQ threads below
- 💬 Support: Contact us through the [Support page](/support)

**Thank you for your patience during this transition!** 🖖`,
      timestamp: new Date('2025-01-02T00:00:00Z').toISOString()
    }
  },

  {
    id: 'official-performance-cosmic-update',
    category: 'announcements',
    title: '🚀 Platform Update: Performance Boost & Cosmic UI Transformation',
    emoji: '🚀',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Official', icon: '⭐' },
        { label: 'Production Team', icon: '🎬' },
        { label: 'Administrator', icon: '🛡️' }
      ],
      signatureText: '🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"'
    },
    initialPost: {
      content: `**Major Platform Updates - Stardate 2025.321** 🌌

Greetings, Fleet! We've just completed a major platform upgrade that brings significant performance improvements and a stunning new visual experience. Here's what's new:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⚡ Chat System Performance Overhaul

We've completely rebuilt the messaging system for lightning-fast performance:

✅ **Database Optimizations**
- Messages now load 5-10x faster with smart SQL queries
- Pagination system loads 50 messages at a time (no more lag!)
- Efficient realtime updates (only new messages, not everything)

✅ **Frontend Speed Boost**
- Instant message sending with optimistic updates
- Smooth scrolling for long conversations
- Better state management with Zustand
- Auto-scroll to latest messages

**You'll notice:** Chat feels instant now. No more waiting for messages to load or update!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🌌 Cosmic Forum Transformation

The forum has received a stunning visual overhaul inspired by premium modern interfaces:

✨ **New Visual Features**
- Immersive cosmic/nebula gradient background
- Animated starfield that follows your mouse
- Three gorgeous themes: Dark, Light, and Nebula
- Smooth Framer Motion animations throughout
- Premium glassmorphism effects

✨ **Enhanced Thread Cards**
- Beautiful hover animations
- Gradient borders and cosmic styling
- Improved visual hierarchy
- Better mobile responsiveness

**You'll notice:** The forum now feels premium, futuristic, and incredibly smooth to navigate!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛡️ Security Improvements

Behind the scenes, we've hardened security:
- Fixed potential redirect vulnerabilities
- Enhanced input validation
- Better protection against phishing attempts

Your data and account remain secure!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🎯 What's Next?

We're continuing to improve the platform with upcoming features:
- LCARS "Subspace Relay Text" theme for chat
- More forum customization options
- Additional performance optimizations
- Mobile app enhancements

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💬 Feedback Welcome!

Try out the new features and let us know what you think! Report any issues or suggestions in this thread.

**Special thanks** to everyone for their patience and support as we continue improving this platform. Your feedback drives these enhancements!

🖖 Live Long and Prosper!
- The Axanar Platform Team`,
      timestamp: new Date('2025-01-20T05:00:00Z').toISOString()
    }
  },

  {
    id: 'official-missing-pledge-data',
    category: 'announcements',
    title: '🚨 Known Issue: Missing Pledge Data & Address Update Problems',
    emoji: '🚨',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Official', icon: '⭐' },
        { label: 'Production Team', icon: '🎬' },
        { label: 'Administrator', icon: '🛡️' }
      ],
      signatureText: '🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"'
    },
    initialPost: {
      content: `**Important Notice for Affected Users** 🚨

We're aware that some donors are experiencing issues accessing their complete pledge history and updating shipping addresses. **Your data is safe** - this is a migration issue we're actively resolving.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 What's Happening?

During our platform migration from the legacy system, some pledge records weren't fully transferred to the new database. This affects:

**Specific groups impacted:**
- Donors who contributed via **PayPal direct purchases** (not through Kickstarter/Indiegogo)
- Donors who made **label purchases** outside main campaigns
- Some **low-tier pledges** ($1-$9) from certain campaign periods

**What this means for you:**
- ❌ You can log in, but your pledge history appears empty
- ❌ You can't update your shipping address (no pledges linked = no address access)
- ❌ Your perks/rewards don't show up in your profile
- ❌ Your ambassadorial titles may be missing

**Your original data still exists** - it's in our source files, just not yet connected to your account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛒 What About Store Purchases?

**Important clarification:**

This platform currently handles **crowdfunding campaign pledges only** (Kickstarter, Indiegogo, direct campaign contributions).

**Axanar/Ares ecommerce store purchases are NOT yet included** in this migration phase. If you purchased items from our online stores:
- Those transactions are tracked in a separate system
- They are **not slated for migration at this time**
- We will announce when store purchase integration is planned

**Current Migration Roadmap:**
1. ✅ **Phase 1** (Complete): Kickstarter & Indiegogo campaign pledges
2. 🔄 **Phase 2** (In Progress): PayPal direct pledges & missing records restoration
3. ⏳ **Phase 3** (Next Priority): Patreon supporter integration
4. ⏳ **Phase 4** (Future): Ecommerce store purchase history integration

**If you're looking for store purchase records**, please hold tight - we'll have a plan for integrating those after we complete Patreon sync.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ Are You Affected?

**You're likely affected if:**
- You successfully logged in or recovered your account
- You made a **campaign pledge** (not a store purchase)
- Your profile shows "0 pledges" or "No contribution history"
- You can't find the "Update Shipping Address" button
- You remember pledging but see no record of it
- You pledged via PayPal directly (not campaign platforms)

**You're probably NOT affected if:**
- You can see your pledge history in your profile
- You can update your shipping address
- Your total pledged amount is displayed correctly
- Your perks/titles show up in your dashboard

**Not applicable to you if:**
- You only purchased from the Axanar/Ares stores (no crowdfunding pledges)
- You're a Patreon supporter only (integration coming in Phase 3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛠️ What We're Doing About It

Our admin team is actively working on **Phase 2** restoration:

1. **Data Restoration Tool** (in progress)
   - Re-importing missing pledge records from original source files
   - Matching PayPal donations to user accounts
   - Restoring physical reward entitlements

2. **Donor-Auth Linkage Verification** (ongoing)
   - Connecting legacy donor records to new authentication system
   - Ensuring all ~3,600+ donors have complete data access

3. **Address Update Function** (investigating)
   - Fixing the shipping address update workflow
   - Enabling address changes for all verified donors

**Next up after this:**
- Patreon supporter integration (Phase 3)
- Planning for store purchase history (Phase 4)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📞 What You Should Do

### If you're affected by missing campaign pledge data:

**Option 1: Use the Support Form**
1. Go to our [Support page](/support)
2. Select "Missing Pledge Data" or "Address Update Issue"
3. Include this information:
   - Email you used for original pledge
   - Campaign you supported (Prelude Kickstarter, Prelude PayPal, Indiegogo, etc.)
   - Approximate pledge amount
   - Whether you paid via PayPal, Kickstarter, or Indiegogo
   - Any order/transaction IDs you have

**Option 2: Reply to This Thread**
Post below with:
- "I'm affected" + your pledge email (if comfortable sharing publicly)
- Which campaign/platform you used
- Describe what you're seeing (or not seeing)

**DO NOT post:**
- Credit card numbers
- Passwords
- Full transaction details

**If you're a store customer or Patreon supporter:**
- Store purchases: Not yet scheduled for migration (Phase 4)
- Patreon: Integration coming in Phase 3 (after pledge restoration)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⏱️ Timeline & Expectations

**Current Status (Phase 2):**
- ✅ Issue identified and root cause understood
- 🔄 Data restoration tools being developed
- 🔄 Manual verification process active for reported cases
- ⏳ Estimated resolution: 1-2 weeks for most cases

**What happens next:**
1. You report your issue to support
2. Admin team manually verifies your pledge in source files
3. Your pledge data is restored and linked to your account
4. You receive confirmation email
5. You can then update shipping address and view perks

**Future phases:**
- Patreon integration timeline: TBD after Phase 2 completion
- Store purchase integration: TBD after Patreon sync

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🔒 Your Data Security

**Important reassurances:**
- ✅ Your original pledge data is **safe and preserved** in source files
- ✅ No financial information was lost
- ✅ Your rewards entitlements are documented
- ✅ This is a display/linkage issue, not a data loss issue

We maintain multiple backups of all donor information from:
- Kickstarter campaign exports
- Indiegogo campaign exports
- PayPal transaction records
- Legacy database archives

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 💬 Known Affected Users

If your email matches any of these patterns, you're **definitely** affected and should contact support:

- PayPal donors from 2014-2016 period
- "Label purchase" contributors (crowdfunding, not store)
- Certain $1-$9 tier backers from Indiegogo
- Anyone who got confirmation emails but sees no pledge history now

**Already reported cases we're working on:**
- Several cases being tracked and resolved privately

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ❓ FAQ

**Q: Will I lose my rewards/perks?**
**A:** No! Your rewards are tied to your original pledge data, which we have preserved. Once we restore your pledge records, all entitlements will be visible.

**Q: Can I just create a new account?**
**A:** No - that won't solve the issue. The problem is linking your existing pledge data to your current account. A new account would have the same problem.

**Q: Do I need to re-pledge?**
**A:** Absolutely not! Your original pledge is valid and recorded. This is just a technical migration issue.

**Q: What about my store purchases?**
**A:** Store purchases from Axanar/Ares ecommerce sites are not part of this migration phase. They're tracked separately and will be integrated in a future phase (after Patreon sync).

**Q: I'm a Patreon supporter - does this apply to me?**
**A:** Patreon integration is our next priority (Phase 3), coming after we complete pledge data restoration. Stay tuned for announcements!

**Q: How long will the address update issue last?**
**A:** Once your pledge data is restored (1-2 weeks), address updates will work normally. If you need urgent address changes for shipping, mention that in your support request.

**Q: Is this affecting everyone?**
**A:** No - most donors (~90%+) have complete data. This affects specific subgroups whose pledges came through non-standard channels or certain campaign periods.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🙏 Thank You for Your Patience

We understand this is frustrating, especially for donors who need to update shipping addresses. We're prioritizing this fix and working through cases as quickly as possible.

**Your support made Axanar possible**, and we're committed to ensuring every backer has full access to their pledge history and rewards.

We'll update this thread as we make progress on the restoration process and announce when we begin Patreon integration.

🖖 Live Long and Prosper!
- The Axanar Admin Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Thread will be updated with:**
- Progress reports on Phase 2 pledge restoration
- Number of cases resolved
- When the automated fix is deployed
- When address updates are fully functional
- Announcement of Phase 3 (Patreon) kickoff
- Plans for Phase 4 (store purchases)

*Last updated: Stardate 2025.027*`,
      timestamp: new Date('2025-01-27T08:00:00Z').toISOString()
    }
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SUPPORT CATEGORY - FAQ THREADS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'faq-about-axanar',
    category: 'support',
    title: '📚 FAQ: About the Axanar Project',
    emoji: '📚',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Administrator', icon: '🛡️' },
        { label: 'FAQ Guide', icon: '📖' }
      ],
      signatureText: '🖖 Lee Quessenberry - Axanar Productions\n━━━━━━━━━━━━━━━━━━━━━━━━\n"Live Long and Prosper"'
    },
    initialPost: {
      content: `**Frequently Asked Questions: About Axanar** 🚀

This thread covers common questions about the Axanar project itself. For account/technical issues, see other FAQ threads!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What is Axanar?** 🎬

Axanar takes place 21 years before the events of "Where no man has gone before", the first Star Trek episode, and tells the story of Garth of Izar and his crew during the Four Years War—the war with the Klingon Empire that almost tore the Federation apart. Garth was a legendary Starfleet captain who was the hero of the Battle of Axanar.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What's the current status of Axanar?** ⚡

Axanar Productions continues work on the Axanar series. For the most up-to-date information on current productions and releases, please:
- Visit our official website
- Follow our social media channels
- Check the Announcements category in this forum

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: How is Axanar funded?** 💰

Axanar is primarily funded through fan donations and crowdfunding campaigns. Our contributors are passionate about bringing high-quality, Star Trek-inspired content to life. This platform helps manage our crowdfunding initiatives and provide rewards to our generous supporters.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Who created Axanar?** 👥

Axanar was created by Alec Peters and a team of dedicated professionals from the film industry and Star Trek fan community. Many of our team members have worked on official Star Trek productions and other major film and television projects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Have more questions?** Drop them below! :vulcan: Our team and community are here to help!`,
      timestamp: new Date('2025-01-03T00:00:00Z').toISOString()
    }
  },

  {
    id: 'faq-account-recovery',
    category: 'support',
    title: '🔐 FAQ: Account Recovery & Access Issues',
    emoji: '🔐',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Administrator', icon: '🛠️' },
        { label: 'FAQ Guide', icon: '📖' }
      ]
    },
    initialPost: {
      content: `**Frequently Asked Questions: Account Recovery** 🔐

Having trouble accessing your account? This thread covers the most common account recovery questions!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: How do I recover my donor account?** 🔑

1. Click the "Login" button
2. Select "Recover Account"
3. Enter the email address you used for your original donation
4. You'll receive instructions to verify your identity
5. Set up a new password for the migrated platform

📚 **Detailed Guide:** Check our [How It Works page](/how-it-works) for step-by-step instructions with screenshots!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What if I can't remember my email?** 📧

If you can't remember which email you used or are having trouble:
1. Check old email accounts you may have used
2. Look for confirmation emails from previous campaigns
3. Contact our admin team through the [Support page](/support)
4. They can help verify your identity and assist with recovery

Our team is here to help! :rocket:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Can I create a new account?** ❓

Currently, this platform is **exclusively for existing donors** who previously supported Axanar projects. We are not accepting new registrations at this time. The platform's purpose is to help existing donors recover their accounts and update their information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Is my donation history preserved?** 💾

Yes! :check: We've migrated all donor information including:
- Your pledge history
- Reward entitlements
- Shipping details
- Contact information

**Please verify** this information after recovering your account to ensure everything is accurate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: I'm having trouble recovering my account. Help!** 🆘

First, make sure you're using the **correct email address** that you used for your original donation. If problems persist:

1. Try password reset again
2. Check spam/junk folders for emails
3. Clear browser cache and try again
4. Contact support via [Support page](/support)

**For personalized assistance:** Our admin team can manually verify your identity if automatic recovery isn't working.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Still stuck?** Reply to this thread with your question (don't include personal details!) and the community or support team will help! 🖖`,
      timestamp: new Date('2025-01-03T10:00:00Z').toISOString()
    }
  },

  {
    id: 'faq-technical-data',
    category: 'support',
    title: '⚙️ FAQ: Technical Support & Data Migration',
    emoji: '⚙️',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Administrator', icon: '💻' },
        { label: 'FAQ Guide', icon: '📖' }
      ]
    },
    initialPost: {
      content: `**Frequently Asked Questions: Technical Support** ⚙️

Technical questions about the platform? You're in the right place! :tricorder:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Is the new platform secure?** 🛡️

**Yes!** Our new platform implements modern security practices:
- 🔒 Better encryption than our previous system
- 🔐 Secure authentication methods
- 🔄 Regular security updates
- 📱 Industry-standard data protection

We've significantly improved security compared to the old Laravel/Artisan system.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Can I use this on mobile devices?** 📱

**Absolutely!** :phone: Our new platform is fully responsive and optimized for mobile:
- Works on smartphones and tablets
- Touch-friendly interface
- Mobile-optimized layouts
- All features accessible on mobile

You can recover your account, update information, and browse the forum from any device!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What data was migrated from the old system?** 💾

We migrated all essential donor information:
✅ Name and email
✅ Contact details
✅ Pledge history
✅ Reward entitlements
✅ Shipping preferences

**Note:** Some peripheral data (like old comment history) might not have transferred if it wasn't relevant to your donor status.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: How do I update my shipping address?** 📦

After recovering your account:
1. Log in to your profile
2. Navigate to Profile/Account settings
3. Update your shipping address
4. Save changes

**Important:** Having accurate shipping information is essential for us to deliver any physical rewards you're entitled to receive!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Having other technical issues?** Post below and we'll help troubleshoot! :wrench:

**Common fixes:**
- Clear browser cache
- Try a different browser
- Disable ad blockers temporarily
- Check for browser updates

Still having trouble? Contact [Support](/support) for direct assistance! 🚀`,
      timestamp: new Date('2025-01-03T12:00:00Z').toISOString()
    }
  },

  {
    id: 'faq-rewards-shipping',
    category: 'support',
    title: '🎁 FAQ: Rewards & Shipping Information',
    emoji: '🎁',
    isPinned: true,
    isOfficial: true,
    author: {
      username: 'lee',
      rank: { name: 'Fleet Admiral', min_points: 999999 },
      badges: [
        { label: 'Administrator', icon: '🎁' },
        { label: 'FAQ Guide', icon: '📖' }
      ]
    },
    initialPost: {
      content: `**Frequently Asked Questions: Rewards & Shipping** 🎁

Everything you need to know about your backer rewards!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What rewards am I entitled to?** 🏆

Your reward entitlements are based on your original pledge level. After recovering your account:
1. Log in to your dashboard
2. View your pledge history
3. See your entitled rewards listed

All reward information from the original campaign has been preserved! :check:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: When will rewards be shipped?** 📦

Shipping timelines vary by reward type and production schedules. For the most current information:
- Check your account dashboard
- Look for announcements in the forum
- Watch for email updates from the team

We'll notify all backers when rewards are ready to ship!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: How do I update my shipping address?** 📮

**Important:** Keep your address current!

1. Log into your account
2. Go to Profile → Address Information
3. Update your shipping address
4. Click Save

**Do this ASAP** if you've moved since your original pledge!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: What if my reward info looks wrong?** ⚠️

If you notice any discrepancies:
1. Check your original pledge confirmation emails
2. Compare with what's shown in your dashboard
3. Contact support via [Support page](/support) if there's an error
4. Include your pledge details in your message

We're here to make sure everything is correct! :vulcan:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Q: Digital vs Physical Rewards** 💿 vs 📦

**Digital rewards** (downloads, digital copies):
- Usually delivered via email or account download
- Check your dashboard for download links

**Physical rewards** (merchandise, physical media):
- Shipped to your registered address
- Tracking provided when available
- Keep your address updated!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**More questions about rewards?** Ask below! The community and team are here to help! 🚀`,
      timestamp: new Date('2025-01-03T14:00:00Z').toISOString()
    }
  }
];

// Helper function to get threads by category
export const getThreadsByCategory = (category: string) => {
  return OFFICIAL_THREADS.filter(thread => thread.category === category);
};

// Helper to get pinned threads
export const getPinnedThreads = () => {
  return OFFICIAL_THREADS.filter(thread => thread.isPinned);
};

// Helper to get official threads
export const getOfficialThreads = () => {
  return OFFICIAL_THREADS.filter(thread => thread.isOfficial);
};

export default OFFICIAL_THREADS;
