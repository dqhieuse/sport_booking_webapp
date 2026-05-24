UPDATE users
SET password = CONCAT('{bcrypt}', password)
WHERE provider = 'LOCAL'
  AND password IS NOT NULL
  AND password NOT LIKE '{%';
