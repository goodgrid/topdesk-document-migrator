import axios from 'axios'
import fs from 'fs';
import https from 'https'
import Config from './config.js'

const pageSize = 2;
const operatorGroup = "1022cc4d-99f6-57c3-9446-5845db18ab83";
const returnFields = "id,number,caller.dynamicName,attachments,briefDescription,category.name,subcategory.name,callType.name"

const topdeskApi = axios.create({
    headers: {
        Authorization: `Basic ${Buffer.from(Config.tdUsername + ":" + Config.tdAppPassword).toString("base64")}`
    },
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });

  

class Topdesk {
    async getIncidents(fiql) {
        return topdeskApi.get(`${Config.tdBaseUrl}/incidents`, {
            params: {
                page_size: pageSize,
                operator_group: operatorGroup,
                $fields: returnFields,
                use_standard_response: true,
                //order_by: "creation_date+ASC"
            }
        })
        .then(response => {
            return response.data.map(async incident => {
                return {
                    id: incident.id,
                    nummer: incident.number,
                    description: incident.briefDescription,
                    employee: incident.caller.dynamicName,
                    category: incident.category.name,
                    subCategory: incident.subcategory.name,
                    attachments: await this.getAttachments(incident.id)
                }
            })
        })
        .catch(error => {
            throw new Error(error)
        })
    }
    async getAttachments(incidentId) {
        //console.log("getting attacments for " + incidentId) 
        return topdeskApi.get(`${Config.tdBaseUrl}/incidents/id/${incidentId}/attachments`)
        .then(response => {
            if (response.data.length > 0) {
                return response.data.map(attachment => {
                    //console.log(attachment)
                    return {
                        id: attachment.id,
                        fileName: attachment.fileName
                    }
                })    
            } else {
                return []
            }
        })
        .catch(error => {
            console.log(error)
        })

    }
    downloadAttachments(folder,incidentId,fileName,attachmentId) {
        topdeskApi.get(`${Config.tdBaseUrl}/incidents/id/${incidentId}/attachments/${attachmentId}/download`,{
            responseType: 'arraybuffer'
        })
        .then(response => {
            fs.promises.writeFile(`./${folder}/${fileName}`,response.data)
        })
        .catch(error => {
            console.log(error.response)
        })
    }

}

export default Topdesk