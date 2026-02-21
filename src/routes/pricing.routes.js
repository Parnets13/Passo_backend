import express from 'express';
import { protect } from '../middleware/auth.js';
import Pricing from '../models/Pricing.js';

const router = express.Router();

// Public route to get subscription plans (NO AUTH REQUIRED)
router.get('/plans', async (req, res) => {
  try {
    console.log('💰 Fetching subscription plans');
    
    // Try to fetch from database first
    let plans = await Pricing.find({ type: 'Subscription', active: true }).sort({ order: 1 });
    
    // If no plans in database, use default plans
    if (!plans || plans.length === 0) {
      console.log('📦 Using default subscription plans');
      plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        monthlyPrice: 0,
        yearlyPrice: 0,
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
      },
      {
        id: 'starter',
        name: 'Starter',
        monthlyPrice: 499,
        yearlyPrice: 4990,
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
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 999,
        yearlyPrice: 9990,
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
      },
      {
        id: 'business',
        name: 'Business',
        monthlyPrice: 1999,
        yearlyPrice: 19990,
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
      },
    ];
    } else {
      console.log(`✅ Found ${plans.length} subscription plans in database`);
    }
    
    console.log('✅ Returning subscription plans');
    
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('❌ Get Plans Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans'
    });
  }
});

// Public route to get add-ons (NO AUTH REQUIRED)
router.get('/addons', async (req, res) => {
  try {
    console.log('⚡ Fetching add-ons');
    
    // Try to fetch from database first
    let addons = await Pricing.find({ 
      type: { $in: ['Addon', 'Badge'] }, 
      active: true 
    }).sort({ order: 1 });
    
    // If no addons in database, use default addons
    if (!addons || addons.length === 0) {
      console.log('📦 Using default add-ons');
      addons = [
      {
        id: 'featured_weekly',
        name: 'Featured Listing',
        description: 'Top placement for 7 days',
        price: 299,
        period: '/week',
        icon: 'star',
        color: '#f59e0b',
      },
      {
        id: 'featured_monthly',
        name: 'Featured Listing',
        description: 'Top placement for 30 days',
        price: 999,
        period: '/month',
        icon: 'star',
        color: '#f59e0b',
        savings: 'Save ₹197',
      },
      {
        id: 'verified_badge',
        name: 'Verified Badge',
        description: 'Build instant trust',
        price: 499,
        period: '/year',
        icon: 'shield-checkmark',
        color: '#10b981',
      },
      {
        id: 'trusted_pro',
        name: 'Trusted Pro Badge',
        description: 'Premium trust badge',
        price: 999,
        period: '/year',
        icon: 'ribbon',
        color: '#3b82f6',
      },
    ];
    } else {
      console.log(`✅ Found ${addons.length} add-ons in database`);
    }
    
    console.log('✅ Returning add-ons');
    
    res.json({
      success: true,
      addons
    });
  } catch (error) {
    console.error('❌ Get Add-ons Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch add-ons'
    });
  }
});

// Protected routes (Admin only)
router.use(protect);

// Get all pricing items (admin)
router.get('/all', async (req, res) => {
  try {
    const pricing = await Pricing.find().sort({ type: 1, order: 1 });
    res.json({
      success: true,
      pricing
    });
  } catch (error) {
    console.error('❌ Get All Pricing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pricing'
    });
  }
});

// Create new pricing item (admin)
router.post('/', async (req, res) => {
  try {
    const pricing = await Pricing.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Pricing item created successfully',
      pricing
    });
  } catch (error) {
    console.error('❌ Create Pricing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pricing item'
    });
  }
});

// Update pricing item (admin)
router.put('/:id', async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing item updated successfully',
      pricing
    });
  } catch (error) {
    console.error('❌ Update Pricing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pricing item'
    });
  }
});

// Delete pricing item (admin)
router.delete('/:id', async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);
    
    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Pricing item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete Pricing Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pricing item'
    });
  }
});

router.get('/', (req, res) => res.json({ success: true, message: 'Pricing routes' }));

export default router;
