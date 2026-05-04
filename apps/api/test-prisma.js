const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) return console.log('no tenant');
    
    const detail = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      include: {
        products: {
          include: {
            options: {
              include: { values: true }
            },
            variants: {
              include: {
                image: true,
                options: {
                  include: {
                    option: { select: { name: true } },
                    value: { select: { value: true } }
                  }
                }
              }
            }
          }
        }
      }
    });
    console.log('Success');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
