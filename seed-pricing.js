import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pricing from './src/models/Pricing.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paasowork';

const subscriptionPlans = [
  {
    type: 'Subscription',
    id: 'free',
    name: 'Free',
    description: 'Basic features to get started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    price: 0,
    period: 'Forever',
    color: '#6b7280',
    icon: 'gift-outline',
    features: [
      { text: 'Basic profile listing', included: true },
      { text: 'Standard search visibility', included: true },
      { text: 'Up to 5 profile views/day', included: true },
      { text: 'Basic support', included: true },
      { text: 'Featured listing', included: false },
      { text: 'Priority placement', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'Lead insights', included: false },
    ],
    popular: false,
    active: true,
    order: 1
  },
  {
    type: 'Subscription',
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for growing professionals',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    price: 499,
    period: '/month',
    color: '#f59e0b',
    icon: 'rocket-outline',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited profile views', included: true },
      { text: 'Higher search ranking', included: true },
      { text: '2x visibility boost', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Featured listing', included: false },
      { text: 'Advanced insights', included: false },
    ],
    popular: true,
    active: true,
    order: 2
  },
  {
    type: 'Subscription',
    id: 'pro',
    name: 'Pro',
    description: 'For serious professionals',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    price: 999,
    period: '/month',
    color: '#10b981',
    icon: 'star-outline',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Featured listing (weekly)', included: true },
      { text: 'Top search placement', included: true },
      { text: '5x visibility boost', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Lead insights & tracking', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Verified badge discount', included: true },
    ],
    popular: false,
    active: true,
    order: 3
  },
  {
    type: 'Subscription',
    id: 'business',
    name: 'Business',
    description: 'For teams and agencies',
    monthlyPrice: 1999,
    yearlyPrice: 19990,
    price: 1999,
    period: '/month',
    color: '#3b82f6',
    icon: 'diamond-outline',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Premium featured listing', included: true },
      { text: 'Guaranteed top 3 placement', included: true },
      { text: '10x visibility boost', included: true },
      { text: 'Full analytics suite', included: true },
      { text: 'Team management tools', included: true },
      { text: 'Free verified badge', included: true },
      { text: '24/7 priority support', included: true },
    ],
    popular: false,
    active: true,
    order: 4
  }
];

const addons = [
  {
    type: 'Addon',
    id: 'featured_weekly',
    name: 'Featured Listing',
    description: 'Top placement for 7 days',
    price: 299,
    period: '/week',
    icon: 'star',
    color: '#f59e0b',
    active: true,
    order: 1
  },
  {
    type: 'Addon',
    id: 'featured_monthly',
    name: 'Featured Listing',
    description: 'Top placement for 30 days',
    price: 999,
    period: '/month',
    icon: 'star',
    color: '#f59e0b',
    savings: 'Save ₹197',
    active: true,
    order: 2
  },
  {
    type: 'Badge',
    id: 'verified_badge',
    name: 'Verified Badge',
    description: 'Build instant trust with customers',
    price: 499,
    period: '/year',
    icon: 'shield-checkmark',
    color: '#10b981',
    requirements: ['Aadhaar Card', 'Phone Verification'],
    benefits: [
      'Verified badge on profile',
      '2x more customer trust',
      'Higher search ranking',
      'Priority in listings'
    ],
    active: true,
    order: 3
  },
  {
    type: 'Badge',
    id: 'trusted_pro',
    name: 'Trusted Pro',
    description: 'Premium trust badge for professionals',
    price: 999,
    period: '/year',
    icon: 'ribbon',
    color: '#3b82f6',
    requirements: ['Basic Verification', 'Driving License', 'Work History'],
    benefits: [
      'Premium trust badge',
      '5x more visibility',
      'Featured in "Trusted" section',
      'Dedicated support'
    ],
    active: true,
    order: 4
  },
  {
    type: 'Badge',
    id: 'business_verified',
    name: 'Business Verified',
    description: 'For registered businesses',
    price: 1499,
    period: '/year',
    icon: 'business',
    color: '#f59e0b',
    requirements: ['GST Certificate', 'Business License', 'Address Proof'],
    benefits: [
      'Business verified badge',
      'Corporate client access',
      'Bulk order priority',
      'Invoice generation'
    ],
    active: true,
    order: 5
  }
];

async function seedPricing() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing pricing data...');
    await Pricing.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('📦 Seeding subscription plans...');
    await Pricing.insertMany(subscriptionPlans);
    console.log(`✅ Seeded ${subscriptionPlans.length} subscription plans`);

    console.log('⚡ Seeding add-ons and badges...');
    await Pricing.insertMany(addons);
    console.log(`✅ Seeded ${addons.length} add-ons and badges`);

    console.log('');
    console.log('🎉 Pricing data seeded successfully!');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${subscriptionPlans.length} Subscription Plans`);
    console.log(`  - ${addons.filter(a => a.type === 'Addon').length} Add-ons`);
    console.log(`  - ${addons.filter(a => a.type === 'Badge').length} Badges`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing data:', error);
    process.exit(1);
  }
}

seedPricing();
