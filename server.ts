import express, { Request, Response } from "express";
import process from "node:process";
import { fromFileUrl } from "@std/path";
import { dirname } from "@std/path";
import path from "node:path";
import { PrismaClient } from "./generated/client.ts";
import accounts from "./accounts.json" with { type: "json"};
import session from "express-session";
import { authMiddleware } from "./auth.ts";



const __dirname = dirname(fromFileUrl(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET ||
            "your-secret-key-change-in-production",
        resave: false,
        saveUninitialized: false,
        name: "cookie_gt",
        cookie: {
            maxAge: 5 * 60 * 1000, // 5 minutes
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
        },
    }),
);

const prisma = new PrismaClient();


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

app.post("/cars/", authMiddleware, async (req: Request, res: Response) => {
	const { model, make, year} = req.body;
	if(!model || !make || !year){
	return res.status(404).json({error:"Model, Make & Year Are Required!"})
	};

	const newCar = await prisma.cars.create({
		data: {make, model, year: Number(year)}
	});
	res.status(201).json(newCar);
})

app.put("/cars/:id", authMiddleware, async (req: Request, res: Response) => {
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

app.patch("/cars/:id", authMiddleware, async (req: Request, res: Response) => {
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

app.delete("/cars/:id", authMiddleware, async (req: Request, res: Response) => {
	const id = parseInt(req.params.id);

	try {

		await prisma.cars.delete({where: { id }});
    	return res.status(204).send(); // No Content

	} catch {
		return res.status(404).json({ error: "Car not found" });
	}
});

app.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body;

    const account = accounts.find(
        (acc) => acc.username === username && acc.password === password,
    );

    if (account) {
        req.session.user = { username: account.username };
        return res.json({ message: "Login successful" });
    }

    res.status(401).json({ error: "Invalid credentials" });
});

app.get("/loginstatus", (req: Request, res: Response) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    res.json({ loggedIn: false });
});

app.get("/safe", (req: Request, res: Response) => {
    res.json({ message: "This is a safe route", user: req.session.user });
});

app.listen(port, () => {
	console.log(`JDMDealership-Server läuft auf http://localhost:${port}`);
});