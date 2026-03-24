import { PrismaClient } from "../generated/client.ts";

const prisma = new PrismaClient();

const cars = [
    { id: -1, model: "S2000", make: "Honda", year: 2003 },
    { id: -2, model: "350Z", make: "Nissan", year: 2006 },
    { id: -3, model: "RX-7 FD", make: "Mazda", year: 1999 },
    { id: -4, model: "Lancer Evo VI", make: "Mitsubishi", year: 2000 },
    { id: -5, model: "Civic EK9", make: "Honda", year: 1997 },
    { id: -6, model: "AE86", make: "Toyota", year: 1985 },
    { id: -7, model: "GT-R34", make: "Nissan", year: 2002 },
    { id: -8, model: "Silvia S13", make: "Nissan", year: 1990 },
    { id: -9, model: "Impreza WRX STi", make: "Subaru", year: 1999 },
    { id: -10, model: "MR2", make: "Toyota", year: 1994 }
];

async function main() {
  console.log("Remove old testdata...");

  const result = await prisma.cars.deleteMany({
    where: {
      id: { lt: 0 },
    },
  });
  console.log(`Deleted ${result.count} cars with negative id`);

  console.log("Start seeding...");

  for (const car of cars) {
    await prisma.cars.create({
      data: car,
    });
    console.log(`Created car with id: ${car.id}`);
  }

  console.log("Seeding finished.");
}

try {
    await main();
}
catch (e) {
    console.error(e);
    Deno.exit(1);
}
finally {
    await prisma.$disconnect();
}