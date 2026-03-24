import express, { Request, Response } from "express";
import process from "node:process";
import { fromFileUrl } from "@std/path";
import { dirname } from "@std/path";
import path from "node:path";
import { PrismaClient } from "./generated/client.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const prisma = new PrismaClient();

const cars = await prisma.cars.findMany();

app.get("/cars", async (_req: Request, res: Response) => {
	const cars = await prisma.cars.findMany();
  	res.json(cars);
});

app.get("/cars/:id", async (req: Request, res: Response) => {

	const id = parseInt(req.params.id); 
	const car = await prisma.cars.findUnique({
		where: { id },
	}); 

	if(!car){
	return res.status(404).json({error:"Car not found"}); 
	};

res.json(car);

});

app.post("/cars/", async (req: Request, res: Response) => {
	const { model, make, year} = req.body;
	if(!model || !make || !year){
	return res.status(404).json({error:"Model, Make & Year Are Required!"})
	};

	const newCar = await prisma.cars.create({
		data: {make, model, year}
	});
	res.status(201).json(newCar);
})

app.put("/cars/:id", async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	const { model, make, year} = req.body;
	if(!model || !make || !year){
	return res.status(404).json({error:"Model, Make & Year Are Required!"})
	};
	
	try {
		const updatedCar = await prisma.cars.update({where: { id }, data: { make, model, year: Number(year)}});
		res.json(updatedCar);
	} catch {
    return res.status(404).json({ error: "Car not found" });
	}
});

app.patch("/cars/:id", async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	const {make, model, year} = req.body;

	const data: { make?: string; model?: string , year?: number} = {};

	if (make !== undefined) data.make = make;
	if (model !== undefined) data.model = model;
	if (year !== undefined) data.year = Number(year);

	try {
		const updatedCar = await prisma.cars.update({where: { id }, data});

    	res.json(updatedCar);
	} catch {
		return res.status(404).json({ error: "Car not found" });
	}
});

app.delete("/cars/:id", async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	try {

		await prisma.cars.delete({where: { id }});
    	return res.status(204).send(); // No Content

	} catch {
		return res.status(404).json({ error: "Car not found" });
	}
});

app.listen(port, () => {
  console.log(`JDMDealership-Server läuft auf http://localhost:${port}`);
});