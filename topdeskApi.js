import axios from 'axios'
import https from 'https'
import Config from './config.js'


const topdeskApi = axios.create({
    headers: {
        Authorization: `Basic ${Buffer.from(Config.tdUsername + ":" + Config.tdAppPassword).toString("base64")}`
    },
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });

  

class Topdesk {
    /*
        This function returns all employees and takes Topdesk pagination into account. When called initially,
        the parameter 'start' is not provided, therefor undefined and set to 0. This results in getting all
        employees, beginning at the beginning. Parameter buildingArray is also initialized as an empty array.
        When the first API call is done, it will probably get a succesful response with HTTP status code 206.
        This triggers the function to call itself with the current start index plus the configured page size and 
        the current buildingArray.

        This is repeated until the HTTP status code is 200, which indicates that there are no more persons to
        retrieve.
    */
    async getEmployees(start,buildingArray) {
        start=(start==undefined)?0:start
        buildingArray=(buildingArray==undefined)?[]:buildingArray

        console.log(start,buildingArray.length)

        return topdeskApi.get(`${Config.tdBaseUrl}/persons`,
        {params: {
            page_size: Config.apiPageSize,
            start: start
        }})
        .then(response => {
            if (response.status == 206) {
                buildingArray.push(...response.data.map(person => {
                    return {
                        id: person.id,
                        employeeNumber: person.employeeNumber,
                        name: person.dynamicName
                    }
                }).filter(person => isNaN(person.employeeNumber)==false))

                return this.getEmployees(start + Config.apiPageSize,buildingArray)
                .then(buildingArray => {
                    return buildingArray //.concat(buildingArray)
                })
                .catch(error => {
                    console.log((error.response)?error.response.data:error)
                })
                
            } else if (response.status == 200) {
                return buildingArray.concat(response.data.map(person => {
                    return {
                        id: person.id,
                        employeeNumber: person.employeeNumber,
                        name: person.dynamicName
                    }
                }).filter(person => isNaN(person.employeeNumber)==false))
            } else {
                throw new Error(response.status)
            } 
        })
        .catch(error => {
            console.log(error)
        })

    }

    /*
        This function returns the incidents logged for the given employee. The API call is configured to include
        archived tickets and only tickets assigned to a specific Operator Group.

        Topdesk does not return an empty array is there is nothing retuned, so before we can loop the results, we 
        are making an empty result set an empty array.
    */
    async getIncidents(callerId) {
        try {
            const response = await topdeskApi.get(`${Config.tdBaseUrl}/incidents`, {
                params: {
                    archived: true,
                    page_size: Config.apiPageSize,
                    operator_group: Config.incidentOperatorGroup,
                    $fields: Config.incidentFields,
                    use_standard_response: true,
                    caller: callerId,
                    //order_by: "creation_date+ASC"
                }
            });
            let responseData = (Array.isArray(response.data)) ? response.data : [];
            return responseData.map(incident => {
                return {
                    id: incident.id,
                    number: incident.number,
                    description: incident.briefDescription,
                    category: incident.category.name,
                    subcategory: incident.subcategory.name,
                };
            });
        } catch (error) {
            console.log("ERROR: " + error.message)
        }
    }
    /*
        This function returns the attachments related to the given incident. 

        Topdesk does not return an empty array is there is nothing retuned, so before we can loop the results, we 
        are making an empty result set an empty array.
    */
    async getAttachments(incidentId) {
        try {
            const response =  await topdeskApi.get(`${Config.tdBaseUrl}/incidents/id/${incidentId}/attachments`)
            let responseData = (Array.isArray(response.data)) ? response.data : [];
            return responseData.map(attachment => {
                return {
                    id: attachment.id,
                    date: attachment.entryDate,
                    filename: attachment.fileName
                }
            })
        } catch (error) {
            console.log("ERROR: " + error.message)
        }
    }

    /*
        This function returns the byte array for a attachment
    */
    getFile(incidentId,attachmentId) {
        return topdeskApi.get(`${Config.tdBaseUrl}/incidents/id/${incidentId}/attachments/${attachmentId}/download`,{
            responseType: 'arraybuffer'
        })
        .catch(error => {
            console.log(error.message)
        })
    }

}

export default Topdesk