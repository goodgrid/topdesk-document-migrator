import Topdesk from './topdeskApi.js'
import Dossier from './dossierApi.js'
import Config from './config.js'

const topdesk = new Topdesk()
const dossier = new Dossier()

const start = 96300 //PROD: 106500 // TEST: 96300
console.log("Getting employees, starting at" + start)
topdesk.getEmployees(start) 
.then(employees => {
    /*
        For every employee, get the incidents related to it. Return the employee information
        enriched with the incidents in a nested object
    */
   console.log("Getting incidents for every employee in collection")
    return Promise.all(employees.map(async employee => {
        return {
            ...employee,
            incidents: await topdesk.getIncidents(employee.id)
        }
    }))
})
.then(employees => {
    /*
        Return only the employees with incidents related to it, so filter out every employee
        with an empty incidents array.
    */
   console.log("Filtering employees with only those having incidents")
    return employees.filter(employee => employee.incidents.length > 0)
})
.then(employees => {
    /*
        Loop over all employees' incidents and retrieve their attachments.
    */
    console.log("Getting attachments for incidents for employees")
    return Promise.all(employees.map(async employee => {
        const incidents = await Promise.all(employee.incidents.map(async incident => {
            const attachments = await topdesk.getAttachments(incident.id);
            return {
                ...incident, attachments
            }
        }));
        return { ...employee, incidents }
    }));
})
.then(employees => {
    /*
        Loop over the resulting object containing empployees, incidents and attachments and create folders, download the 
        files and write them into the folders. It appears a lot of documents cannot be downloaded. For these a placeholder
        is written.
    */
    console.log("Starting to create folders, download attachments and write them to the folders")
    employees.map(employee => {
        employee.incidents.map(incident => {
            incident.attachments.map(attachment => {

                topdesk.getFile(incident.id,attachment.id)
                .then(buffer => {
                    dossier.createFolder(`${employee.employeeNumber} - ${employee.name}/${incident.category} - ${incident.subcategory}`)
                    .then(res => {    
                        let file = (buffer)?buffer:Buffer.from("This is a placeholder for a file that could not downloaded from Topdesk")
                        let filename = (buffer)?attachment.filename:`Placeholder for ${attachment.filename}`
                        let dt = new Date(Date.parse(attachment.date))
                        dossier.writeFile(res,`${incident.number} ${dt.getFullYear()}-${dt.getMonth()+1}-${dt.getDate()} ${filename}`,file)
                    })
                    .catch(error => {
                        console.log(error)
                    })        
                })
            })
        })
    })
})
