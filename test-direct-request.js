// Test if we can make a direct request to ccflare
const response = await fetch('http://localhost:8080/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 10,
    messages: [{role: 'user', content: 'test from monorepo directory'}]
  })
});

console.log('Status:', response.status);
console.log('Response:', await response.text());