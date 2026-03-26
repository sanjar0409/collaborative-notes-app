function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    path: '/',
  });
}

module.exports = { setAuthCookie };
