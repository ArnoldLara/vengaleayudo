function initDB(){
    let request = indexedDB.open('FuelConsumption',1);
    request.onupgradeneeded = function(event) {
        let db = event.target.result;

        if(!db.objectStoreNames.contains("register")){
            let store = db.createObjectStore('register', { keyPath: 'id', autoIncrement:true });
            store.createIndex('date', 'date', { unique: false });
            store.createIndex('distance', 'distance', { unique: false });
            store.createIndex('fuelAmount', 'fuelAmount', { unique: false });
            store.createIndex('price', 'price', { unique: false });
            store.createIndex('fuelConsumption', 'price', { unique: false });
        } 
    };
    request.onsuccess = function(event) {
        console.log("Database initialized successfully");
        displayData()
        
    };

    request.onerror = function(event) {
        console.error("Error initializing database:", event.target.error);
    };
}

function displayData(){

    //Se abre la base de datos
    let request = indexedDB.open('FuelConsumption', 1);

    request.onsuccess = function(event){

        let db = event.target.result;
        // Create transaction and get object store
        let transaction = db.transaction(['register'], 'readonly');
        let store = transaction.objectStore('register');
        
        // Get all records from store
        let getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = function() {
            let records = getAllRequest.result;
            //console.log("Funcion de imprimir, records:", records.length);
            
            //Validación para que solo se muestre la tabla de registros solo si hay registros guardados
            if(records.length > 0){
                records.sort((a, b) => {
                    return b.id - a.id;
                });
                // Sort records by date
                // Create table HTML
                //let table = '<table border="1" class="table"><tr><th>Fecha</th><th>Distancia(km)</th><th>Combustible(gal)</th><th>Rendimiento(km/gal)</th></tr>';
                let table = '<table border="1" class="table"><tr><th>Fecha</th><th>Distancia</th><th>Combustible</th><th>Rendimiento</th></tr>';
                // Add row for each record
                records.forEach(record => {
                    table += `<tr>
                        <td>${record.date}</td>
                        <td>${record.distance}</td>
                        <td>${record.fuelAmount}</td>
                        <td>${record.fuelConsumption}</td>
                    </tr>`;
                });
                
                table += '</table>';
                
                // Display table in document
                document.getElementById('dataTable').innerHTML = table;
            //Si no hay registros se borra la tabla que esta siendo mostrada
            }else{
                document.getElementById('dataTable').innerHTML = "";
                return records.length
            }
            
            
        };
        
        getAllRequest.onerror = function(event) {
            console.error("Error getting records:", event.target.error);
        };
        } 
}

function calculateConsumption(keyPath,date,distance,fuel){
    let request = indexedDB.open('FuelConsumption', 1);
    request.onsuccess = function(event){
        let db = event.target.result;
        let transaction = db.transaction(['register'], 'readwrite');
        let store = transaction.objectStore('register');
        let request = store.get(keyPath-1);
        request.onsuccess = function(event){
            let last = event.target.result;

            //Validación si no hay datos en la tabla que no se intente calcular el rendimiento de combustible
            if(event.target.result == undefined){
                displayData()
            }else{
                let consumption = (distance - last.distance) / fuel;
                consumption = consumption.toFixed(2);
                // updateConsumption(keyPath,date,distance,fuel,consumption);

                let request = indexedDB.open('FuelConsumption', 1);
                request.onsuccess = function(event){
                    let db = event.target.result;
                    let transaction = db.transaction(['register'], 'readwrite');
                    let store = transaction.objectStore('register');
                    let updateRequest = store.put({ id: keyPath,date: date, distance: distance, fuelAmount: fuel, fuelConsumption: consumption });
                    updateRequest.onsuccess = function(event) {
                        console.log("Registro de consumo actualizado en BD",event.target.result);

                        let msg_consum = "El consumo de combustible es de "+ consumption + " km/galon" ;
                        // Display table in document
                        document.getElementById('msg_consum').innerHTML = msg_consum;

                        displayData()
                    };  
                }

                        
            }
             
        }
        request.onerror = function(event){
            console.error("Error al leer el registro solicitado:", event.target.error);
        }
    }
}

