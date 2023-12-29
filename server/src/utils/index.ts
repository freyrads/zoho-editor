export function createRandomUserName() {
  const tokens =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

  let userName = '';

  const randomLength = Math.floor(Math.random() * 15) + 6;
  for (let i = 0; i < randomLength; i++) {
    userName += tokens[Math.floor(Math.random() * tokens.length)];
  }

  return userName;
}
