var characteristicsLabels = {'http://www.semanticweb.org/ontologies/databases/tbox/label': "Database"};
var databaseCharacteristics = ['http://www.semanticweb.org/ontologies/databases/tbox/label'];
var selectedCharacteristics = [
    'http://www.semanticweb.org/ontologies/databases/tbox/label',
    'http://www.semanticweb.org/ontologies/databases/tbox/hasDataModel',
    'http://www.semanticweb.org/ontologies/databases/tbox/hasDataSchema',
    'http://www.semanticweb.org/ontologies/databases/tbox/hasLicense',
    'http://www.semanticweb.org/ontologies/databases/tbox/supportsIndexing',
    'http://www.semanticweb.org/ontologies/databases/tbox/supportsTyping'
];


// Create the options menu.
$(document).ready( function () {
    var connection = createStardogConnection();
    connection.query({
            database: queries.database,
            query: queries.selectPropertiesApplicableToDatabases,
        },
        function (data) {
            data.results.bindings.forEach(function(element) {
                uri = element["property"]["value"];
                comment = element["comment"]["value"];
                label = element["label"]["value"];

                databaseCharacteristics.push(uri);
                characteristicsLabels[uri] = label;

                $option = $('<option>', {
                    value: uri,
                    title: comment,
                    text: label,
                }).appendTo('#databasePropertiesSelect');

                if (selectedCharacteristics.includes(uri)) {
                    $option.attr('selected', true);
                }
            });

            $('#databasePropertiesSelect').multiselect({
                includeSelectAllOption: true,
                enableFiltering: true,
                enableCaseInsensitiveFiltering: true,
                buttonText: function(options, select) {
                    return "Select the characteristics included in the comparison";
                },
                onChange: function(option, checked, select) {
                    characteristic = $(option).val();

                    if (checked) {
                        if (selectedCharacteristics.includes(characteristic) === false) {
                            selectedCharacteristics.push(characteristic);
                        }
                    } else {
                        indexToRemove = selectedCharacteristics.indexOf(characteristic);
                        if (indexToRemove > -1) {
                            selectedCharacteristics.splice(indexToRemove, 1);
                        }
                    }
                },
                onSelectAll: function() {
                    selectedCharacteristics = [].concat(databaseCharacteristics);
                },
                onDeselectAll: function() {
                    selectedCharacteristics = ['http://www.semanticweb.org/ontologies/databases/tbox/label'];
                }
            });
        });
});

$(document).ready(function() {
    $("#updateDatabasesTableButton").click(function() { updateTable() });
    updateTable();
});

function updateTable() {
    var connection = createStardogConnection();
    connection.query({
            database: queries.database,
            query: constructQueryForSelectedCharacteristics(),
        },
        function (data) {
            headers = getColumnsForTable();
            cells = data.results.bindings.map(function(obj) {
                element = {};
                selectedCharacteristics.forEach(function(item, index, array) {
                    key = suffix(item);
                    element[key] = replaceUndefined(obj[key]);
                });

                return element;
            });

            $('#databasesContainer').empty();
            $('#databasesContainer').append('<table id="databases" class="display" width="100%" cellspacing="0"></table>');

            table = $('#databases').DataTable({
                "destroy": true,
                "columns": headers,
                "data": cells,
            });
        }
    );
}

function constructQueryForSelectedCharacteristics() {
    return prefixes + constructSelect() + constructWhere();
}

function constructSelect() {
    select = "SELECT DISTINCT ?database ?label ";
    placeholders = selectedCharacteristics.map(function(item, index, array) {
        return "?" + suffix(item);
    }).join(" ");

    return select + placeholders + " ";
}

function constructWhere() {
    where =  "WHERE { ?database rdf:type db:DatabaseManagementSystem . " + optional("?database rdfs:label ?label");

    selectedElements = selectedCharacteristics.map(function(item, index, array) {
        return optional("?database " + makeSparqlEntity(item) + " ?" + suffix(item));
    }).join(" ");


    return where + selectedElements + " }";
}

function getColumnsForTable() {
    columns = selectedCharacteristics.map(function(item, index, array) {
        return {data: suffix(item), title: characteristicsLabels[item]};
    });

    return columns;
}

// Helper functions

function makeSparqlEntity(data) {
    return "<" + data + ">";
}

function replaceUndefined(data) {
    if (data === undefined) {
        return "N/A";
    } else {
        return data["value"];
    }
}

function suffix(element) {
    lastIndex = element.lastIndexOf("/");
    return element.substring(lastIndex + 1);
}

function optional(element) {
    return " OPTIONAL { " + element + " } . ";
}

function createStardogConnection() {
    conn = new Stardog.Connection();
    conn.setEndpoint("http://localhost:5820/");
    conn.setCredentials("admin", "admin");
    conn.setReasoning(true);

    return conn;
}

var prefixes =
         `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
         PREFIX owl: <http://www.w3.org/2002/07/owl#>
         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
         PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
         PREFIX dbo: <http://dbpedia.org/ontology/>
         PREFIX dbp: <http://dbpedia.org/property/>
         PREFIX dbr: <http://dbpedia.org/resource/>
         PREFIX yago: <http://dbpedia.org/class/yago/>
         PREFIX db: <http://www.semanticweb.org/ontologies/databases/tbox/> `;

var queries = {
    database: "databases-ontology",

    selectPropertiesApplicableToDatabases:
         prefixes +
        `SELECT DISTINCT ?property ?range ?comment ?label
            WHERE {
                { ?property rdf:type owl:DatatypeProperty . } UNION { ?property rdf:type owl:ObjectProperty . } .
                ?property rdfs:domain db:DatabaseManagementSystem .
                ?property rdfs:comment ?comment .
                ?property rdfs:label ?label .
            }`,


    selectDatabaseCharacteristics:
        prefixes +
         `SELECT ?database ?property ?value
             WHERE {
                ?database rdf:type db:DatabaseManagementSystem .
                ?database ?property ?value .
            }`,

    selectDatabases:
        prefixes +
        `SELECT DISTINCT ?database ?concurrencyControlMechanism ?consistencyModel ?dataModel ?dataPartitioningStrategy ?dataSchema ?license ?indexing ?typing ?label
            ?dataSchemaLabel
             WHERE {
                 ?database rdf:type db:DatabaseManagementSystem .
                 OPTIONAL { ?database db:hasConcurrencyControlMechanism ?concurrencyControlMechanism } .
                 OPTIONAL { ?database db:hasConsistencyModel ?consistencyModel } .
                 OPTIONAL { ?database db:hasDataModel ?dataModel } .
                 OPTIONAL { ?database db:hasDataPartitioningStrategy ?dataPartitioningStrategy } .
                 OPTIONAL {
                    ?database db:hasDataSchema ?dataSchema .
                    ?dataSchema rdfs:label ?dataSchemaLabel .
                    } .
                 OPTIONAL { ?database db:hasLicense ?license } .
                 OPTIONAL { ?database db:supportsIndexing ?indexing } .
                 OPTIONAL { ?database db:supportsTyping ?typing } .
                 OPTIONAL { ?database rdfs:label ?label } .
             }`,

    ontologyPrefix: 'http://www.semanticweb.org/ontologies/databases/tbox/'
};

// Dev Helpers

function debug(message) {
    $('.debug').append("<pre>" + message + "</pre>");
    $('.debug').append("<br/>");
}

function dump(data) {
    debug(JSON.stringify(data, null, 4));
}
