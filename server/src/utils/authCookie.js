function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    path: '/',
  });
}

module.exports = { setAuthCookie };