function getLastRecord(callback){
    
    //Se abre la base de datos
    let request = indexedDB.open('FuelConsumption', 1);

    //Evaluación si la operación fue correcta
    request.onsuccess = function(event){
        let db = event.target.result;
        let transaction = db.transaction(['register'], 'readonly');
        let store = transaction.objectStore('register');
        
        let getAllRequest = store.getAll();
        getAllRequest.onsuccess = function(event){
            let records = event.target.result;
            let last = records[records.length-1];
            callback(last);
        }
    }
}

function deleteRegister(keyPath){
    let request = indexedDB.open('FuelConsumption', 1);
    request.onsuccess = function(event){
        let db = event.target.result;
        let transaction = db.transaction(['register'], 'readwrite');
        let store = transaction.objectStore('register');
        let del_request = store.delete(keyPath);
        del_request.onsuccess = function(event) {
            console.log("Registro eliminado de BD", event.target);
        };
        del_request.onerror = function(event){
            console.error("Error al eliminar el registro solicitado:", event.target.error);
        }
    }
}

function updateConsumption(keyPath,date,distance,fuel,consumption){
    let request = indexedDB.open('FuelConsumption', 1);
    request.onsuccess = function(event){
        let db = event.target.result;
        let transaction = db.transaction(['register'], 'readwrite');
        let store = transaction.objectStore('register');
        let updateRequest = store.put({ id: keyPath,date: date, distance: distance, fuelAmount: fuel, fuelConsumption: consumption });
        updateRequest.onsuccess = function(event) {
            console.log("Registro de consumo actualizado en BD",event.target.result);

            let msg_consum = "El consumo de combustible es de "+ consumption + " km/galon" ;
            // Display table in document
            document.getElementById('msg_consum').innerHTML = msg_consum;

            displayData()
        };  
    }

    
}

// Initialize the database and display when page loads
document.addEventListener('DOMContentLoaded', initDB())

//Se crea el evento para leer el evento de Click en el boton de guardar
document.getElementById('addRegisters').onclick=function(){
    //new Date(); Obtiene fecha en formato: Tue Nov 26 2024 21:26:45 GMT-0500 (Colombia Standard Time)
    //new Date().toJSON(): Da formato a la feche de la siguiente manera: 2024-11-26T11:06:50.369Z
    //slice solo obtiene los 10 primeros caracteres dejando la fecha 2024-11-26
    let date = new Date().toJSON().slice(0, 10)
    //console.log(date);
    //Lectura de los valores registrados
    let distance = document.getElementById('distance').value;
    let fuel = document.getElementById('fuel').value;

    getLastRecord(function(keyPath){
        //console.log("Last record:", keyPath);
        if(keyPath==undefined){
            console.log("No hay registros en la tabla");
            if(Number(distance)>-1){
                //Se abre la base de datos
                let request = indexedDB.open('FuelConsumption', 1);

                //Si la apertura es exitosa 
                request.onsuccess = function(event) {
                    //Se crea una transacción de escritura para registrar la información
                    let db = event.target.result;
                    let transaction = db.transaction(['register'], 'readwrite');
                    let store = transaction.objectStore('register');

                    //Se crea un objeto con los datos regitrados en el formulario
                    let register = {
                        date: date,
                        distance: distance,
                        fuelAmount: fuel,
                        fuelConsumption: "NA"
                    };
                    //Se escribe en la base de datos el objeto creado
                    let request = store.add(register);
                    

                    //Si la escritura es correcta se muestra un mensaje de exito
                    request.onsuccess = function(event) {
                        //Se limpian los campos del formulario
                        document.getElementById('distance').value = "";
                        document.getElementById('fuel').value = "";
                        console.log("Registro agregado correctamente con ID:",event.target.result);
                        displayData()
                        
                        
                    };
                    //si hay errores en la escritura se muestra el error
                    request.onerror = function(event) {
                        console.error("Error adding register:", event.target.error);
                    };
                }  
                request.onerror = function(event) {
                    console.error("Error opening database:", event.target.error);
                };
      
            }
            else{
                alert("El primer registro de Distancia Odometro no puede ser un numero negativo")
            }
           

        }
        else if(Number(distance)-Number(keyPath.distance) > 0){
            if(Number(fuel)>0){
                //Se abre la base de datos
                let request = indexedDB.open('FuelConsumption', 1);

                //Si la apertura es exitosa 
                request.onsuccess = function(event) {
                    //Se crea una transacción de escritura para registrar la información
                    let db = event.target.result;
                    let transaction = db.transaction(['register'], 'readwrite');
                    let store = transaction.objectStore('register');

                    //Se crea un objeto con los datos regitrados en el formulario
                    let register = {
                        date: date,
                        distance: distance,
                        fuelAmount: fuel,
                        fuelConsumption: "NA"
                    };
                    //Se escribe en la base de datos el objeto creado
                    let request = store.add(register);
                    

                    //Si la escritura es correcta se muestra un mensaje de exito
                    request.onsuccess = function(event) {
                        //Se limpian los campos del formulario
                        document.getElementById('distance').value = "";
                        document.getElementById('fuel').value = "";

                        console.log("Registro agregado correctamente con ID:",event.target.result);


                        //Se envia a la función de calcular el consumo el keypath donde se guardaron los registros, la distancia registrada y la cantidad de combustible registrada
                        calculateConsumption(event.target.result,date,distance,fuel)
                        
                        
                    };
                    //si hay errores en la escritura se muestra el error
                    request.onerror = function(event) {
                        console.error("Error adding register:", event.target.error);
                    };
                };
                request.onerror = function(event) {
                    console.error("Error opening database:", event.target.error);
                };

            }else{
                alert("El valor de combustible debe ser un numero mayor a Cero.")
            }
            



        }else{
            // alert("La distancia Odemetro ingresada es menor a la ultima distancia registrada o galones de gasolina es cero")
            alert("El valor de distancia Odemetro debe ser mayor a la ultima registrada")
            
            //Esta condición es cuando el usuario ha ingresado una distancia menor que la ultima registrada
            //Se intenta borrar el registro del usuario y funciona pero entre en conflicto cuando el usuario hace un nuevo registro con la validación hecha para cuando la tabla no tiene registros porque se retorna undefined
            //Por lo que se sobreescribe el registro del usuario con uno anterior y se borra el dato anterior, de esta manera no da problemas
            // updateConsumption(keyPath,last.date,last.distance,last.fuelAmount,last.fuelConsumption);
            // deleteRegister(keyPath-1);
            // displayData()
        } 

    })

    
}



