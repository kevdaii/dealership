import express, { Request, Response } from "express";
import process from "node:process";
import { fromFileUrl } from "@std/path";
import { dirname } from "@std/path";
import path from "node:path";

const __dirname = dirname(fromFileUrl(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// Hardcoded Cars DB json
const cars = [
  { id: 1, model: "S2000", make: "Honda", year: 2003 },
  { id: 2, model: "350Z", make: "Nissan", year: 2006 },
  { id: 3, model: "RX-7 FD", make: "Mazda", year: 1999 }
];

app.get("/cars", (_req: Request, res: Response) => {
  res.json(cars);
});

app.get("/cars/:id", (req: Request, res: Response) => {

	const searchId = parseInt(req.params.id); 
	const findCar = cars.find(car => car.id === searchId); 

	if(!findCar){
	return res.status(404).json({error:"Car not found"}); 
	};

res.json(findCar);

});

app.post("/cars/", (req: Request, res: Response) => {
	const { model, make, year} = req.body;
	if(!model || !make || !year){
	return res.status(404).json({error:"Model, Make & Year Are Required!"})
	};
	const newId = cars.length > 0 ? cars[cars.length - 1].id + 1 : 1;
	const newCar = {
		id: newId,
		model: model,
		make: make,
		year: year
	}
	cars.push(newCar);
	res.status(201).json(newCar);
    // test in terminal
    // curl -X POST http://localhost:3000/cars/ -H "Content-Type:application/json" -d '{"model":"BRZ","make":"Subaru","year":"2023"}'
})

app.put("/cars/:id", (req: Request, res: Response) => {
	const { model, make, year} = req.body;
	if(!model || !make || !year){
	return res.status(404).json({error:"Model, Make & Year Are Required!"})
	};
	
	const searchId = parseInt(req.params.id);
	const pos = cars.findIndex(car => car.id === searchId);
	if(pos <= -1){
		return res.status(404).json({error: "Car not found!"})
	}
	
	cars[pos] = {
		id: searchId,
		model: model,
		make: make,
		year: year
	}
	res.json(cars[pos]); // gibt eine json datei über
    //curl -X PUT http://localhost:3000/cars/1 -H "Content-Type:application/json" -d '{"model":"Supra MK4","make":"Toyota","year":1998}'
});

 app.patch("/cars/:id", (req: Request, res: Response) => {
	const searchId = parseInt(req.params.id);
	const {make, model, year} = req.body;
	const car = cars.find(car => car.id === searchId);
	
	if(!car){
	return res.status(404).json({error: "Car not found!"})
	}
	
	if(make !== undefined) car.make = make;
	if(model !== undefined) car.model = model;
	if(year !== undefined) car.year = year;
	
	res.json(car);

    //curl -X PATCH http://localhost:3000/cars/3 -H "Content-Type:application/json" -d '{"model":"RX-7 FC","year":1991}'
})

app.delete("/cars/:id", (req: Request, res: Response) => {
	const id = parseInt(req.params.id);
	const pos = cars.findIndex(c => c.id === id);
	
	if(pos === -1){
		return res.status(404).json({error: "Car not found"});
	}

	cars.splice(pos, 1);
	return res.status(204).send();
    //curl -X DELETE http://localhost:3000/cars/3 -H "Content-Type:application/json"
});

// Den Server starten
app.listen(port, () => {
  console.log(`JDMDealership-Server läuft auf http://localhost:${port}`);
});