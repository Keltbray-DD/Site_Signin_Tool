let localEmail;
let localPhone;
let localFirstName;
let localLastName;
let localVehicleReg;

document.addEventListener('DOMContentLoaded', function() {
    checkURL()})

async function submitRequest(){
    result = await submitSign()
    localEmail = localStorage.getItem("localEmail");
    localPhone = localStorage.getItem("localPhone");
    localFirstName = localStorage.getItem("localFirstName");
    localLastName = localStorage.getItem("localLastName");
    localVehicleReg = localStorage.getItem("localVehicleReg");

    // If device is not remembered, prompt user to remember it
    if (!localEmail || !localFirstName || !localLastName || !localPhone) {
        var remember = confirm("Do you want to remember your details for future sign ins?");
        if (remember) {
              
            localFirstName = $("#firstName").val(),
            localLastName = $("#lastName").val(),
            localEmail = $("#Email").val(),
            localPhone = $("#Phone").val(),
            localVehicleReg = $("#VehicleReg").val(),

            localStorage.setItem("localFirstName", localFirstName);
            localStorage.setItem("localLastName", localLastName);
            localStorage.setItem("localEmail", localEmail);
            localStorage.setItem("localPhone", localPhone);
            localStorage.setItem("localVehicleReg", localVehicleReg);
        }
    }
    alert("You have successfully "+result.signType+" at "+result.time)
    if(result.signType == "Signed Out"){
        document.getElementById("inputForm").reset();
    }
}

async function populateProjectDropdown(){
    let projectList
    projectList = await getProjectList()

    const projectDropdown = document.getElementById('project_input');
    projectDropdown.innerHTML = '<option value=""></option>'
    projectList.forEach(project => {
      const option = document.createElement('option');
      option.text = project.code+" - "+project.name;
      option.value = project.code;
      projectDropdown.add(option);
    });
}
async function getProjectList(scopeInput){

    const bodyData = {
        scope: scopeInput,
        };
    
    const headers = {
        'Content-Type':'application/json'
    };
    
    const requestOptions = {
        method: 'GET',
        headers: headers,
        //body: JSON.stringify(bodyData)
    };
    
    const apiUrl = "https://prod-04.uksouth.logic.azure.com:443/workflows/0486d5b3e7f04ea6aede5d4f23859693/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XaJVCfc5P4za3t2zmNDxGl3xlMdn-i90QaQnd4f9VW4";
    //console.log(apiUrl)
    //console.log(requestOptions)
    data = await fetch(apiUrl,requestOptions)
        .then(response => response.json())
        .then(data => {
            const JSONdata = data
    
        //console.log(JSONdata)
    
        return JSONdata
        })
        .catch(error => console.error('Error fetching data:', error));
        
    return data
    }
    async function submitSign(){

        const bodyData = {
            "project": sessionStorage.getItem("projectID"),
            "firstName": $("#firstName").val(),
            "lastName": $("#lastName").val(),
            "email": $("#Email").val(),
            "phone": $("#Phone").val(),
            "vehicleReg": $("#VehicleReg").val(),
            "distanceTravelled": $("#DistanceTravelled").val()
            };
        
        const headers = {
            'Content-Type':'application/json'
        };
        
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData)
        };
        
        const apiUrl = "https://prod-00.uksouth.logic.azure.com:443/workflows/6230f8c2fd794b1c8360c5fdb45cdf7b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fhXNM7ZMDd2AqE8W9dkly9RBOrsM1kNV7B918DZ_C2Q";
        console.log(apiUrl)
        console.log(requestOptions)
        data = await fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
                const JSONdata = data
        
            console.log(JSONdata)
        
            return JSONdata
            })
            .catch(error => console.error('Error fetching data:', error));
            
        return data
        }
function checkURL(){
        // Get the query string portion of the URL
        var queryString = window.location.search;

        // Check if the query string contains an 'id' parameter
        if (queryString.includes('id=')) {
            console.log('The URL contains an Project ID parameter');
            getProjectFromURL()
        } else {
            console.log('The URL does not contain an Project ID parameter');
            alert("No project code detected please check link provided has a Project code in the URL")
        }
    }

async function getProjectFromURL(){
        // Get the URL of the current page
        var url = window.location.href;
        var header = document.getElementById('main_header')
        console.log(header)
        // Check if the URL contains a parameter named 'id'
        if (url.indexOf('id=') !== -1) {
            // Extract the value of the 'id' parameter
            var id = url.split('id=')[1];
    
            // Display the extracted ID
            console.log('Extracted ID:', id);
            sessionStorage.setItem("projectID",id)
            header.innerHTML = `<h1>Keltbray Site Sign In/Out <br>${id} </h1>`
        } else {
            console.log('No ID parameter found in the URL');
        }
      }
