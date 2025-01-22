export const environemnt = {
    "appCode": "ResDeeds",
    "offlineTesting": false,
    "errorMessageTime": 2000,
    "tokenTimeOutDefault": 5 * 60000, //Value * milliseconds = amount of minutes to timeout
    "app":{
        "protocol": "http",
        "url": "localhost",
        "port":"4200"
    },
    "api":{
        "protocol":"http",
        "url": "localhost",
        "port":"5000",
        "apiIdentifier": "api",
        "documentsIdentifier": "Documents"
    },
    "versionApi":{
        "protocol":"http",
        "host": "api",
        "port":"5000",
        "apiIdentifier": "api",
        "documentsIdentifier": "Documents"
    },
    "helpContactEmail": "dylan.johnson@inl.gov", 
    "defaultPasswordSubject": "Your password has been reset"
}
