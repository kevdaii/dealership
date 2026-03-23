let editingId = null;

async function fetchCars() {
    const statusEl = document.getElementById("status");
    const tbody = document.querySelector("#buecher-table tbody");

    try {
        statusEl.textContent = "Status: Loading Data...";
        const response = await fetch("/cars");
        if (!response.ok) {
            throw new Error(`HTTP Fehler: ${response.status}`);
        }
        const cars = await response.json();
        // Die Tabelle im HTML komplett leeren, bevor wir sie neu befüllen
        tbody.innerHTML = "";

        // 5. Mit einer Schleife durch jedes Auto im Array gehen
        for (const car of cars) {
            const tr = document.createElement("tr");
            const tdId = document.createElement("td");
            tdId.textContent = car.id;
            
            const tdMake = document.createElement("td");
            const tdModel = document.createElement("td");
            const tdYear = document.createElement("td");
            const tdActions = document.createElement("td");
            
            if(editingId === car.id){
                // Edit Mode
                const makeInput = document.createElement("input");
                makeInput.type = "text";
                makeInput.value = car.make;
                makeInput.className = "input-sm";

                const modelInput = document.createElement("input");
                modelInput.type = "text";
                modelInput.value = car.model;
                modelInput.className = "input-sm";

                const yearInput = document.createElement("input");
                yearInput.type = "number";
                yearInput.value = parseInt(car.year);
                yearInput.className = "input-sm";

                tdMake.appendChild(makeInput);
                tdModel.appendChild(modelInput);
                tdYear.appendChild(yearInput);

                const confirmBtn = document.createElement("button");
                confirmBtn.textContent = "Confirm";
                confirmBtn.className = "confirm-btn";
                confirmBtn.onclick = async () => {
                    if(!makeInput.value.trim() || !modelInput.value.trim() || !yearInput){
                        document.getElementById("status").textContent = "Status: Make, Model & Year are required!";
                        return;
                    }else{
                        await updateCar(car.id, {
                        make: makeInput.value.trim(),
                        model: modelInput.value.trimEnd(),
                        year: parseInt(yearInput)});
                        editingId = null;
                        await fetchCars();
                    }
                };

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.className = "cancel-btn";
                cancelBtn.onclick = async () => {
                    editingId = null;
                    await fetchCars();
                };

                tdActions.append(confirmBtn, " ", cancelBtn);

                } else {
                    // View mode
                    tdMake.textContent = car.make;
                    tdModel.textContent = car.model;
                    tdYear.textContent = car.year;

                    // Delete Button
                    const delBtn = document.createElement("button");
                    delBtn.textContent = "Delete";
                    delBtn.className = "delete-btn";
                    delBtn.onclick = async () => {
                        if (!confirm(`Remove car ${car.make} ${car.model}?`)) return;
                            await deleteCar(car.id);
                            await fetchCars();
                    };

                    const editBtn = document.createElement("button");
                    editBtn.textContent = "Edit";
                    editBtn.className = "edit-btn";
                    editBtn.onclick = async () => {
                        editingId = car.id;
                        await fetchCars();
                    }
                    
                    tdActions.append(delBtn, " ", editBtn);
                }
            // Alle Zellen an die Zeile anhängen
            tr.append(tdId, tdMake, tdModel, tdYear, tdActions);
            // Die fertige Zeile in den Tabellenkörper (tbody) des HTML-Dokuments einfügen
            tbody.appendChild(tr);
        }
        // Erfolgsmeldung anzeigen
        statusEl.textContent = `Status: ${cars.length} Cars successfully loaded.`;
    
    } catch (error) {
        // Falls der Server nicht erreichbar ist oder ein Fehler auftrat
        console.error(error);
        statusEl.textContent = "Error while loading the data.";
    }
}

async function addClick() {
    const makeInput = document.getElementById("car-make");
    const make = makeInput.value.trim();
    const modelInput = document.getElementById("car-model");
    const model = modelInput.value.trim();
    const yearInput = document.getElementById("car-year");
    const year = parseInt(yearInput.value);
    const button = document.getElementById("add-btn");
    const statusEl = document.getElementById("status");

    if (!make || !model || !year) {
      statusEl.textContent = "Make, Model and Year are required.";
      return;
    }

    button.disabled = true;
    await addCar(make, model, year);
    button.disabled = false;

    makeInput.value = "";
    modelInput.value = "";
    yearInput.value = "";
    makeInput.focus();
}

async function addCar(make, model, year) {
    const statusEl = document.getElementById("status");
    try {
        const res = await fetch("/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ make, model, year}),
    });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await fetchCars();
        statusEl.textContent = "Car added.";
    } catch (err) {
        console.error(err);
        statusEl.textContent = `Error while adding a car: ${err.message}`;
    }
}

async function deleteCar(id) {
    const statusEl = document.getElementById("status");
    try {
        const res = await fetch(`/cars/${id}`, { method: "DELETE" });
        if (res.status === 204) {
            statusEl.textContent = `Car ${id} removed.`;
        } else {
            throw new Error(msg.error || `HTTP ${res.status}`);
        }
    } catch (err) {
        console.error(err);
        statusEl.textContent = `Error while removing: ${err.message}`;
    }
}

async function updateCar(id, data){
    const statusEl = document.getElementById("status");
    try{
        const res = await fetch(`/cars/${id}`, {
            method: "PATCH",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(data),
        });
        if(!res.ok){
            const msg = await res.json().catch( () => ({}));
            throw new Error(msg.error || `HHTP $(res.status)`);
        }
        statusEl.textContent = `Car ${id} has been updated!`;
    } catch (err) {
        console.error(err);
        statusEl.textContent = `Error while refreshing ${err.message}`;
    }
}

// Wenn die Webseite (das HTML) komplett vom Browser geladen wurde, 
// rufen wir automatisch unsere Funktion auf, um die Bücher zu holen!
window.addEventListener("DOMContentLoaded", fetchCars);