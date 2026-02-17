import express from 'express';
import { protect } from '../middleware/auth.js';
import CMS from '../models/CMS.js';

const router = express.Router();

// Public route to get CMS content (no auth required)
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    console.log('📄 Fetching CMS content for type:', type);
    
    // Validate type
    const validTypes = ['terms', 'privacy', 'consent', 'about', 'help'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CMS type'
      });
    }
    
    const content = await CMS.findOne({ type });
    
    if (!content) {
      // Return default content if not found
      return res.json({
        success: true,
        content: {
          type,
          title: getDefaultTitle(type),
          content: getDefaultContent(type),
          version: '1.0'
        }
      });
    }
    
    console.log('✅ CMS content found');
    
    res.json({
      success: true,
      content: {
        type: content.type,
        title: content.title,
        content: content.content,
        version: content.version,
        updatedAt: content.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Get CMS Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content'
    });
  }
});

// Protected route to update CMS content (admin only)
router.put('/:type', protect, async (req, res) => {
  try {
    const { type } = req.params;
    const { title, content, version } = req.body;
    
    const cmsContent = await CMS.findOneAndUpdate(
      { type },
      { 
        title, 
        content, 
        version,
        lastUpdatedBy: req.admin.id 
      },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Content updated successfully',
      content: cmsContent
    });
  } catch (error) {
    console.error('❌ Update CMS Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content'
    });
  }
});

// Helper functions for default content
function getDefaultTitle(type) {
  const titles = {
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    consent: 'User Consent',
    about: 'About Us',
    help: 'Help & Support'
  };
  return titles[type] || 'Content';
}

function getDefaultContent(type) {
  const contents = {
    terms: 'Terms and conditions content will be available soon.',
    privacy: 'Privacy policy content will be available soon.',
    consent: 'User consent information will be available soon.',
    about: 'About us content will be available soon.',
    help: 'Help and support information will be available soon.'
  };
  return contents[type] || 'Content not available';
}

export default router;
