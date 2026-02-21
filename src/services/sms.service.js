/**
 * SMS Service for sending OTP
 * Supports multiple SMS providers: Twilio, MSG91, Fast2SMS
 */

// SMS Provider Configuration
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console'; // 'twilio', 'msg91', 'fast2sms', 'console'

/**
 * Send OTP via SMS
 * @param {string} mobile - 10-digit mobile number
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<object>} - Success/failure response
 */
export const sendOTPSMS = async (mobile, otp) => {
  try {
    console.log(`📱 Sending OTP ${otp} to ${mobile} via ${SMS_PROVIDER}`);

    switch (SMS_PROVIDER) {
      case 'twilio':
        return await sendViaTwilio(mobile, otp);
      
      case 'msg91':
        return await sendViaMSG91(mobile, otp);
      
      case 'fast2sms':
        return await sendViaFast2SMS(mobile, otp);
      
      case 'console':
      default:
        return sendViaConsole(mobile, otp);
    }
  } catch (error) {
    console.error('❌ SMS Send Error:', error);
    return {
      success: false,
      message: 'Failed to send SMS',
      error: error.message
    };
  }
};

/**
 * Send OTP via Twilio
 */
async function sendViaTwilio(mobile, otp) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const twilio = require('twilio')(accountSid, authToken);
    
    const message = await twilio.messages.create({
      body: `Your Paaso OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      from: fromNumber,
      to: `+91${mobile}`
    });

    console.log('✅ Twilio SMS sent:', message.sid);
    
    return {
      success: true,
      provider: 'twilio',
      messageId: message.sid
    };
  } catch (error) {
    console.error('❌ Twilio Error:', error);
    throw error;
  }
}

/**
 * Send OTP via MSG91
 */
async function sendViaMSG91(mobile, otp) {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const senderId = process.env.MSG91_SENDER_ID || 'PAASOW';

    if (!authKey) {
      throw new Error('MSG91 credentials not configured');
    }

    const axios = require('axios');
    
    const response = await axios.get('https://api.msg91.com/api/v5/otp', {
      params: {
        authkey: authKey,
        mobile: mobile,
        otp: otp,
        template_id: templateId,
        sender: senderId
      }
    });

    console.log('✅ MSG91 SMS sent:', response.data);
    
    return {
      success: true,
      provider: 'msg91',
      response: response.data
    };
  } catch (error) {
    console.error('❌ MSG91 Error:', error);
    throw error;
  }
}

/**
 * Send OTP via Fast2SMS
 */
async function sendViaFast2SMS(mobile, otp) {
  try {
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      throw new Error('Fast2SMS credentials not configured');
    }

    const axios = require('axios');
    
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        sender_id: 'PAASOW',
        message: `Your Paaso OTP is ${otp}. Valid for 5 minutes.`,
        variables_values: otp,
        flash: 0,
        numbers: mobile
      },
      {
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Fast2SMS sent:', response.data);
    
    return {
      success: true,
      provider: 'fast2sms',
      response: response.data
    };
  } catch (error) {
    console.error('❌ Fast2SMS Error:', error);
    throw error;
  }
}

/**
 * Console logging (for development)
 * Shows OTP in console instead of sending SMS
 */
function sendViaConsole(mobile, otp) {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📱 SMS SIMULATION (Development Mode)');
  console.log('═══════════════════════════════════════');
  console.log(`To: +91${mobile}`);
  console.log(`OTP: ${otp}`);
  console.log(`Message: Your Paaso OTP is ${otp}`);
  console.log(`Valid for: 5 minutes`);
  console.log('═══════════════════════════════════════');
  console.log('');
  
  return {
    success: true,
    provider: 'console',
    message: 'OTP logged to console (development mode)'
  };
}

/**
 * Validate SMS provider configuration
 */
export const validateSMSConfig = () => {
  const provider = SMS_PROVIDER;
  
  switch (provider) {
    case 'twilio':
      return !!(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_PHONE_NUMBER
      );
    
    case 'msg91':
      return !!process.env.MSG91_AUTH_KEY;
    
    case 'fast2sms':
      return !!process.env.FAST2SMS_API_KEY;
    
    case 'console':
    default:
      return true;
  }
};

export default {
  sendOTPSMS,
  validateSMSConfig
};
