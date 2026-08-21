const bcrypt = require('bcrypt');
const prisma = require('./prisma/client');

async function main() {
  const hash = await bcrypt.hash('MyPassword123', 10);

  const user = await prisma.user.update({
    where: {
      email: 'abyu@gmail.com'
    },
    data: {
      passwordHash: hash,
      isActive: true
    }
  });

  console.log('Password updated for:', user.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });