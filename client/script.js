
const routerPath = "/api/superheroes";
const routerPath2 = "/db/heroes";

///limit/:number?/:pattern/:name

function validateInt(intCheck,stringCheck){
    console.log(intCheck)
  
    if(intCheck != parseInt(intCheck)){
        alert("Input Must Be An Integer!");
        return false;
    }
    
    else{
        return true;
    }

}

function isAlphabetical(input) {
    const regex = /^[\p{L} ]+$/u;
    if(!regex.test(input)){
        alert("Input incorrect format")
    }
    return regex.test(input);
  }

  function isInteger(input) {
    const regex = /^\p{Nd}+$/u;
    if(!regex.test(input)){
        alert("Input incorrect format")
    }
    return regex.test(input);
  }
  
  
// function validateString(stringCheck){
//     console.log(stringCheck)
//     console.log(typeof(stringCheck))
//     if(stringCheck !== String(stringCheck)){
//         alert("Input Must Be String!")
//         return false;
//     }
//     else{
//         console.log("is a string")
//         return true;
//     }

// }

function getLimitedSearch() {

    var numberResults = (document.getElementById("number-return").value);
    var patternReq = (document.getElementById("search-by-given").value);
    var nameReq = (document.getElementById("value-to-search").value);

    
    if(isInteger(numberResults) && isAlphabetical(nameReq) && isAlphabetical(patternReq)){
        fetch(`/api/superheroes/limit/${numberResults}/${patternReq}/${nameReq}`)
            .then(res => res.json()
                .then(dataID => {
                    console.log(dataID);
                    var divIds = document.createElement('div');
                    divIds.className = "div-ids";
                    var header = document.createElement('h2');
                    header.textContent = `${patternReq}: ${nameReq}`;
                    divIds.appendChild(header);
                    for (num of dataID) {
                        var pForId = document.createElement('p');
                        pForId.textContent = `${num}`;
                        divIds.appendChild(pForId);
                    }
                    var result = document.getElementById('result');
                    result.appendChild(divIds);
                })
            )
    }
}

function getSuperHeroByField() {
    var value = document.getElementById("field-input").value;
    var parsedValue = String(value);
    if(isAlphabetical(value)){ 
        fetch(`${routerPath}/field/${parsedValue}`)
            .then(res => res.json() //used to send JSON response, pass json object as arguement, converted to json string 
                .then(fieldData => {
                    console.log(fieldData);
                    var result = document.getElementById("result");
                    var divForSearchField = document.createElement('div');
                    
                    
                    //headerForFields.className = "header-info";
                    for (info of fieldData) {
                        for (v in info) {
                            console.log(v.name,v)
                            if(v == "name" || v == "id"){
                                var headerForFields = document.createElement('h2');
                                headerForFields.textContent = `${info[v]}, `
                                divForSearchField.appendChild(headerForFields);
                            }
                            else{
                                var pForField = document.createElement('p');
                                pForField.textContent = `${v}: ${info[v]}, `;
                                divForSearchField.appendChild(pForField);
                            }
                        }
                    }
                   
                    
                    result.appendChild(divForSearchField);

                })
                .catch((e) => {
                    console.log(e)
                })

            )
            .catch(e => console.log(e))
        }
}

function getSuperheroById() {
    var idToReq = document.getElementById("id-input").value;
    var parsed = parseInt(idToReq);

    if(isInteger(idToReq)){
        fetch(`/api/superheroes/${parsed}`)
            .then(res => res.json() //used to send JSON response, pass json object as arguement, converted to json string 
                .then(data => {
                    var divForSearchID = document.createElement('div');
                    divForSearchID.className = "heroes-id-div";
                    var result = document.getElementById("result");
                    let elements = Array.from(result.getElementsByTagName("h2"));
           
                    var headerName = document.createElement('h2');
                    var pForInfo = document.createElement('p');
                    headerName.textContent = `${data.name}`;

                    pForInfo.textContent = `Gender:${data.Gender} Eye color:${data['Eye color']} Race:${data.Race} Hair Colour:${data['Hair color']} Height:${data.Height} Publisher:${data.Publisher} Skin colour:${data['Skin color']} Alignment:${data.Alignment} Weight:${data.Weight}`;
                    divForSearchID.appendChild(headerName);
                    divForSearchID.appendChild(pForInfo);
                    //ul.appendChild(li);
                    //divForSearchID.appendChild(ul);
                    result.appendChild(divForSearchID);

                })
                .catch((e) => {
                    console.log(e)
                })
            )
            .catch(e => console.log(e))
    }

}


function getSuperHeroPower() {
    var idToReq = document.getElementById("id-input").value;
    var parsed = parseInt(idToReq);

    if(isInteger(idToReq)){
        fetch(`/api/superheroes/${parsed}/powers`)
            .then(res => res.json()
                .then(dataPower => {
                    var divResult = document.getElementById("result");
                    var divForPowers = document.createElement('div');
                    var headerForPowers = document.createElement('h2');
                    var powers = document.createElement('p');
                    headerForPowers.textContent = "POWERS:";
                    let elements = Array.from(divResult.getElementsByTagName("h2"));
                    for (value in dataPower) {
                        if (dataPower[value] != "False" && value != "hero_names") {
                            powers.textContent += `${value}, `;
                        }
                        // console.log(data)
                    }
                    divForPowers.appendChild(headerForPowers);
                    divForPowers.appendChild(powers);
                    divResult.appendChild(divForPowers);
                })
            )
    }
}

function getPublishers() {
    fetch(`${routerPath}/publisher`)
        .then(res => res.json()
            .then(publisherData => {
                var divResult = document.getElementById("result");
                divResult.innerHTML = "";
                var divPublishers = document.createElement('div');
                var publisherHeader = document.createElement('h2');
                var ulP = document.createElement('ul');
                ulP.className = "list-publishers";
                publisherHeader.className = "publisher-header";
                publisherHeader.textContent = "PUBLISHERS: ";

                for (publisher of publisherData) {
                    var liP = document.createElement('li');
                    liP.textContent = `${publisher}`;
                    ulP.appendChild(liP);
                }
                divPublishers.appendChild(publisherHeader);
                divPublishers.appendChild(ulP);
                divResult.appendChild(divPublishers);

            })
            .catch((error) => {
                console.log(error);
            })
        )
}

function createList() {
    var inputLNM = document.getElementById("create-list").value;
    if(isAlphabetical(inputLNM)){
        var requestBody = {
            "listN": `${inputLNM}`
        }
        fetch(`${routerPath}/heroes/list/create`, {
            method: 'POST', // Use 'PUT' if you need to update an existing resource
            headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(requestBody), // Convert the object to a JSON string
        })
            .then(res => res.json()
                .then(dataC => {
                    //console.log(dataC.listN)
                    var divListDisplay = document.createElement("div");
                    var h2OfCL = document.createElement("h2");
                    h2OfCL.textContent = `Created List: `
                    var pDisplay = document.createElement("p");
                    pDisplay.textContent = `Name: ${dataC.listN}`;
                    divListDisplay.appendChild(h2OfCL);
                    divListDisplay.appendChild(pDisplay);
                    document.getElementById('result').appendChild(divListDisplay);
                })
                .catch((error) => {
                    console.log(error);
                })
            )
        }
}

function deleteList() {
    var inputLNM = document.getElementById("create-list").value;
    if(isAlphabetical(inputLNM)){
        
        var requestBody = {
            "listN": `${inputLNM}`
        }
        fetch(`${routerPath}/list/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(requestBody), // Convert the object to a JSON string
        })
            .then(res => res.json()
                .then(dataDL => {
                    //console.log(dataDL)
                    var divListDisplay = document.createElement("div");
                    var h2OfCL = document.createElement("h2");
                    h2OfCL.textContent = `Deleted List: `
                    var pDisplay = document.createElement("p");
                    pDisplay.textContent = `Name: ${inputLNM}`;
                    divListDisplay.appendChild(h2OfCL);
                    divListDisplay.appendChild(pDisplay);
                    document.getElementById('result').appendChild(divListDisplay);
                })
            .catch((error) => {
                console.log(error);
            })
            )
    }
}

function addHeroes() {
    var inputL = document.getElementById("list-name").value;
    var inputN = document.getElementById("display-heroes-list-input").value;

    if(isAlphabetical(inputL) && isAlphabetical(inputN)){
        fetch(`${routerPath}/list/find/${inputN}`)
            .then(res => res.json()
                .then(infoHero => {
                //console.log(infoHero);
                    var idOfBody; var nameBody; var genderBody; var ecBody;
                    var raceBody; var hcBody; var heightBody; var pblisherB;
                    var skcBody; var alignmentBody; var weightBody; var powersBody;

                    for (info in infoHero) {
                        if (String(info) == "hero") {
                            idOfBody = `${infoHero[info].id}`;
                            nameBody = `${infoHero[info].name}`;
                            genderBody = `${infoHero[info].Gender}`;
                            ecBody = `${infoHero[info]["Eye color"]}`;
                            raceBody = `${infoHero[info].Race}`;
                            hcBody = `${infoHero[info]["Hair color"]}`;
                            heightBody = `${infoHero[info].Height}`;
                            pblisherB = `${infoHero[info].Publisher}`;
                            skcBody = `${infoHero[info]["Skin color"]}`;
                            alignmentBody = `${infoHero[info].Alignment}`;
                            weightBody = `${infoHero[info].Weight}`;
                        }
                        else {
                            powersBody = infoHero[info];
                        }
                    }         

                    const requestBody = {
                        "listN": `${inputL}`,
                        "superhero": [{
                            "id": `${idOfBody}`,
                            "name": `${nameBody}`,
                            "Gender": `${genderBody}`,
                            "Eyecolor": `${ecBody}`,
                            "Race": `${raceBody}`,
                            "Haircolor": `${hcBody}`,
                            "Height": `${heightBody}`,
                            "Publisher": `${pblisherB}`,
                            "Skincolor": `${skcBody}`,
                            "Alignment": `${alignmentBody}`,
                            "Weight": `${weightBody}`,
                            "Powers": `${powersBody}`
                        }]
                    }
                    fetch(`${routerPath}/h/add`, {
                        method: 'POST', // Use 'PUT' if you need to update an existing resource
                        headers: {
                            'Content-Type': 'application/json', // Set the content type to JSON
                        },
                        body: JSON.stringify(requestBody), // Convert the object to a JSON string
                    })
                        .then(res => res.json()
                            .then(dataH => {
                                console.log(dataH)
                                // var r = document.getElementById('result');
                                // var divL = document.createElement('div');
                                // divL.className = "box-for-list";
                                // var ul = document.createElement('ul')
                                // var li = document.createElement('li')
                                // var p = document.createElement('p')
                        
                                // for (d in dataH) {
                                //     if (String(d) == "superhero") {
                                //         console.log("in d")
                                //         console.log(d, dataH[d], dataH[d].id)
                                //         for (d2 of dataH[d]) {
                                //             p.textContent = `id: ${d2.id} name: ${d2.name} Gender: ${d2.Gender} 
                                //     Eyecolor: ${d2.Eyecolor} Race: ${d2.Race} Hair Colour: ${d2.Haircolor}
                                //     Height: ${d2.Height} Publisher: ${d2.Publisher} Skin Colour: ${d2.Skincolor}
                                //     Alignment: ${d2.Alignment} Weight: ${d2.Weight} Power: ${d2.Powers}
                                //     `
                                //         }
                                //     }
                                //     li.appendChild(p)
                                // }
                                // ul.appendChild(li);
                                // divL.appendChild(ul);
                                // r.appendChild(divL)
                            })
                            .catch((error) => {
                                console.log(error);
                            })
                        )
                })
        )
    }
}

