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
        apiKey: 'AIzaSyCss-4b1i0PHAQAjRwKvSN9yPADeaIQS_U',
        clientId: '964029012495-squ1jhpunge1gvnart6dqintq6qbo1ev.apps.googleusercontent.com',
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
        spreadsheetId: '1_s_TiZGaR-WHfAV5KpKr4BJq0r61UTCsEcCQJuy_OSk',
        range: 'Sheet1!A1:D82',
    }).then(response => {
        data = response.result.values;

        let visited = []; // array of visited programs to avoid duplicates in map

        for (let i = 1; i < data.length; i++) {
            let programName = data[i][0] + ' ' + data[i][1];
            let lower = data[i][2];
            let upper = data[i][3];

            // if this program is not already a key in the map, make it one
            if (visited.indexOf(programName) == -1) {
                schoolMap.set(programName, {Lower: [], Upper: []});
                visited.push(programName); // mark program as visited
            }
            
            // if the value is not undefined (an empty cell), add to courselist
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

//show data - need to change this in the future *
function showData(rowData) {
    var tableBody = document.querySelector('#data-table tbody');
    // Clear existing table body
    tableBody.innerHTML = '';

    rowData.forEach(cell => {
        var tableRow = document.createElement('tr');

        cell.forEach(value => {
            var tableCell = document.createElement('td');
            tableCell.textContent = value;
            tableRow.appendChild(tableCell);
        });

        tableBody.appendChild(tableRow);
    });
}

function handleFormSubmit(event) {
    event.preventDefault(); // Prevent form submission

    var selectElement = document.querySelector('#school-select');
    var selectedSchool = selectElement.value; //this is the value form the options tag
    console.log(selectedSchool)

    console.log("you selected this school ", selectedSchool);
    //Option2: im thinking on using a set instead ** to do not iterate trough all the schools  

    //Find the row that matches the selected school
    var rowData = data.find(row => row[0] === selectedSchool);

    if (rowData) {
        //display data
        showData([rowData]);
    } else {
        console.log('No data found for the selected school.');
    }
}