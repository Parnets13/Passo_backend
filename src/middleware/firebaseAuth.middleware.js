import { getFirebaseAdmin } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID token
 * Protects routes that require Firebase authentication
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token format'
      });
    }

    // Verify the ID token
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    console.log('✅ Firebase token verified');
    console.log('👤 User UID:', decodedToken.uid);
    console.log('📱 Phone Number:', decodedToken.phone_number);

    // Attach decoded token to request
    req.firebaseUser = {
      uid: decodedToken.uid,
      phoneNumber: decodedToken.phone_number,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('❌ Firebase token verification failed:', error);
    
    let errorMessage = 'Invalid or expired token';
    
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expired. Please login again';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Token revoked. Please login again';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Invalid token format';
    }

    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: error.code
    });
  }
};

/**
 * Optional Firebase auth middleware
 * Verifies token if present, but doesn't block if missing
 */
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      
      if (idToken) {
        const admin = getFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.firebaseUser = {
          uid: decodedToken.uid,
          phoneNumber: decodedToken.phone_number,
          email: decodedToken.email
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('⚠️ Optional Firebase auth failed:', error);
    // Continue without Firebase user
    next();
  }
};

export { verifyFirebaseToken, optionalFirebaseAuth };
