
const routerPath = "/api/superheroes";
function getSuperheroById(){
    var idToReq = document.getElementById("id-input").value;
    var parsed = parseInt(idToReq);
    
    fetch(`/api/superheroes/${parsed}`) 
        .then(res => res.json() //used to send JSON response, pass json object as arguement, converted to json string 
        .then(data => {
                var divForSearchID = document.createElement('div');
                var ul = document.createElement('ul');
                var li = document.createElement('li');
                ul.className = "list-heroes"
                li.className = "superhero";
                var headerName = document.createElement('h2');
                var pForInfo = document.createElement('p');
                headerName.textContent = `${data.name}`;
                pForInfo.textContent = `Gender:${data.Gender} Eye color:${data['Eye color']} Race:${data.Race} Hair Colour:${data['Hair color']} Height:${data.Height} Publisher:${data.Publisher} Skin colour:${data['Skin color']} Alignment:${data.Alignment} Weight:${data.Weight}`;
                li.appendChild(headerName);
                li.appendChild(pForInfo);
                ul.appendChild(li);
                divForSearchID.appendChild(ul);
                document.getElementById("result").appendChild(divForSearchID);      
            
        })
        .catch((e)=>{
            console.log(e)
        })
            
        )
        .catch(e => console.log(e))
        
}

function getSuperHeroPower(){
    var idToReq = document.getElementById("id-input").value;
    var parsed = parseInt(idToReq);
    
    fetch(`/api/superheroes/${parsed}/powers`)
        .then(res => res.json()
        .then(dataPower => {
            var divResult = document.getElementById("result");
            var divForPowers = document.createElement('div');
            var headerForPowers = document.createElement('h2');
            var powers = document.createElement('p');
            headerForPowers.textContent = "POWERS:"; 
            divResult.innerHTML = "";
            powers.textContent = "";
            for(value in dataPower){
                if(dataPower[value] != "False" && value != "hero_names"){
                    
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

function getPublishers(){
    fetch(`${routerPath}/publisher`)
    .then(res => res.json()
    .then(publisherData => {
        var divResult = document.getElementById("result");
        var divPublishers = document.createElement('div');
        var publisherHeader = document.createElement('h2');
        var ulP = document.createElement('ul');
        ulP.className = "list-publishers";
        publisherHeader.className = "publisher-header";
        publisherHeader.textContent = "PUBLISHERS: ";

        for(publisher of publisherData){
            var liP = document.createElement('li');
            liP.textContent = `${publisher}`;
            ulP.appendChild(liP);
        }
        divPublishers.appendChild(publisherHeader);
        divPublishers.appendChild(ulP);
        divResult.appendChild(divPublishers);

    })
    .catch((error)=>{
        console.log(error);
    })
    )
}
document.getElementById("id-btn-info").addEventListener('click',getSuperheroById);
document.getElementById("id-btn-power").addEventListener('click',getSuperHeroPower);
document.getElementById("publishers-btn").addEventListener('click',getPublishers);

