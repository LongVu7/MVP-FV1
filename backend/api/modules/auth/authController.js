const passport = require('passport');
const jwt = require('jsonwebtoken');

// ─── Login
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, account, info) => {
    if (err) {
      return res.status(500).json({
        error: 'Authentication error',
        details: err.message
      });
    }


    if (!account) {
      return res.status(401).json({
        error: info?.message || 'Invalid credentials'
      });
    }

    const payload = {
      id: account.id,
      email: account.email,
      roleName: account.role?.name || null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '45m'
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 45 * 60 * 1000 // 45 minutes
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        roleName: account.role?.name || null
      }
    });
  })(req, res, next);
};

// ─── Logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// ─── Get current user
const getMe = (req, res) => {
  res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      roleName: req.user.roleName
    }
  });
};

module.exports = { login, logout, getMe };
