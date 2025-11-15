import bcrypt from 'bcrypt';

const password = 'aiagent123';
const hash = bcrypt.hashSync(password, 10);

console.log('New password hash for aiagent123:');
console.log(hash);
console.log('\nUpdate SQL:');
console.log(`UPDATE whatsfresh.users SET password = '${hash}' WHERE email IN ('claude.ai-agent@test.com', 'kiro.ai-agent@test.com');`);
