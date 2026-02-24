import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// CMS Schema
const cmsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    unique: true,
    enum: ['terms', 'privacy', 'consent', 'about', 'help']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  version: {
    type: String,
    default: '1.0'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

const CMS = mongoose.model('CMS', cmsSchema);

// CMS Content Data
const cmsContent = [
  {
    type: 'help',
    title: 'Help & Support',
    content: JSON.stringify({
      supportMobile: '9876543210',
      supportEmail: 'support@paasowork.com',
      whatsappNumber: '9876543210',
      supportHours: 'Monday to Saturday, 9 AM - 6 PM',
      responseTime: 'Within 24 hours'
    }),
    version: '1.0'
  },
  {
    type: 'terms',
    title: 'Terms & Conditions',
    content: `
# Terms & Conditions

Welcome to PaasoWork! By using our platform, you agree to these terms.

## 1. Acceptance of Terms
By accessing and using PaasoWork, you accept and agree to be bound by these Terms and Conditions.

## 2. User Accounts
- You must provide accurate information during registration
- You are responsible for maintaining account security
- You must be at least 18 years old to use this service

## 3. Services
- PaasoWork connects workers with clients
- We do not guarantee job placements
- Payment terms are agreed between workers and clients

## 4. User Conduct
- Users must behave professionally
- No fraudulent activities allowed
- Respect other users' privacy

## 5. Payments
- All payments are processed securely
- Refund policy applies as per agreement
- Service fees may apply

## 6. Termination
We reserve the right to terminate accounts that violate these terms.

## 7. Contact
For questions, contact us at support@paasowork.com

Last Updated: January 2025
    `,
    version: '1.0'
  },
  {
    type: 'privacy',
    title: 'Privacy Policy',
    content: `
# Privacy Policy

Your privacy is important to us. This policy explains how we collect and use your data.

## Information We Collect
- Personal information (name, email, phone)
- Professional information (skills, experience)
- Location data
- Usage data

## How We Use Your Information
- To provide and improve our services
- To connect you with job opportunities
- To send notifications and updates
- To ensure platform security

## Data Sharing
- We do not sell your personal information
- Data is shared with clients only with your consent
- We may share data with service providers

## Your Rights
- Access your data
- Request data deletion
- Opt-out of marketing communications
- Download your data

## Security
We implement industry-standard security measures to protect your data.

## Contact
For privacy concerns, email us at privacy@paasowork.com

Last Updated: January 2025
    `,
    version: '1.0'
  },
  {
    type: 'about',
    title: 'About PaasoWork',
    content: `
# About PaasoWork

PaasoWork is India's leading platform connecting skilled workers with clients.

## Our Mission
To empower workers and simplify hiring by creating a trusted, efficient marketplace.

## What We Do
- Connect workers with job opportunities
- Verify worker credentials
- Facilitate secure payments
- Provide growth opportunities

## Our Values
- Trust & Transparency
- Quality Service
- Worker Empowerment
- Innovation

## Contact Us
Email: info@paasowork.com
Phone: +91 9876543210

© 2025 PaasoWork. All rights reserved.
    `,
    version: '1.0'
  },
  {
    type: 'consent',
    title: 'User Consent',
    content: `
# User Consent

By using PaasoWork, you consent to:

## Data Collection
- Collection of personal and professional information
- Location tracking for service area matching
- Usage analytics for platform improvement

## Communication
- Receiving notifications about jobs and updates
- Email and SMS communications
- Push notifications on mobile devices

## Data Sharing
- Sharing your profile with potential clients
- Displaying your information in search results
- Sharing reviews and ratings

## Terms Agreement
- You agree to our Terms & Conditions
- You agree to our Privacy Policy
- You agree to professional conduct standards

You can withdraw consent or modify preferences in Settings.

Last Updated: January 2025
    `,
    version: '1.0'
  }
];

// Seed function
async function seedCMSContent() {
  try {
    console.log('🌱 Starting CMS content seeding...');
    
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paasowork';
    console.log('📡 Connecting to MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing CMS content
    console.log('🗑️ Clearing existing CMS content...');
    await CMS.deleteMany({});
    console.log('✅ Existing content cleared');
    
    // Insert new content
    console.log('📝 Inserting CMS content...');
    for (const content of cmsContent) {
      await CMS.create(content);
      console.log(`✅ Created: ${content.type} - ${content.title}`);
    }
    
    console.log('🎉 CMS content seeding completed successfully!');
    console.log(`📊 Total content items: ${cmsContent.length}`);
    
    // Verify
    const count = await CMS.countDocuments();
    console.log(`✅ Verified: ${count} items in database`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
}

// Run seeding
seedCMSContent();
