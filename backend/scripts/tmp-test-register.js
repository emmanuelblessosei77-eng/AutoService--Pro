(async ()=>{
  try{
    const res = await fetch('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `devsignup_${Date.now()}@example.com`,
        password: 'Password123!',
        first_name: 'Dev',
        last_name: 'Signup'
      })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (e) {
    console.error('ERR', e);
  }
})();