document.getElementById('delRegisters').onclick = function() {
    // First confirmation
    const firstConfirm = confirm("Se borraran todos los registros.¿Deseas continuar?");
    
    if (firstConfirm) {
        // Second confirmation with more emphasis
        const secondConfirm = confirm("WARNING: Esta acción no se puede revertir. ¿Quieres borrar todos los registros?");
        
        if (secondConfirm) {
            // Proceed with deletion
            let request = indexedDB.open('FuelConsumption', 1);
            
            request.onsuccess = function(event) {
                let db = event.target.result;
                let transaction = db.transaction(['register'], 'readwrite');
                let store = transaction.objectStore('register');
                
                // Clear the store
                let clearRequest = store.clear();
                
                clearRequest.onsuccess = function() {
                    
                    // Refresh the display
                    let msg_consum = "" ;
                    document.getElementById('msg_consum').innerHTML = msg_consum
                    displayData();
                    alert("Los registros han sido eliminados");
                };
                
                clearRequest.onerror = function(event) {
                    alert("Error deleting records: " + event.target.error);
                };
            };
        }
    }
};

document.getElementById('updRegisters').onclick = function() {
    getLastRecord(function(keyPath) {
        if(keyPath!=undefined){
            let date = new Date().toJSON().slice(0, 10);
            let distance = document.getElementById('distance').value;
            let fuel = document.getElementById('fuel').value;

            if(Number(distance) > 0){

                if(Number(fuel) > 0){
                    calculateConsumption(keyPath.id, date, distance, fuel);
                    //Se limpian los campos del formulario
                    document.getElementById('distance').value = "";
                    document.getElementById('fuel').value = "";
                }else{
                    alert("El valor de combustible debe ser un numero mayor a Cero.")
                }
                
            }
            else{
                alert("El valor de distancia Odemetro debe ser mayor a la ultima registrada")

            }
            
            
        }
        
    });
}