const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const googleClient = new OAuth2Client();

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const getAllowedGoogleClientIds = () => (
    process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || ''
)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const isAllowedDomainEmail = (email) => {
    const allowed = (process.env.ALLOWED_EMAIL_DOMAIN || '').trim().toLowerCase();
    if (!allowed) return true; // if not configured, don't block
    const e = normalizeEmail(email);
    if (!e.includes('@')) return false;
    const domain = e.split('@').pop();
    return domain === allowed;
};

const buildAuthResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!isAllowedDomainEmail(email)) {
            return res.status(403).json({ message: `Only @${process.env.ALLOWED_EMAIL_DOMAIN} accounts are allowed` });
        }
        const user = await User.findOne({ email });
        if (user && !user.password) {
            return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
        }
        if (user && (await user.matchPassword(password))) {
            res.json(buildAuthResponse(user));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user (Admin or Teacher)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (!isAllowedDomainEmail(email)) {
            return res.status(403).json({ message: `Only @${process.env.ALLOWED_EMAIL_DOMAIN} accounts are allowed` });
        }
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Public signup should not be able to create Admin accounts.
        const safeRole = role === 'Admin' ? 'Teacher' : (role || 'Teacher');
        const user = await User.create({
            name,
            email: normalizeEmail(email),
            password,
            role: safeRole,
            authProvider: 'local',
        });
        if (user) {
            res.status(201).json(buildAuthResponse(user));
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate or register user with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuthUser = async (req, res) => {
    const { credential, role } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required' });
    }

    const allowedAudiences = getAllowedGoogleClientIds();
    if (allowedAudiences.length === 0) {
        return res.status(500).json({ message: 'Google sign-in is not configured on the server' });
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: allowedAudiences,
        });
        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified) {
            return res.status(400).json({ message: 'Google account email could not be verified' });
        }

        const normalizedEmail = normalizeEmail(payload.email);
        if (!isAllowedDomainEmail(normalizedEmail)) {
            return res.status(403).json({ message: `Only @${process.env.ALLOWED_EMAIL_DOMAIN} accounts are allowed` });
        }

        const safeRole = role === 'Admin' ? 'Teacher' : (role || 'Teacher');
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            user = await User.create({
                name: payload.name || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                role: safeRole,
                authProvider: 'google',
                googleId: payload.sub,
            });
        } else {
            user.name = user.name || payload.name || normalizedEmail.split('@')[0];
            user.googleId = user.googleId || payload.sub;

            if (user.authProvider === 'local') {
                user.authProvider = 'hybrid';
            } else {
                user.authProvider = 'google';
            }

            await user.save();
        }

        return res.json(buildAuthResponse(user));
    } catch (error) {
        return res.status(401).json({ message: 'Google sign-in failed', error: error.message });
    }
};

module.exports = { loginUser, registerUser, googleAuthUser };
