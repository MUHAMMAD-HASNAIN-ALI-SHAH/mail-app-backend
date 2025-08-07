function validateUsername(username) {
  if (typeof username !== 'string') {
    return 'Username must be a string.';
  }
  if (username.length < 3) {
    return 'Username must be at least 3 characters long.';
  }
  if (username.length > 30) {
    return 'Username must be at most 30 characters long.';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password must be a string.';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (password.length > 100) {
    return 'Password must be at most 100 characters long.';
  }
  return null;
}


export { validateUsername, validatePassword };
