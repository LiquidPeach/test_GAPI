window.onload = handleClientLoad;
let data; // Global variable to store the data

//Submission event listener
var formElement = document.getElementById('school-form');
formElement.addEventListener('submit', handleFormSubmit);

//hashmap to data:
const schoolMap = new Map();

function initClient() {
    // Initialize the Google Sheets API client
    gapi.client.init({
        //i create this apikey on Google console
        apiKey: '',
        clientId: '',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        readData();
    }).catch(error => {
        console.error('Error initializing API client:', error);
    });
}

function handleClientLoad() {
    // Load the Google API client library
    gapi.load('client', initClient);
}

function readData() {
    //Read data from the google sheets
    gapi.client.sheets.spreadsheets.values.get({
        //this id is unique for every sheet (is on the link)
        //NOTE:Google sheet has to be public *** you can also change the range 
        spreadsheetId: '',
        range: 'Sheet1!A1:D82',
    }).then(response => {
        data = response.result.values;

        let visited = []; // array of visited programs to avoid duplicates in map

        // loop through rows and add data to map starting at row 1 (row 0 is the column titles, so ignore)
        for (let i = 1; i < data.length; i++) {
            // school + program (e.g. UC Irvine + CS B.S.)
            let programName = data[i][0] + ' ' + data[i][1];

            // lower division courses
            let lower = data[i][2];
            
            // upper division courses
            let upper = data[i][3];

            // if this program is not already a key in the map, make it one
            if (visited.indexOf(programName) == -1) {
                schoolMap.set(programName, {Lower: [], Upper: []});
                visited.push(programName); // mark program as visited
            }
            
            // if the value is NOT undefined (an empty cell), add to courselist
            if (lower)
                schoolMap.get(programName).Lower.push(String(lower));
            if (upper)
                schoolMap.get(programName).Upper.push(String(upper));
        }
        
    }).catch(error => {
        console.error('Error reading data:', error);
    });
}

console.log(schoolMap);

function parseMapData(schoolData, listTag, division) {

    let divisionList = document.getElementById(listTag);
    divisionList.innerHTML = '';

    for (let course of schoolData[division]) {
        let list = document.createElement('li');
        
        // Highlight OR and AND, and replace special characters
        let replaceOR = course.replace(/OR/g, '<span class="or">OR</span>');
        let replaceAND = replaceOR.replace(/AND/g, '<span class="and">AND</span>');
        let replaceNL = replaceAND.replace(/\n/g, '<br>');
        
        let text = replaceNL;
        
        let subtitleHTML = '';
        // '^^' indicates a subtitle, which should have some unique styling
        let subtitleInx = replaceNL.indexOf('^^');
        // If '^^' is found, wrap the desired subtitle in a <span> element with a class. Class name is tentative
        if (subtitleInx !== -1) {
            let subttl = replaceNL.substring(2, replaceNL.indexOf('<br>'));
            subtitleHTML = '<span class="subject">' + subttl + '</span><br>';
            text = replaceNL.substring(replaceNL.indexOf('<br>') + 4, replaceNL.length);
        }
        
        // '--' indicates a sublist (a list within the main list). 
        // startSubLists contains the starting indices of every sublist in the cell
        let startSubLists = [...text.matchAll(new RegExp('--', 'gi'))].map(a => a.index);

        if (startSubLists.length > 0) {
            for (let i = 0; i < startSubLists.length; i++) {
                let sublist = document.createElement('ul');
                sublist.classList.add('sublist');
                
                // sublistData contains the content from the current sublist to the start of the next
                //                                                + 2 to disclude the '--' from the string
                let sublistData = text.substring(startSubLists[i] + 2, startSubLists[i + 1]);
                
                // To change the style of the 'title' of the sublist, get the first line break <br> in the
                // sublist data, and wrap the 'title' in a <span>
                let br = sublistData.indexOf('<br>') + 4;
                let ttl = '<span class="bold">' + sublistData.substring(0, br) + '</span>';

                // Append to the HTML of the list. If there was a '^^' found earlier, append the subtitle as well as
                // the title of the sublist. Set subtitleHTML to '' so not to append the subtitle more than once
                list.innerHTML += subtitleHTML + ttl;
                subtitleHTML = '';
                
                // Content of sublist data without the title. This will be put into <li> tags
                let content = sublistData.substring(br, sublistData.length);
                
                // Find all the line breaks in the cell. Each line of data will have its own <li> element
                let indices = [...content.matchAll(new RegExp('<br>', 'gi'))].map(a => a.index);
            
                let prev = 0;
                indices.forEach(function(value) {
                    let sublistItem = document.createElement('li');
                    sublistItem.innerHTML = content.substring(prev, value);
                    
                    if (sublistItem.innerHTML == '') return;

                    if (sublistItem.innerHTML.indexOf('--') !== -1) {
                        lastSubListIndex = sublistItem.innerHTML.indexOf('--');
                        return;
                    }
                    sublist.appendChild(sublistItem);
                    prev = value + 4;
                });
                // if loop above does not reach last course
                let sublistItem = document.createElement('li');
                sublistItem.innerHTML = content.substring(prev, content.length);
                if (sublistItem.innerHTML.length > 0)
                    sublist.appendChild(sublistItem);

                list.appendChild(sublist);
            }
        } else {
            list.innerHTML = subtitleHTML + text;
        }
        divisionList.appendChild(list);
    }
}

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent form submission

    let selectElement = document.querySelector('#school-select');
    let selectedSchool = selectElement.value; //this is the value form the options tag

    let schoolData = schoolMap.get(selectedSchool);

    // Add selected schools name as the subtitle of the page
    let subTitle = document.getElementById('school-name-subtitle');
    subTitle.innerText = selectedSchool;
    
    if (schoolData) {
        let hidden = document.querySelectorAll('details.hidden');
        for (let tag of hidden) { 
            tag.classList.remove('hidden');
        }
        parseMapData(schoolData, 'lower-division', 'Lower');
        parseMapData(schoolData, 'upper-division', 'Upper');

    } else {
        console.log('No data found for the selected school.');
    }
}