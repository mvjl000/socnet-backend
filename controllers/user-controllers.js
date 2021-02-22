exports.login = (req, res, next) => {
  const { username, password } = req.body;

  res.json({ message: 'Loggin in', username: username });
};
