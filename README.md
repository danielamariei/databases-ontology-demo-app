Demo App for the DBMSs Ontology (databases-ontology)

## Introduction
The purpose of this application is to provide a demo for the usage of the Database Management Systems Ontology (DBMSs Ontology) ontology.
It provides an interactive comparison of different characteristics of interest for several databases.

For more details regarding the DBMSs Ontology please consult the dedicated repository: https://github.com/danielamariei/databases-ontology/.

## Running the application
### Prerequisites
In order to run the application on your system you need to have installed on your system the following dependencies:
#### Stardog
Consult the Stardog documentation in order to install it: http://www.stardog.com/docs/.

After the installation you need to do the following -- consult the documentation for more details:
* Create a new database called **databases-ontology**;
* Import the TBox for the DBMSs Ontology: https://raw.githubusercontent.com/danielamariei/databases-ontology/master/tbox/databases-ontology.ttl;
* Import the ABox for the DBMSs Ontology: https://raw.githubusercontent.com/danielamariei/databases-ontology/master/abox/databases-ontology.ttl;
* Star the server in order to accept requests from the application.

The database name, credentials, and default port of the installation should be synchronized with those from the **databases-ontology-comparison.js** 
file. Implicitly, it should be -- if the previous steps are followed.

#### Node
Install node: https://nodejs.org/en/.

#### Bower 
Install bower: https://bower.io/.

### Download the dependencies

* Clone the current repository;
* Change the current folder in the terminal to the project root directory;
* Run **npm install**;
* Run **bower install**;
* Start the node server using the following instructions: https://expressjs.com/en/starter/generator.html; execute only the instructions required to start the server for your specific platform and ignore the rest.


### Start the application

Access the application URL in your browser: http://localhost:3000.
