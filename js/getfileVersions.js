async function getAccessToken(scopeInput){

const bodyData = {
    scope: scopeInput,
    };

const headers = {
    'Content-Type':'application/json'
};

const requestOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(bodyData)
};

const apiUrl = "https://prod-18.uksouth.logic.azure.com:443/workflows/d8f90f38261044b19829e27d147f0023/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=-N-bYaES64moEe0gFiP5J6XGoZBwCVZTmYZmUbdJkPk";
//console.log(apiUrl)
//console.log(requestOptions)
signedURLData = await fetch(apiUrl,requestOptions)
    .then(response => response.json())
    .then(data => {
        const JSONdata = data

    //console.log(JSONdata)

    return JSONdata.access_token
    })
    .catch(error => console.error('Error fetching data:', error));


return signedURLData
}

async function getACCVersions(AccessToken,project_id,item_id){
    const bodyData = {

    };

const headers = {
    'Authorization':"Bearer "+AccessToken,
    //'Content-Type':'application/json'
};

const requestOptions = {
    method: 'GET',
    headers: headers,
    //body: JSON.stringify(bodyData)
};

const apiUrl = "https://developer.api.autodesk.com/data/v1/projects/b."+project_id+"/items/"+item_id+"/versions";
//console.log(apiUrl)
//console.log(requestOptions)
dataReturn = await fetch(apiUrl,requestOptions)
    .then(response => response.json())
    .then(data => {
        const JSONdata = data

    return JSONdata
    })
    .catch(error => console.error('Error fetching data:', error));

return dataReturn
}

async function getCustomDetails(access_token,urns,projectID){

    const bodyData = {
        "urns":urns
        };

        const headers = {
            'Authorization':'Bearer '+access_token,
            'Content-Type': 'application/json',
        };

        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(bodyData),
        };
        const apiUrl = "https://developer.api.autodesk.com/bim360/docs/v1/projects/"+projectID+"/versions:batch-get";
        console.log(requestOptions)
        customAttributeData = fetch(apiUrl,requestOptions)
            .then(response => response.json())
            .then(data => {
            console.log(data)
            //console.log(data.access_token)
            return data.results
            })
            .catch(error => console.error('Error fetching data:', error));
        return customAttributeData
        }
// Function to extract parameters from URL
function getUrlParameter(url, parameterName) {
    parameterName = parameterName.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + parameterName + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

async function getFileVersions(projectId,entityId){
    var accessToken = await getAccessToken("data:read")
    var fileversions = await getACCVersions(accessToken,projectId,entityId)
    console.log(fileversions)
    const dataArray = Object.values(fileversions.data);

    const idsArray = dataArray.map(item => {
      return item.id;
    });
    const linksArray = dataArray.map(item => {
        return item.links.webView.href;
      });
    console.log(idsArray);
    console.log(linksArray);
    
    customData = await getCustomDetails(accessToken,idsArray,projectId);
    console.log(customData)
    // Merge URNs with the results array
    customData.forEach((object, index) => {
        object.webView = linksArray[index];
    });
    // Generate HTML for all objects in the array
  const html = customData.map(object => generateObjectHTML(object)).join('');
  
  // Display HTML in a container element (assuming you have a container with id="results-container")
  document.getElementById("results-container").innerHTML = html;
}

// Function to generate HTML for custom attributes as a table
function generateCustomAttributesHTML(customAttributes) {
    let html = "<table>";
    customAttributes.forEach(attr => {
      html += `<tr><td><strong>${attr.name}</strong></td><td>${attr.value}</td></tr>`;
    });
    html += "</table>";
    return html;
  }
  
// Function to generate HTML for each object
function generateObjectHTML(object) {
    const version = object.revisionNumber
    const fileName = object.title
    const customAttributesHTML = generateCustomAttributesHTML(object.customAttributes);
    const revision = getRevisionFromCustomAttributes(object.customAttributes);
    return `
      <div class="result">
        <h3>File Name: ${fileName} <br> ACC Version: ${version} | Revision: ${revision}</h3>
        <hr>
        ${customAttributesHTML}
        <button class="button" onclick="openInNewTab('${object.webView}')">View file version</button>
      </div>
    `;
  }
// Assuming 'object' is one of the items in your array
function getRevisionFromCustomAttributes(customAttributes) {
    for (const attribute of customAttributes) {
      if (attribute.name === 'Revision') {
        return attribute.value;
      }
    }
    return null; // Return null if 'Revision' attribute is not found
  }

// Function to open URN in a new tab
function openInNewTab(urn) {
    window.open(urn, '_blank');
  }

    // Add event listener to input field for pasting URL
    document.addEventListener('DOMContentLoaded', function() {
        const urlInput = document.getElementById('fileURL');
        urlInput.addEventListener('paste', (event) => {
            const pastedText = (event.clipboardData || window.clipboardData).getData('text');
            console.log(pastedText);
            const projectId = pastedText.match(/projects\/([0-9a-fA-F-]+)\?/)[1];
            const entityId = getUrlParameter(pastedText, 'entityId');

            console.log("Project ID:", projectId);
            console.log("Entity ID:", entityId);
            try{
                getFileVersions(projectId,entityId)
            }catch{}


        });
        })