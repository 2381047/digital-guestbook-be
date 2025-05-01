// generate-hash.js
const bcrypt = require('bcrypt');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Anda bisa mengatur salt rounds sesuai yang Anda gunakan di app (default bcrypt biasanya 10)
const saltRounds = 10;

readline.question('Masukkan password untuk di-hash: ', async (password) => {
  if (!password) {
    console.error('Password tidak boleh kosong!');
    readline.close();
    process.exit(1);
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('\nPassword asli:', password); // Hanya untuk konfirmasi Anda
    console.log('Password Hash (untuk database):');
    console.log(hashedPassword); // <-- SALIN HASH INI
    console.log('\nSalt rounds:', saltRounds);
  } catch (err) {
    console.error('Error hashing password:', err);
  } finally {
    readline.close();
  }
});
