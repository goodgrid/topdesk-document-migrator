import Topdesk from './topdeskApi.js'
import fs from 'fs'
import path from 'path'

const topdesk = new Topdesk()

topdesk.getIncidents()
.then(incidents => {
    Promise.all(incidents)
    .then(incidents => {
        incidents.forEach(incident => {
            getFolder(".",incident.id)
            .then(folder => {

                console.log("created folder", folder)
                //incident.attachments.forEach(attachment => {
                //    topdesk.downloadAttachments(folder,incident.id,attachment.fileName,attachment.id)
                //})    
            })
            
        })    
    })
})
.then(result => {
    console.log("Finished")
})
.catch(error => {
    console.log(error)
})


const getFolder = ((root,folderName) => {
    return new Promise((resolve, reject) => {
        fs.promises.stat(path.join(root,folderName))
        .then(() => {
            console.log("returning existing folder")
            return path.join(root,folderName)
        })
        .catch(err => {
            if (err.code === 'ENOENT') {
                console.log("returning new folder")
                return fs.promises.mkdir(path.join(root,folderName))
            } else {
                throw err;
            }    
        })
    
    })
})