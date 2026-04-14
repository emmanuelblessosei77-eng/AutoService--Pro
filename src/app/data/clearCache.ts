// Clear all stored bookings and dashboard data
const keys = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('dashboard_') || key.includes('booking') || key.includes('cache'))) {
    keys.push(key);
  }
}

console.log('Clearing localStorage keys:\n');
keys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`  ✅ Deleted: ${key}`);
});

console.log(`\n✅ Cleared ${keys.length} items from localStorage`);
console.log('\n💡 Refresh your browser to load fresh data from API');