function deleteHeroes() {
    var inputL = document.getElementById("list-name").value;
    var inputNM = String(document.getElementById("display-heroes-list-input").value);

    if(isAlphabetical(inputL) && isAlphabetical(inputNM)){
        const requestBody = {
            "listN": `${inputL}`,
            "superhero": []
        }

        fetch(`${routerPath}/delete/hero/${inputNM}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify(requestBody), // Convert the object to a JSON string
        })
            .then(res => res.json()
                .then(dataD => {
                    var divListDisplay = document.createElement("div");
                    var pDisplay = document.createElement("p");
                    pDisplay.textContent = `${dataD}`;
                    divListDisplay.appendChild(pDisplay);
                    document.getElementById('result').appendChild(divListDisplay);
                })
                .catch((error) => {
                    console.log(error);
                })
            )
    }
}
function findAList() {
    var fList = document.getElementById("find-list").value;

    if(isAlphabetical(fList)){
        fetch(`${routerPath}/heroes/lists/${fList}`)
            .then(res => res.json()
                .then(dataFind => {
                    var r = document.getElementById('result');
                    var divL = document.createElement('div');
                    divL.className = "box-for-list";
                    var header = document.createElement("h2")
                    header.textContent = `${fList}`;
                    for(obj in dataFind){
                        if(String(obj).toLowerCase() == "superhero"){
                            //console.log("inn")
                            for(value of dataFind[obj]){
                                //console.log(dataFind[obj],"mmm")

                                var p = document.createElement('p')
                                //console.log(value)
                                p.textContent = `id: ${value.id} name: ${value.name} Gender: ${value.Gender} 
                                Eye color: ${value["Eye color"]} Race: ${value.Race} Hair Colour: ${value["Hair color"]}
                                Height: ${value.Height} Publisher: ${value.Publisher} Skin Colour: ${value["Skin color"]}
                                Alignment: ${value.Alignment} Weight: ${value.Weight} Power: ${value.Powers}` 
                                divL.appendChild(p);
                            }
                        }
                    }
                    r.appendChild(header);
                    r.appendChild(divL);
                })
                .catch((error) => {
                    console.log(error);
                })
            )
    }
}

function sort() {
    // var resultBody = document.getElementById("result");

    // for(const childE of resultBody.children){
    //     console.log(childE)
    // }
    var type = String(document.getElementById("how-sort").value);
    var resultBody = document.getElementById("result");
    const sortedContainer = document.getElementById("sorted-results");

    if (type.toLowerCase() == "power") {
        let elements = Array.from(resultBody.getElementsByTagName("p"));
        elements.sort((a, b) => elements.sort((a, b) => b.textContent.length - a.textContent.length))
        sortedContainer.innerHTML = "";
        elements.forEach((element) => {
            sortedContainer.appendChild(element.cloneNode(true));
        });
    }
    else if (type.toLowerCase() == "name" || "race" || "publisher") {
        if(type.toLowerCase() == "name"){
            let elements = Array.from(resultBody.getElementsByTagName("h2"));

            elements.sort((a, b) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase()));
            sortedContainer.innerHTML = "";
            // Append the sorted elements to the sorted container
            var headerForResault = document.createElement('h2');
            headerForResault.textContent = `${type}`
            sortedContainer.appendChild(headerForResault);
            elements.forEach((element) => {
              sortedContainer.appendChild(element.cloneNode(true))
            }
            );    
  
        }
        if(type.toLowerCase() == "publisher"){
            let elements = Array.from(resultBody.getElementsByTagName("li"));

            elements.sort((a, b) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase()));
            sortedContainer.innerHTML = "";
            // Append the sorted elements to the sorted container
            var headerForResault = document.createElement('h2');
            headerForResault.textContent = `${type}`
            sortedContainer.appendChild(headerForResault);
            elements.forEach((element) => {
              sortedContainer.appendChild(element.cloneNode(true))
            }
            );   
        }
        if(type.toLowerCase() == "race"){
            let elements = Array.from(resultBody.getElementsByTagName("li"));

            elements.sort((a, b) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase()));
            sortedContainer.innerHTML = "";
            // Append the sorted elements to the sorted container
            var headerForResault = document.createElement('h2');
            headerForResault.textContent = `${type}`
            sortedContainer.appendChild(headerForResault);
            elements.forEach((element) => {
              sortedContainer.appendChild(element.cloneNode(true))
            }
            );   
        }
      
    }
    else {
        console.log("Enter a search type: name,race,publisher, or power")
    }
}





document.getElementById("field-btn").addEventListener('click', getSuperHeroByField);
document.getElementById("id-btn-info").addEventListener('click', getSuperheroById);
document.getElementById("id-btn-power").addEventListener('click', getSuperHeroPower);
document.getElementById("publishers-btn").addEventListener('click', getPublishers);
document.getElementById("btn-specific-search").addEventListener('click', getLimitedSearch);
document.getElementById("create-list-btn").addEventListener('click', createList);
document.getElementById("display-heroes-list-btn").addEventListener('click', addHeroes);
document.getElementById("delete-hero-btn").addEventListener('click', deleteHeroes);
document.getElementById("delete-list-btn").addEventListener('click', deleteList);
document.getElementById("find-list-btn").addEventListener('click', findAList);
document.getElementById("sort-btn").addEventListener('click', sort)


