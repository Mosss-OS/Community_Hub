
const users = [
  { email: 'superadmin@wccrm.com', password: 'SuperAdmin@2025', role: 'Super Admin' },
  { email: 'admin@wccrm.com', password: 'Admin@2025', role: 'Admin' },
  { email: 'member@wccrm.com', password: 'Member@123', role: 'Member' },
  { email: 'pastor@wccrm.com', password: 'Pastor@123', role: 'Member' }
];

async function testLogins() {
  for (const user of users) {
    console.log(`\nTesting login for ${user.email}...`);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Login SUCCESS for ${user.email}`);
        console.log(`   Returned Role: ${data.role}`);
        console.log(`   isSuperAdmin: ${data.isSuperAdmin}`);
        console.log(`   isAdmin: ${data.isAdmin}`);
      } else {
        console.log(`❌ Login FAILED for ${user.email}: ${data.message || response.statusText}`);
      }
    } catch (err) {
      console.log(`❌ Error connecting to server for ${user.email}: ${err.message}`);
    }
  }
}

testLogins();
