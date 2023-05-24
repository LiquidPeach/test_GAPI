window.onload = handleClientLoad;
let data; // Global variable to store the data

//Submission event listener
var formElement = document.getElementById('school-form');
formElement.addEventListener('submit', handleFormSubmit);

//hashmap to data:
// let firstHash = new Map();
const firstHash = []

function initClient() {
    // Initialize the Google Sheets API client
    gapi.client.init({
        //i create this apikey on Google console 
        apiKey: 'copy and paste key in here',
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
        spreadsheetId: 'copy and paste ID',
        range: 'Sheet1!A1:Z10',
    }).then(response => {
        data = response.result.values;

        //Display data on console
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            //taking in all the first column, with all the shcool names 
            // firstHash.set (i, values[i][0])
            firstHash[i] = data[i][0]
        }

    }).catch(error => {
        console.error('Error reading data:', error);
    });
}

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

    //Option 1: create a for loop to iterate through each of the rows and find the good one. 
    for (let i = 0; i < data.length; i++) {
        //taking in all the first column, with all the shcool names 
        // firstHash.set (i, values[i][0])
        if (data[i][0] === selectedSchool) {
            console.log("you selected this school ", selectedSchool)
        }
    }
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