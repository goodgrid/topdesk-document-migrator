# Topdesk Document Extractor

> **The status of this script is 'working concept'.** It has not beed used in a production environment yety, but will be 
> in the course of 2022. Surely, modiifcations will be done when doing so, not in the least the outstanding tasks mentioned
> in the last chapter.


## Introduction
This script is used to extract documents from Topdesk to prepare them for further migration. In my use case, 90% of the 
documents to be migrated exists on filesystem, so i chose to just download the Topdesk documents to filesystem and reuse
migration routines to get filesystem migrated to the target system.

This script was developed against Topdesk version 9.10.022-on-premises-release5-build2-20191121-2206 with API version 3.0.47. Topdesk API version are kind of spaghetti and finding the applicable documentation is hard. I used this page https://developers.topdesk.com/documentation/index-apidoc.html and selected the API version in the right upper corner. This API version has some limitations making this script not very efficient. Please also refer to some open tasks to handle the inefficiency

At the time of writing the topdesk server does not return the files for download. That seems not related to the code or the API
and is investigated on the server side.

## Configuration

The script requires a config file which is not provided. It should be named config.js and shoul have the following contents

```
    const Config = {
        tdBaseUrl: https://[topdesk-host]/tas/api,
        tdUsername: [The username to logon to Topdesk with],
        tdAppPassword: [The application password for the user],
        dossierRoot: [The directory where folders should be created and files should be written],
        apiPageSize: 5000,
        incidentOperatorGroup: [The Operator Group to fiter incidents],
        incidentFields: "id,number,attachments,briefDescription,category.name,subcategory.name"
    }
    export default Config

```

The user obviously needs permissions on the tickets. Logging in on the API is done via an Application Password which is set for
the user by logging into Topdesk with the user and the regular password, going to the profile via the upper rigght menu and scrolling
down to 'Application Password'


## Running

Initiate the script using `node ./getDocuments.js`

If you would like to run a test run on a limited amount of persons, change the call to `topdesk.getEmployees()` in getDocuments.js to provide a parameter close to the amount of persons in Topdesk, for example `topdesk.getEmployees(96300)`

## To do

- TODO: Implement rate limiting in the Topdesk API class
- TODO: Implement some progress indication
- TODO: Investigate the need to implement paging in the retrieval of incidents